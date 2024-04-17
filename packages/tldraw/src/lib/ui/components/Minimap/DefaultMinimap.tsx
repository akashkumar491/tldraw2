import {
	ANIMATION_MEDIUM_MS,
	TLPointerEventInfo,
	Vec,
	getPointerInfo,
	normalizeWheel,
	releasePointerCapture,
	setPointerCapture,
	useEditor,
	useIsDarkMode,
} from '@tldraw/editor'
import * as React from 'react'
import { MinimapManager } from './MinimapManager'

/** @public */
export function DefaultMinimap() {
	const editor = useEditor()

	const rCanvas = React.useRef<HTMLCanvasElement>(null!)
	const rPointing = React.useRef(false)

	const minimapRef = React.useRef<MinimapManager>()

	React.useEffect(() => {
		const minimap = new MinimapManager(editor, rCanvas.current)
		minimapRef.current = minimap
		return minimapRef.current.close
	}, [editor])

	const onDoubleClick = React.useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if (!editor.getCurrentPageShapeIds().size) return
			if (!minimapRef.current) return

			const point = minimapRef.current.minimapScreenPointToPagePoint(
				e.clientX,
				e.clientY,
				false,
				false
			)

			const clampedPoint = minimapRef.current.minimapScreenPointToPagePoint(
				e.clientX,
				e.clientY,
				false,
				true
			)

			minimapRef.current.originPagePoint.setTo(clampedPoint)
			minimapRef.current.originPageCenter.setTo(editor.getViewportPageBounds().center)

			editor.centerOnPoint(point, { duration: ANIMATION_MEDIUM_MS })
		},
		[editor]
	)

	const onPointerDown = React.useCallback(
		(e: React.PointerEvent<HTMLCanvasElement>) => {
			if (!minimapRef.current) return
			const elm = e.currentTarget
			setPointerCapture(elm, e)
			if (!editor.getCurrentPageShapeIds().size) return

			rPointing.current = true

			minimapRef.current.isInViewport = false

			const point = minimapRef.current.minimapScreenPointToPagePoint(
				e.clientX,
				e.clientY,
				false,
				false
			)

			const clampedPoint = minimapRef.current.minimapScreenPointToPagePoint(
				e.clientX,
				e.clientY,
				false,
				true
			)

			const _vpPageBounds = editor.getViewportPageBounds()

			minimapRef.current.isInViewport = _vpPageBounds.containsPoint(clampedPoint)

			if (minimapRef.current.isInViewport) {
				minimapRef.current.originPagePoint.setTo(clampedPoint)
				minimapRef.current.originPageCenter.setTo(_vpPageBounds.center)
			} else {
				const delta = Vec.Sub(_vpPageBounds.center, _vpPageBounds.point)
				const pagePoint = Vec.Add(point, delta)
				minimapRef.current.originPagePoint.setTo(pagePoint)
				minimapRef.current.originPageCenter.setTo(point)
				editor.centerOnPoint(point, { duration: ANIMATION_MEDIUM_MS })
			}

			function release(e: PointerEvent) {
				if (elm) {
					releasePointerCapture(elm, e)
				}
				rPointing.current = false
				document.body.removeEventListener('pointerup', release)
			}

			document.body.addEventListener('pointerup', release)
		},
		[editor]
	)

	const onPointerMove = React.useCallback(
		(e: React.PointerEvent<HTMLCanvasElement>) => {
			if (!minimapRef.current) return
			const point = minimapRef.current.minimapScreenPointToPagePoint(
				e.clientX,
				e.clientY,
				e.shiftKey,
				true
			)

			if (rPointing.current) {
				if (minimapRef.current.isInViewport) {
					const delta = minimapRef.current.originPagePoint
						.clone()
						.sub(minimapRef.current.originPageCenter)
					editor.centerOnPoint(Vec.Sub(point, delta))
					return
				}

				editor.centerOnPoint(point)
			}

			const pagePoint = minimapRef.current.getPagePoint(e.clientX, e.clientY)

			const screenPoint = editor.pageToScreen(pagePoint)

			const info: TLPointerEventInfo = {
				type: 'pointer',
				target: 'canvas',
				name: 'pointer_move',
				...getPointerInfo(e),
				point: screenPoint,
				isPen: editor.getInstanceState().isPenMode,
			}

			editor.dispatch(info)
		},
		[editor]
	)

	const onWheel = React.useCallback(
		(e: React.WheelEvent<HTMLCanvasElement>) => {
			const offset = normalizeWheel(e)

			editor.dispatch({
				type: 'wheel',
				name: 'wheel',
				delta: offset,
				point: new Vec(e.clientX, e.clientY),
				shiftKey: e.shiftKey,
				altKey: e.altKey,
				ctrlKey: e.metaKey || e.ctrlKey,
			})
		},
		[editor]
	)

	const isDarkMode = useIsDarkMode()

	React.useEffect(() => {
		// need to wait a tick for next theme css to be applied
		// otherwise the minimap will render with the wrong colors
		setTimeout(() => {
			minimapRef.current?.render()
		})
	}, [isDarkMode])

	return (
		<div className="tlui-minimap">
			<canvas
				role="img"
				aria-label="minimap"
				ref={rCanvas}
				className="tlui-minimap__canvas"
				onDoubleClick={onDoubleClick}
				onPointerMove={onPointerMove}
				onPointerDown={onPointerDown}
				onWheel={onWheel}
			/>
		</div>
	)
}

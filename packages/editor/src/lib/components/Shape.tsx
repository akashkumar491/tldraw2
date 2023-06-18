import { Matrix2d } from '@tldraw/primitives'
import { TLShape, TLShapeId } from '@tldraw/tlschema'
import * as React from 'react'
import {
	track,
	// @ts-expect-error 'private' export
	useStateTracking,
} from 'signia-react'
import { useEditor } from '../..'
import { ShapeUtil } from '../editor/shapes/ShapeUtil'
import { useEditorComponents } from '../hooks/useEditorComponents'
import { useQuickReactor } from '../hooks/useQuickReactor'
import { useShapeEvents } from '../hooks/useShapeEvents'
import { OptionalErrorBoundary } from './ErrorBoundary'

/*
This component renders shapes on the canvas. There are two stages: positioning
and styling the shape's container using CSS, and then rendering the shape's 
JSX using its shape util's render method. Rendering the "inside" of a shape is
more expensive than positioning it or changing its color, so we use React.memo
to wrap the inner shape and only re-render it when the shape's props change. 

The shape also receives props for its index and opacity. The index is used to
determine the z-index of the shape, and the opacity is used to set the shape's
opacity based on its own opacity and that of its parent's.
*/
export const Shape = track(function Shape({
	id,
	index,
	backgroundIndex,
	opacity,
	isCulled,
}: {
	id: TLShapeId
	index: number
	backgroundIndex: number
	opacity: number
	isCulled: boolean
}) {
	const editor = useEditor()

	const { ShapeErrorFallback } = useEditorComponents()

	const events = useShapeEvents(id)

	const containerRef = React.useRef<HTMLDivElement>(null)
	const backgroundContainerRef = React.useRef<HTMLDivElement>(null)

	const setProperty = React.useCallback((property: string, value: string) => {
		containerRef.current?.style.setProperty(property, value)
		backgroundContainerRef.current?.style.setProperty(property, value)
	}, [])

	useQuickReactor(
		'set shape container transform position',
		() => {
			const shape = editor.getShapeById(id)
			const pageTransform = editor.getPageTransformById(id)

			if (!shape || !pageTransform) return null

			const transform = Matrix2d.toCssString(pageTransform)
			setProperty('transform', transform)
		},
		[editor, setProperty]
	)

	useQuickReactor(
		'set shape container clip path',
		() => {
			const shape = editor.getShapeById(id)
			if (!shape) return null

			const clipPath = editor.getClipPathById(id)
			setProperty('clip-path', clipPath ?? 'none')
		},
		[editor, setProperty]
	)

	useQuickReactor(
		'set shape height and width',
		() => {
			const shape = editor.getShapeById(id)
			if (!shape) return null

			const util = editor.getShapeUtil(shape)
			const bounds = util.bounds(shape)
			setProperty('width', Math.ceil(bounds.width) + 'px')
			setProperty('height', Math.ceil(bounds.height) + 'px')
		},
		[editor]
	)

	// Set the opacity of the container when the opacity changes
	React.useLayoutEffect(() => {
		setProperty('opacity', opacity + '')
		containerRef.current?.style.setProperty('z-index', index + '')
		backgroundContainerRef.current?.style.setProperty('z-index', backgroundIndex + '')
	}, [opacity, index, backgroundIndex, setProperty])

	const shape = editor.getShapeById(id)

	if (!shape) return null

	const util = editor.getShapeUtil(shape)

	return (
		<>
			{util.renderBackground && (
				<div
					ref={backgroundContainerRef}
					className="tl-shape tl-shape-background"
					data-shape-type={shape.type}
					draggable={false}
				>
					{!isCulled && (
						<OptionalErrorBoundary
							fallback={ShapeErrorFallback ? (error) => <ShapeErrorFallback error={error} /> : null}
							onError={(error) =>
								editor.annotateError(error, { origin: 'react.shape', willCrashApp: false })
							}
						>
							<InnerShapeBackground shape={shape} util={util} />
						</OptionalErrorBoundary>
					)}
				</div>
			)}
			<div
				ref={containerRef}
				className="tl-shape"
				data-shape-type={shape.type}
				draggable={false}
				onPointerDown={events.onPointerDown}
				onPointerMove={events.onPointerMove}
				onPointerUp={events.onPointerUp}
				onPointerEnter={events.onPointerEnter}
				onPointerLeave={events.onPointerLeave}
			>
				{isCulled && util.canUnmount(shape) ? (
					<CulledShape shape={shape} util={util} />
				) : (
					<OptionalErrorBoundary
						fallback={ShapeErrorFallback ? (error) => <ShapeErrorFallback error={error} /> : null}
						onError={(error) =>
							editor.annotateError(error, { origin: 'react.shape', willCrashApp: false })
						}
					>
						<InnerShape shape={shape} util={util} />
					</OptionalErrorBoundary>
				)}
			</div>
		</>
	)
})

const InnerShape = React.memo(
	function InnerShape<T extends TLShape>({ shape, util }: { shape: T; util: ShapeUtil<T> }) {
		return useStateTracking('InnerShape:' + util.type, () => util.component(shape))
	},
	(prev, next) => prev.shape.props === next.shape.props
)

const InnerShapeBackground = React.memo(
	function InnerShapeBackground<T extends TLShape>({
		shape,
		util,
	}: {
		shape: T
		util: ShapeUtil<T>
	}) {
		return useStateTracking('InnerShape:' + util.type, () => util.renderBackground?.(shape))
	},
	(prev, next) => prev.shape.props === next.shape.props
)

const CulledShape = React.memo(
	function CulledShap<T extends TLShape>({ shape, util }: { shape: T; util: ShapeUtil<T> }) {
		const bounds = util.bounds(shape)
		return (
			<div
				className="tl-shape__culled"
				style={{
					transform: `translate(${bounds.minX}px, ${bounds.minY}px)`,
					width: bounds.width,
					height: bounds.height,
				}}
			/>
		)
	},
	() => true
)

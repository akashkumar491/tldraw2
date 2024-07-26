import {
	StateNode,
	TLEventHandlers,
	TLFrameShape,
	TLGroupShape,
	TLPointerEventInfo,
	TLShapeId,
} from '@tldraw/editor'

export class Pointing extends StateNode {
	static override id = 'pointing'

	override onEnter = () => {
		const zoomLevel = this.editor.getZoomLevel()
		const currentPageShapesSorted = this.editor.getCurrentPageShapesSorted()
		const {
			inputs: { currentPagePoint },
		} = this.editor

		const erasing = new Set<TLShapeId>()

		const initialSize = erasing.size

		for (let n = currentPageShapesSorted.length, i = n - 1; i >= 0; i--) {
			const shape = currentPageShapesSorted[i]
			if (
				this.editor.isShapeOrAncestorLocked(shape) ||
				this.editor.isShapeOfType<TLGroupShape>(shape, 'group')
			) {
				continue
			}

			if (
				this.editor.isPointInShape(shape, currentPagePoint, {
					hitInside: false,
					margin: this.editor.options.hitTestMargin / zoomLevel,
				})
			) {
				const hitShape = this.editor.getOutermostSelectableShape(shape)
				// If we've hit a frame after hitting any other shape, stop here
				if (
					this.editor.isShapeOfType<TLFrameShape>(hitShape, 'frame') &&
					erasing.size > initialSize
				) {
					break
				}

				erasing.add(hitShape.id)
			}
		}

		this.editor.setErasingShapes([...erasing])
	}

	override onLongPress: TLEventHandlers['onLongPress'] = (info) => {
		this.startErasing(info)
	}

	override onPointerMove: TLEventHandlers['onPointerMove'] = (info) => {
		if (this.editor.inputs.isDragging) {
			this.startErasing(info)
		}
	}

	override onPointerUp: TLEventHandlers['onPointerUp'] = () => {
		this.complete()
	}

	override onCancel: TLEventHandlers['onCancel'] = () => {
		this.cancel()
	}

	override onComplete: TLEventHandlers['onComplete'] = () => {
		this.complete()
	}

	override onInterrupt: TLEventHandlers['onInterrupt'] = () => {
		this.cancel()
	}

	private startErasing(info: TLPointerEventInfo) {
		this.parent.transition('erasing', info)
	}

	complete() {
		const erasingShapeIds = this.editor.getErasingShapeIds()

		if (erasingShapeIds.length) {
			this.editor.markHistoryStoppingPoint('erase end')
			this.editor.deleteShapes(erasingShapeIds)
		}

		this.editor.setErasingShapes([])
		this.parent.transition('idle')
	}

	cancel() {
		this.editor.setErasingShapes([])
		this.parent.transition('idle')
	}
}

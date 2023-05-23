import { Vec2d } from '@tldraw/primitives'
import { TLEventHandlers, UiExitHandler } from '../../../../../types/event-types'
import { StateNode } from '../../../../StateNode'
import { ShapeWithCrop, getTranslateCroppedImageChange } from './crop_helpers'

export class Idle extends StateNode {
	static override id = 'idle'

	onEnter = () => {
		this.app.setCursor({ type: 'default' })

		const { onlySelectedShape } = this.app

		// well this fucking sucks. what the fuck.
		// it's possible for a user to enter cropping, then undo
		// (which clears the cropping id) but still remain in this state.
		this.app.on('change-history', this.cleanupCroppingState)

		this.app.mark('crop')

		if (onlySelectedShape) {
			this.app.setCroppingId(onlySelectedShape.id)
		}
	}

	onExit: UiExitHandler = () => {
		this.app.setCursor({ type: 'default' })

		this.app.off('change-history', this.cleanupCroppingState)
	}

	onCancel: TLEventHandlers['onCancel'] = () => {
		this.app.setCroppingId(null)
		this.app.setSelectedTool('select.idle', {})
	}

	onPointerDown: TLEventHandlers['onPointerDown'] = (info) => {
		if (this.app.isMenuOpen) return

		if (info.ctrlKey) {
			this.app.setCroppingId(null)
			this.app.setSelectedTool('select.brushing', info)
			return
		}

		switch (info.target) {
			case 'canvas': {
				this.cancel()
				break
			}
			case 'shape': {
				if (info.shape.id === this.app.croppingId) {
					this.app.setSelectedTool('select.crop.pointing_crop', info)
					return
				} else {
					if (this.app.getShapeUtil(info.shape)?.canCrop(info.shape)) {
						this.app.setCroppingId(info.shape.id)
						this.app.setSelectedIds([info.shape.id])
						this.app.setSelectedTool('select.crop.pointing_crop', info)
					} else {
						this.cancel()
					}
				}
				break
			}
			case 'selection': {
				switch (info.handle) {
					case 'mobile_rotate':
					case 'top_left_rotate':
					case 'top_right_rotate':
					case 'bottom_left_rotate':
					case 'bottom_right_rotate': {
						this.app.setSelectedTool('select.pointing_rotate_handle', {
							...info,
							onInteractionEnd: 'select.crop',
						})
						break
					}
					case 'top':
					case 'right':
					case 'bottom':
					case 'left': {
						this.app.setSelectedTool('select.pointing_crop_handle', {
							...info,
							onInteractionEnd: 'select.crop',
						})
						break
					}
					case 'top_left':
					case 'top_right':
					case 'bottom_left':
					case 'bottom_right': {
						this.app.setSelectedTool('select.pointing_crop_handle', {
							...info,
							onInteractionEnd: 'select.crop',
						})
						break
					}
					default: {
						this.cancel()
					}
				}
				break
			}
		}
	}

	onDoubleClick: TLEventHandlers['onDoubleClick'] = (info) => {
		// Without this, the double click's "settle" would trigger the reset
		// after the user double clicked the edge to begin cropping
		if (info.phase !== 'up') return

		if (!this.app.croppingId) return
		const shape = this.app.getShapeById(this.app.croppingId)
		if (!shape) return

		const util = this.app.getShapeUtil(shape)
		if (!util) return

		if (info.target === 'selection') {
			util.onDoubleClickEdge?.(shape)
		}
	}

	onKeyDown: TLEventHandlers['onKeyDown'] = () => {
		this.nudgeCroppingImage(false)
	}

	onKeyRepeat: TLEventHandlers['onKeyRepeat'] = () => {
		this.nudgeCroppingImage(true)
	}

	onKeyUp: TLEventHandlers['onKeyUp'] = (info) => {
		switch (info.code) {
			case 'Enter': {
				this.app.setCroppingId(null)
				this.app.setSelectedTool('select.idle', {})
				break
			}
		}
	}

	private cancel() {
		this.app.setCroppingId(null)
		this.app.setSelectedTool('select.idle', {})
	}

	private cleanupCroppingState = () => {
		if (!this.app.croppingId) {
			this.app.setSelectedTool('select.idle', {})
		}
	}

	private nudgeCroppingImage(ephemeral = false) {
		const {
			app: {
				inputs: { keys },
			},
		} = this

		// We want to use the "actual" shift key state,
		// not the one that's in the app.inputs.shiftKey,
		// because that one uses a short timeout on release
		const shiftKey = keys.has('Shift')

		const delta = new Vec2d(0, 0)

		if (keys.has('ArrowLeft')) delta.x += 1
		if (keys.has('ArrowRight')) delta.x -= 1
		if (keys.has('ArrowUp')) delta.y += 1
		if (keys.has('ArrowDown')) delta.y -= 1

		if (delta.equals(new Vec2d(0, 0))) return

		if (shiftKey) delta.mul(10)

		const shape = this.app.getShapeById(this.app.croppingId!) as ShapeWithCrop
		if (!shape) return
		const partial = getTranslateCroppedImageChange(this.app, shape, delta)

		if (partial) {
			if (!ephemeral) {
				// We don't want to create new marks if the user
				// is just holding down the arrow keys
				this.app.mark('translate crop')
			}

			this.app.updateShapes([partial])
		}
	}
}

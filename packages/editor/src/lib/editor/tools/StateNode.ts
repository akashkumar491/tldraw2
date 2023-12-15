import { Atom, Computed, atom, computed } from '@tldraw/state'
import { warnDeprecatedGetter } from '@tldraw/utils'
import type { Editor } from '../Editor'
import {
	EVENT_NAME_MAP,
	TLEnterEventHandler,
	TLEventHandlers,
	TLEventInfo,
	TLExitEventHandler,
	TLPinchEventInfo,
} from '../types/event-types'

type TLStateNodeType = 'branch' | 'leaf' | 'root'

/** @public */
export interface TLStateNodeConstructor {
	new (editor: Editor, parent?: StateNode): StateNode
	id: string
	initial?: string
	children?: () => TLStateNodeConstructor[]
}

/** @public */
export abstract class StateNode implements Partial<TLEventHandlers> {
	constructor(public editor: Editor, parent?: StateNode) {
		const { id, children, initial } = this.constructor as TLStateNodeConstructor

		this.id = id
		this._isActive = atom<boolean>('toolIsActive' + this.id, false)
		this._current = atom<StateNode | undefined>('toolState' + this.id, undefined)

		this._path = computed('toolPath' + this.id, () => {
			const current = this.getCurrent()
			return this.id + (current ? `.${current.getPath()}` : '')
		})

		this.parent = parent ?? ({} as any)

		if (this.parent) {
			if (children && initial) {
				this.type = 'branch'
				this.initial = initial
				this.children = Object.fromEntries(
					children().map((Ctor) => [Ctor.id, new Ctor(this.editor, this)])
				)
				this._current.set(this.children[this.initial])
			} else {
				this.type = 'leaf'
			}
		} else {
			this.type = 'root'

			if (children && initial) {
				this.initial = initial
				this.children = Object.fromEntries(
					children().map((Ctor) => [Ctor.id, new Ctor(this.editor, this)])
				)
				this._current.set(this.children[this.initial])
			}
		}
	}

	static id: string
	static initial?: string
	static children?: () => TLStateNodeConstructor[]

	id: string
	type: TLStateNodeType
	shapeType?: string
	initial?: string
	children?: Record<string, StateNode>
	parent: StateNode

	/**
	 * This node's path of active state nodes
	 *
	 * @public
	 */
	getPath() {
		return this._path.get()
	}
	_path: Computed<string>

	/**
	 * This node's current active child node, if any.
	 *
	 * @public
	 */
	getCurrent() {
		return this._current.get()
	}
	private _current: Atom<StateNode | undefined>

	/**
	 * Whether this node is active.
	 *
	 * @public
	 */
	getIsActive() {
		return this._isActive.get()
	}
	private _isActive: Atom<boolean>

	/**
	 * Transition to a new active child state node.
	 *
	 * @example
	 * ```ts
	 * parentState.transition('childStateA')
	 * parentState.transition('childStateB', { myData: 4 })
	 *```
	 *
	 * @param id - The id of the child state node to transition to.
	 * @param info - Any data to pass to the `onEnter` and `onExit` handlers.
	 *
	 * @public
	 */
	transition = (id: string, info: any = {}) => {
		const path = id.split('.')

		let currState = this as StateNode

		for (let i = 0; i < path.length; i++) {
			const id = path[i]
			const prevChildState = currState.getCurrent()
			const nextChildState = currState.children?.[id]

			if (!nextChildState) {
				throw Error(`${currState.id} - no child state exists with the id ${id}.`)
			}

			if (prevChildState?.id !== nextChildState.id) {
				prevChildState?.exit(info, id)
				currState._current.set(nextChildState)
				nextChildState.enter(info, prevChildState?.id || 'initial')
				if (!nextChildState.getIsActive()) break
			}

			currState = nextChildState
		}

		return this
	}

	handleEvent = (info: Exclude<TLEventInfo, TLPinchEventInfo>) => {
		const cbName = EVENT_NAME_MAP[info.name]
		const x = this.getCurrent()
		this[cbName]?.(info as any)
		if (this.getCurrent() === x && this.getIsActive()) {
			x?.handleEvent(info)
		}
	}

	// todo: move this logic into transition
	enter = (info: any, from: string) => {
		this._isActive.set(true)
		this.onEnter?.(info, from)
		if (this.children && this.initial && this.getIsActive()) {
			const initial = this.children[this.initial]
			this._current.set(initial)
			initial.enter(info, from)
		}
	}

	// todo: move this logic into transition
	exit = (info: any, from: string) => {
		this._isActive.set(false)
		this.onExit?.(info, from)
		if (!this.getIsActive()) {
			this.getCurrent()?.exit(info, from)
		}
	}

	/**
	 * This is a hack / escape hatch that will tell the editor to
	 * report a different state as active (in `getCurrentToolId()`) when
	 * this state is active. This is usually used when a tool transitions
	 * to a child of a different state for a certain interaction and then
	 * returns to the original tool when that interaction completes; and
	 * where we would want to show the original tool as active in the UI.
	 *
	 * @public
	 */
	_currentToolIdMask = atom('curent tool id mask', undefined as string | undefined)

	/**
	 * @deprecated use `getCurrentToolIdMask()` instead
	 */
	// eslint-disable-next-line no-restricted-syntax
	get currentToolIdMask() {
		warnDeprecatedGetter('currentToolIdMask')
		return this._currentToolIdMask.get()
	}
	// eslint-disable-next-line no-restricted-syntax
	set currentToolIdMask(id: string | undefined) {
		warnDeprecatedGetter('currentToolIdMask')
		this._currentToolIdMask.set(id)
	}

	getCurrentToolIdMask() {
		return this._currentToolIdMask.get()
	}

	setCurrentToolIdMask(id: string | undefined) {
		this._currentToolIdMask.set(id)
	}

	/**
	 * Helper function to get the scroll offset for a given position.
	 * The closer the mouse is to the edge of the screen the faster we scroll.
	 * We also adjust the speed and the start offset based on the screen size and zoom level.
	 *
	 * @param position - The mouse position on the screen in pixels
	 * @param extreme - The width or height of the screen in pixels
	 * @param zoomLevel - The current zoom level
	 * @returns How much we should scroll in pixels
	 * @internal
	 */
	getScrollOffset(position: number, extreme: number, zoomLevel: number) {
		// Determines how far from the edges we start the scroll behaviour
		const scrollOffset = extreme < 1000 ? 50 : 30
		// Determines the base speed of the scroll
		const pxSpeed = this.editor.getEdgeScrollSpeed()
		// Determines how much the speed is affected by the screen size
		const screenSizeFactor = extreme < 1000 ? 0.8 : 1
		// Determines how much the speed is affected by the distance from the edge
		let proximityFactor = 0
		if (position < 0) {
			proximityFactor = 1
		} else if (position > extreme) {
			proximityFactor = -1
		} else if (position < scrollOffset) {
			proximityFactor = (scrollOffset - position) / scrollOffset
		} else if (position > extreme - scrollOffset) {
			proximityFactor = -(scrollOffset - extreme + position) / scrollOffset
		}
		return (pxSpeed * proximityFactor * screenSizeFactor) / zoomLevel
	}

	/**
	 * Moves the camera when the mouse is close to the edge of the screen.
	 * @public
	 */
	moveCameraWhenCloseToEdge = () => {
		if (!this.editor.inputs.isDragging || this.editor.inputs.isPanning) return

		const windowWidth = window.innerWidth
		const windowHeight = window.innerHeight
		const zoomLevel = this.editor.getZoomLevel()
		const scrollDelta = {
			x: this.getScrollOffset(this.editor.inputs.currentScreenPoint.x, windowWidth, zoomLevel),
			y: this.getScrollOffset(this.editor.inputs.currentScreenPoint.y, windowHeight, zoomLevel),
		}
		if (scrollDelta.x === 0 && scrollDelta.y === 0) return

		const camera = this.editor.getCamera()
		this.editor.setCamera({
			x: camera.x + scrollDelta.x,
			y: camera.y + scrollDelta.y,
		})
	}

	onWheel?: TLEventHandlers['onWheel']
	onPointerDown?: TLEventHandlers['onPointerDown']
	onPointerMove?: TLEventHandlers['onPointerMove']
	onPointerUp?: TLEventHandlers['onPointerUp']
	onDoubleClick?: TLEventHandlers['onDoubleClick']
	onTripleClick?: TLEventHandlers['onTripleClick']
	onQuadrupleClick?: TLEventHandlers['onQuadrupleClick']
	onRightClick?: TLEventHandlers['onRightClick']
	onMiddleClick?: TLEventHandlers['onMiddleClick']
	onKeyDown?: TLEventHandlers['onKeyDown']
	onKeyUp?: TLEventHandlers['onKeyUp']
	onKeyRepeat?: TLEventHandlers['onKeyRepeat']
	onCancel?: TLEventHandlers['onCancel']
	onComplete?: TLEventHandlers['onComplete']
	onInterrupt?: TLEventHandlers['onInterrupt']

	onEnter?: TLEnterEventHandler
	onExit?: TLExitEventHandler
}

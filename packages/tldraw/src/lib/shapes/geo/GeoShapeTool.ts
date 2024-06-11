import { StateNode, TLStateNodeConstructor } from '@tldraw/editor'
import { Idle } from './toolStates/Idle'
import { Pointing } from './toolStates/Pointing'

/** @public */
export class GeoShapeTool extends StateNode {
	static override id = 'geo'
	static override initial = 'idle'
	static override children = (): TLStateNodeConstructor[] => [Idle, Pointing]
	override shapeType = 'geo'
}

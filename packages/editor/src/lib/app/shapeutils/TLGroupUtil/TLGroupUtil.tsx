import { Box2d, Matrix2d } from '@tldraw/primitives'
import { TLGroupShape, Vec2dModel } from '@tldraw/tlschema'
import { SVGContainer } from '../../../components/SVGContainer'
import { OnChildrenChangeHandler, TLShapeUtil } from '../TLShapeUtil'
import { DashedOutlineBox } from '../shared/DashedOutlineBox'

/** @public */
export class TLGroupUtil extends TLShapeUtil<TLGroupShape> {
	static override type = 'group'

	type = 'group' as const

	hideSelectionBoundsBg = () => false
	hideSelectionBoundsFg = () => true

	canBind = () => false

	defaultProps(): TLGroupShape['props'] {
		return { opacity: '1' }
	}

	getBounds(shape: TLGroupShape): Box2d {
		const children = this.app.getSortedChildIds(shape.id)
		if (children.length === 0) {
			return new Box2d()
		}

		const allChildPoints = children.flatMap((childId) => {
			const shape = this.app.getShapeById(childId)!
			return this.app
				.getOutlineById(childId)
				.map((point) => Matrix2d.applyToPoint(this.app.getTransform(shape), point))
		})

		return Box2d.FromPoints(allChildPoints)
	}

	getCenter(shape: TLGroupShape): Vec2dModel {
		return this.bounds(shape).center
	}

	getOutline(shape: TLGroupShape): Vec2dModel[] {
		return this.bounds(shape).corners
	}

	render(shape: TLGroupShape) {
		// Not a class component, but eslint can't tell that :(
		const {
			erasingIdsSet,
			pageState: { hintingIds, focusLayerId },
			zoomLevel,
		} = this.app

		const isErasing = erasingIdsSet.has(shape.id)

		const isHintingOtherGroup =
			hintingIds.length > 0 &&
			hintingIds.some((id) => id !== shape.id && this.app.getShapeById(id)?.type === 'group')

		if (
			// always show the outline while we're erasing the group
			!isErasing &&
			// show the outline while the group is focused unless something outside of the group is being hinted
			// this happens dropping shapes from a group onto some outside group
			(shape.id !== focusLayerId || isHintingOtherGroup)
		) {
			return null
		}

		const bounds = this.bounds(shape)

		return (
			<SVGContainer id={shape.id}>
				<DashedOutlineBox className="tl-group" bounds={bounds} zoomLevel={zoomLevel} />
			</SVGContainer>
		)
	}

	indicator(shape: TLGroupShape) {
		// Not a class component, but eslint can't tell that :(
		const {
			camera: { z: zoomLevel },
		} = this.app

		const bounds = this.bounds(shape)

		return <DashedOutlineBox className="" bounds={bounds} zoomLevel={zoomLevel} />
	}

	onChildrenChange: OnChildrenChangeHandler<TLGroupShape> = (group) => {
		const children = this.app.getSortedChildIds(group.id)
		if (children.length === 0) {
			if (this.app.pageState.focusLayerId === group.id) {
				this.app.popFocusLayer()
			}
			this.app.deleteShapes([group.id])
			return
		} else if (children.length === 1) {
			if (this.app.pageState.focusLayerId === group.id) {
				this.app.popFocusLayer()
			}
			this.app.reparentShapesById(children, group.parentId)
			this.app.deleteShapes([group.id])
			return
		}
	}
}

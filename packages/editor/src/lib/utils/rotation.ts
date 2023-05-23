import { canolicalizeRotation, Matrix2d, Vec2d } from '@tldraw/primitives'
import { isShapeId, TLShapePartial } from '@tldraw/tlschema'
import { structuredClone } from '@tldraw/utils'
import { App } from '../app/App'

/** @internal */
export function getRotationSnapshot({ app }: { app: App }) {
	const {
		selectionRotation,
		selectionPageCenter,
		inputs: { originPagePoint },
		selectedShapes,
	} = app

	// todo: this assumes we're rotating the selected shapes
	// if we try to rotate shapes that aren't selected, this
	// will produce the wrong results if there are other shapes
	// selected or else break if there are none.

	return {
		selectionPageCenter: selectionPageCenter!,
		initialCursorAngle: selectionPageCenter!.angle(originPagePoint),
		initialSelectionRotation: selectionRotation,
		shapeSnapshots: selectedShapes.map((shape) => ({
			shape: structuredClone(shape),
			initialPagePoint: app.getPagePointById(shape.id)!,
		})),
	}
}

/** @internal */
export type RotationSnapshot = ReturnType<typeof getRotationSnapshot>

/** @internal */
export function applyRotationToSnapshotShapes({
	delta,
	app,
	snapshot,
	stage,
}: {
	delta: number
	snapshot: RotationSnapshot
	app: App
	stage: 'start' | 'update' | 'end' | 'one-off'
}) {
	const { selectionPageCenter, shapeSnapshots } = snapshot

	app.updateShapes(
		shapeSnapshots.map(({ shape, initialPagePoint }) => {
			// We need to both rotate each shape individually and rotate the shapes
			// around the pivot point (the average center of all rotating shapes.)

			const parentTransform = isShapeId(shape.parentId)
				? app.getPageTransformById(shape.parentId)!
				: Matrix2d.Identity()

			const newPagePoint = Vec2d.RotWith(initialPagePoint, selectionPageCenter, delta)

			const newLocalPoint = Matrix2d.applyToPoint(
				// use the current parent transform in case it has moved/resized since the start
				// (e.g. if rotating a shape at the edge of a group)
				Matrix2d.Inverse(parentTransform),
				newPagePoint
			)
			const newRotation = canolicalizeRotation(shape.rotation + delta)

			return {
				id: shape.id,
				type: shape.type,
				x: newLocalPoint.x,
				y: newLocalPoint.y,
				rotation: newRotation,
			}
		})
	)

	// Handle change

	const changes: TLShapePartial[] = []

	shapeSnapshots.forEach(({ shape }) => {
		const current = app.getShapeById(shape.id)
		if (!current) return
		const util = app.getShapeUtil(shape)

		if (stage === 'start' || stage === 'one-off') {
			const changeStart = util.onRotateStart?.(shape)
			if (changeStart) changes.push(changeStart)
		}

		const changeUpdate = util.onRotate?.(shape, current)
		if (changeUpdate) changes.push(changeUpdate)

		if (stage === 'end' || stage === 'one-off') {
			const changeEnd = util.onRotateEnd?.(shape, current)
			if (changeEnd) changes.push(changeEnd)
		}
	})

	if (changes.length > 0) {
		app.updateShapes(changes)
	}
}

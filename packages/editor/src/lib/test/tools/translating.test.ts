import { Box2d, Vec2d, VecLike } from '@tldraw/primitives'
import { TLShapeId, TLShapePartial, Vec2dModel, createCustomShapeId } from '@tldraw/tlschema'
import { GapsSnapLine, PointsSnapLine, SnapLine } from '../../app/managers/SnapManager'
import { TLShapeUtil } from '../../app/shapeutils/TLShapeUtil'
import { TldrawEditorConfig } from '../../config/TldrawEditorConfig'
import { TestApp } from '../TestApp'

import { getSnapLines } from '../testutils/getSnapLines'

type __TopLeftSnapOnlyShape = any

class __TopLeftSnapOnlyShapeUtil extends TLShapeUtil<__TopLeftSnapOnlyShape> {
	type = '__test_top_left_snap_only' as const
	static type = '__test_top_left_snap_only' as const
	defaultProps(): __TopLeftSnapOnlyShape['props'] {
		return { width: 10, height: 10 }
	}
	getBounds(shape: __TopLeftSnapOnlyShape): Box2d {
		return new Box2d(shape.x, shape.y, shape.props.width, shape.props.height)
	}
	getOutline(shape: __TopLeftSnapOnlyShape): VecLike[] {
		return [
			Vec2d.From({ x: shape.x, y: shape.y }),
			Vec2d.From({ x: shape.x + shape.props.width, y: shape.y }),
			Vec2d.From({ x: shape.x + shape.props.width, y: shape.y + shape.props.height }),
			Vec2d.From({ x: shape.x, y: shape.y + shape.props.height }),
		]
	}
	render() {
		throw new Error('Method not implemented.')
	}
	indicator() {
		throw new Error('Method not implemented.')
	}
	getCenter(shape: __TopLeftSnapOnlyShape): Vec2dModel {
		return new Vec2d(shape.x + shape.props.width / 2, shape.y + shape.props.height / 2)
	}
	snapPoints(shape: __TopLeftSnapOnlyShape): Vec2d[] {
		return [Vec2d.From({ x: shape.x, y: shape.y })]
	}
}

const configWithCustomShape = new TldrawEditorConfig({
	shapes: {
		__test_top_left_snap_only: {
			util: __TopLeftSnapOnlyShapeUtil,
		},
	},
})

let app: TestApp

afterEach(() => {
	app?.dispose()
})

const ids = {
	frame1: createCustomShapeId('frame1'),
	frame2: createCustomShapeId('frame2'),
	box1: createCustomShapeId('box1'),
	box2: createCustomShapeId('box2'),
	line1: createCustomShapeId('line1'),
	boxD: createCustomShapeId('boxD'),
	boxE: createCustomShapeId('boxE'),
	boxF: createCustomShapeId('boxF'),
	boxG: createCustomShapeId('boxG'),
	boxH: createCustomShapeId('boxH'),
	boxX: createCustomShapeId('boxX'),

	boxT: createCustomShapeId('boxT'),

	lineA: createCustomShapeId('lineA'),
}

beforeEach(() => {
	console.error = jest.fn()
	app = new TestApp()
})

const getNumSnapPoints = (snap: SnapLine): number => {
	return snap.type === 'points' ? snap.points.length : (null as any as number)
}

const getSnapPoints = (snap: SnapLine) => {
	return snap.type === 'points' ? snap.points : null
}

function assertGaps(snap: SnapLine): asserts snap is GapsSnapLine {
	expect(snap.type).toBe('gaps')
}

function getGapAndPointLines(snaps: SnapLine[]) {
	const gapLines = snaps.filter((snap) => snap.type === 'gaps') as GapsSnapLine[]
	const pointLines = snaps.filter((snap) => snap.type === 'points') as PointsSnapLine[]
	return { gapLines, pointLines }
}

const box = (id: TLShapeId, x: number, y: number, w = 10, h = 10): TLShapePartial => ({
	type: 'geo',
	id,
	x,
	y,
	props: {
		w,
		h,
	},
})

describe('When translating...', () => {
	beforeEach(() => {
		app.createShapes([
			{
				id: ids.box1,
				type: 'geo',
				x: 10,
				y: 10,
				props: {
					w: 100,
					h: 100,
				},
			},
			{
				id: ids.box2,
				type: 'geo',
				x: 200,
				y: 200,
				props: {
					w: 100,
					h: 100,
				},
			},
			{
				id: ids.line1,
				type: 'line',
				x: 100,
				y: 100,
			},
		])
	})

	it('enters and exits the translating state', () => {
		app
			.pointerDown(50, 50, ids.box1)
			.expectToBeIn('select.pointing_shape')
			.pointerMove(50, 40)
			.expectToBeIn('select.translating')
			.pointerUp()
			.expectToBeIn('select.idle')
	})

	it('exits the translating state when canceled', () => {
		app
			.pointerDown(50, 50, ids.box1)
			.pointerMove(50, 40) // [0, -10]
			.expectToBeIn('select.translating')
			.cancel()
			.expectToBeIn('select.idle')
	})

	it('translates a single shape', () => {
		app
			.pointerDown(50, 50, ids.box1)
			.pointerMove(50, 40) // [0, -10]
			.expectShapeToMatch({ id: ids.box1, x: 10, y: 0 })
			.pointerMove(100, 100) // [50, 50]
			.expectShapeToMatch({ id: ids.box1, x: 60, y: 60 })
			.pointerUp()
			.expectShapeToMatch({ id: ids.box1, x: 60, y: 60 })
	})

	it('translates multiple shapes', () => {
		app
			.select(ids.box1, ids.box2)
			.pointerDown(50, 50, ids.box1)
			.pointerMove(50, 40) // [0, -10]
			.expectShapeToMatch({ id: ids.box1, x: 10, y: 0 }, { id: ids.box2, x: 200, y: 190 })
			.pointerMove(100, 100) // [50, 50]
			.expectShapeToMatch({ id: ids.box1, x: 60, y: 60 }, { id: ids.box2, x: 250, y: 250 })
			.pointerUp()
			.expectShapeToMatch({ id: ids.box1, x: 60, y: 60 }, { id: ids.box2, x: 250, y: 250 })
	})
})

describe('When cloning...', () => {
	beforeEach(() => {
		app.createShapes([
			{
				id: ids.box1,
				type: 'geo',
				x: 10,
				y: 10,
				props: {
					w: 100,
					h: 100,
				},
			},
			{
				id: ids.box2,
				type: 'geo',
				x: 200,
				y: 200,
				props: {
					w: 100,
					h: 100,
				},
			},
			{
				id: ids.line1,
				type: 'line',
				x: 100,
				y: 100,
			},
		])
	})
	it('clones a single shape and restores when stopping cloning', () => {
		expect(app.shapeIds.size).toBe(3)
		expect(app.shapeIds.size).toBe(3)
		app.select(ids.box1).pointerDown(50, 50, ids.box1).pointerMove(50, 40) // [0, -10]
		expect(app.shapeIds.size).toBe(3)
		app.expectShapeToMatch({ id: ids.box1, x: 10, y: 0 }) // Translated A...

		// Start cloning!
		app.keyDown('Alt')
		expect(app.shapeIds.size).toBe(4)
		const newShape = app.selectedShapes[0]
		expect(newShape.id).not.toBe(ids.box1)

		app
			.expectShapeToMatch({ id: ids.box1, x: 10, y: 10 }) // A should be back to original position...
			.expectShapeToMatch({ id: newShape.id, x: 10, y: 0 }) // New node should be at A's previous position
			.pointerMove(60, 40) // [10, -10]
			.expectShapeToMatch({ id: ids.box1, x: 10, y: 10 }) // No movement on A
			.expectShapeToMatch({ id: newShape.id, x: 20, y: 0 }) // Clone should be moving

		// Stop cloning!
		app.keyUp('Alt')
		jest.advanceTimersByTime(500)

		app.expectShapeToMatch({ id: ids.box1, x: 20, y: 0 }) // A should be at the translated position...
		expect(app.getShapeById(newShape.id)).toBeUndefined() // And the new node should be gone!
	})

	it('clones multiple single shape and restores when stopping cloning', () => {
		app.select(ids.box1, ids.box2).pointerDown(50, 50, ids.box1).pointerMove(50, 40) // [0, -10]
		expect(app.shapeIds.size).toBe(3)
		app.expectShapeToMatch({ id: ids.box1, x: 10, y: 0 }) // Translated A...
		app.expectShapeToMatch({ id: ids.box2, x: 200, y: 190 }) // Translated B...

		// Start cloning!
		app.keyDown('Alt')
		expect(app.shapeIds.size).toBe(5) // Two new shapes!
		const newShapeA = app.getShapeById(app.selectedIds[0])!
		const newShapeB = app.getShapeById(app.selectedIds[1])!
		expect(newShapeA).toBeDefined()
		expect(newShapeB).toBeDefined()

		app
			.expectShapeToMatch({ id: ids.box1, x: 10, y: 10 }) // A should be back to original position...
			.expectShapeToMatch({ id: ids.box2, x: 200, y: 200 }) // B should be back to original position...
			.expectShapeToMatch({ id: newShapeA.id, x: 10, y: 0 }) // New node should be at A's previous position
			.expectShapeToMatch({ id: newShapeB.id, x: 200, y: 190 }) // New node should be at B's previous position
			.pointerMove(60, 40) // [10, -10]
			.expectShapeToMatch({ id: ids.box1, x: 10, y: 10 }) // No movement on A
			.expectShapeToMatch({ id: ids.box2, x: 200, y: 200 }) // No movement on B
			.expectShapeToMatch({ id: newShapeA.id, x: 20, y: 0 }) // Clone A should be moving
			.expectShapeToMatch({ id: newShapeB.id, x: 210, y: 190 }) // Clone B should be moving

		// Stop cloning!
		app.keyUp('Alt')

		// wait 500ms
		jest.advanceTimersByTime(500)
		app
			.expectShapeToMatch({ id: ids.box1, x: 20, y: 0 }) // A should be at the translated position...
			.expectShapeToMatch({ id: ids.box2, x: 210, y: 190 }) // B should be at the translated position...
		expect(app.getShapeById(newShapeA.id)).toBeUndefined() // And the new node A should be gone!
		expect(app.getShapeById(newShapeB.id)).toBeUndefined() // And the new node B should be gone!
	})

	it('clones a parent and its descendants and removes descendants when stopping cloning', () => {
		app.updateShapes([{ id: ids.line1, type: 'geo', parentId: ids.box2 }])
		expect(app.getShapeById(ids.line1)!.parentId).toBe(ids.box2)
		app.select(ids.box2).pointerDown(250, 250, ids.box2).pointerMove(250, 240) // [0, -10]

		expect(app.shapeIds.size).toBe(3)
		app.keyDown('Alt', { altKey: true })
		expect(app.shapeIds.size).toBe(5) // Creates a clone of B and C (its descendant)

		const newShapeA = app.getShapeById(app.selectedIds[0])!
		const newShapeB = app.getShapeById(app.getSortedChildIds(newShapeA.id)[0])!

		expect(newShapeA).toBeDefined()
		expect(newShapeB).toBeDefined()

		const cloneB = newShapeA.x === app.getShapeById(ids.box2)!.x ? newShapeA : newShapeB
		const cloneC = newShapeA.x === app.getShapeById(ids.box2)!.x ? newShapeB : newShapeA

		app
			.expectShapeToMatch({ id: ids.box2, x: 200, y: 200 }) // B should be back to original position...
			.expectShapeToMatch({ id: cloneB.id, x: 200, y: 190 }) // New node should be at A's previous position
			.expectShapeToMatch({ id: cloneC.id, x: 100, y: 100 }) // New node should be at B's previous position
			.pointerMove(260, 240) // [10, -10]
			.expectShapeToMatch({ id: ids.box2, x: 200, y: 200 }) // No movement on B
			.expectShapeToMatch({ id: cloneB.id, x: 210, y: 190 }) // Clone A should be moving
			.expectShapeToMatch({ id: cloneC.id, x: 100, y: 100 }) // New node should be at B's previous position

		// Stop cloning!
		app.keyUp('Alt')
		// wait 500ms
		jest.advanceTimersByTime(500)

		app.expectShapeToMatch({ id: ids.box2, x: 210, y: 190 }) // B should be at the translated position...
		expect(app.getShapeById(cloneB.id)).toBeUndefined() // And the new node A should be gone!
		expect(app.getShapeById(cloneC.id)).toBeUndefined() // And the new node B should be gone!
	})

	it('Clones twice', () => {
		const groupId = app.createShapeId('g')
		app.groupShapes([ids.box1, ids.box2], groupId)
		const count1 = app.shapesArray.length

		app.pointerDown(50, 50, { shape: app.getShapeById(groupId)!, target: 'shape' })
		app.expectPathToBe('root.select.pointing_shape')

		app.pointerMove(199, 199)
		app.expectPathToBe('root.select.translating')
		expect(app.shapesArray.length).toBe(count1) // 2 new box and group

		app.keyDown('Alt')

		app.expectPathToBe('root.select.translating')
		expect(app.shapesArray.length).toBe(count1 + 3) // 2 new box and group

		app.keyUp('Alt')
		jest.advanceTimersByTime(500)

		expect(app.shapesArray.length).toBe(count1) // 2 new box and group

		app.keyDown('Alt')

		expect(app.shapesArray.length).toBe(count1 + 3) // 2 new box and group
	})
})

describe('When translating shapes that are descendants of a rotated shape...', () => {
	beforeEach(() => {
		app.createShapes([
			{
				id: ids.box1,
				type: 'geo',
				x: 10,
				y: 10,
				props: {
					w: 100,
					h: 100,
				},
			},
			{
				id: ids.box2,
				type: 'geo',
				x: 200,
				y: 200,
				props: {
					w: 100,
					h: 100,
				},
			},
			{
				id: ids.line1,
				type: 'line',
				x: 100,
				y: 100,
			},
		])
	})

	it('Translates correctly', () => {
		app.createShapes([
			{
				id: ids.boxD,
				parentId: ids.box1,
				type: 'geo',
				x: 20,
				y: 20,
				props: {
					w: 10,
					h: 10,
				},
			},
		])

		const shapeA = app.getShapeById(ids.box1)!
		const shapeD = app.getShapeById(ids.boxD)!

		expect(app.getPageCenter(shapeA)).toMatchObject(new Vec2d(60, 60))
		expect(app.getShapeUtil(shapeD).center(shapeD)).toMatchObject(new Vec2d(5, 5))
		expect(app.getPageCenter(shapeD)).toMatchObject(new Vec2d(35, 35))

		const rads = 0

		expect(app.getPageCenter(shapeA)).toMatchObject(new Vec2d(60, 60))

		// Expect the node's page position to be rotated around its parent's page center
		expect(app.getPageCenter(shapeD)).toMatchObject(
			new Vec2d(35, 35).rotWith(app.getPageCenter(shapeA)!, rads)
		)

		const centerD = app.getPageCenter(shapeD)!.clone().toFixed()

		app
			.select(ids.boxD)
			.pointerDown(centerD.x, centerD.y, ids.boxD)
			.pointerMove(centerD.x, centerD.y - 10)
			.pointerMove(centerD.x, centerD.y - 10)
			.pointerUp()

		expect(app.getPageCenter(shapeD)).toMatchObject(new Vec2d(centerD.x, centerD.y - 10))

		const centerA = app.getPageCenter(shapeA)!.clone().toFixed()

		app
			.select(ids.box1)
			.pointerDown(centerA.x, centerA.y, ids.box1)
			.pointerMove(centerA.x, centerA.y - 100)
			.pointerUp()

		const centerB = app.getPageCenter(shapeA)!.clone().toFixed()

		expect(centerB).toMatchObject({ x: centerA.x, y: centerA.y - 100 })
	})
})

describe('snapping with single shapes', () => {
	beforeEach(() => {
		// 0      10     20     30
		// ┌──────┐      ┌──────┐
		// │  A   │      │  B   │
		// └──────┘      └──────┘
		app.createShapes([
			{
				id: ids.box1,
				type: 'geo',
				x: 0,
				y: 0,
				props: { w: 10, h: 10 },
			},
			{
				id: ids.box2,
				type: 'geo',
				x: 20,
				y: 0,
				props: { w: 10, h: 10 },
			},
		])
	})

	it('happens when the ctrl key is pressed', () => {
		// 0     10 11     21
		// ┌──────┐ ┌──────┐
		// │      │ │      │ <- dragging left
		// └──────┘ └──────┘
		//
		//    │
		//    │ press ctrl
		//    ▼
		//
		// 0     10      20
		// ┌──────┬──────┐
		// │      │      │  *snap*
		// └──────┴──────┘

		app.pointerDown(25, 5, ids.box2).pointerMove(16, 5)

		// expect box B to be at 11, 0
		expect(app.getShapeById(ids.box2)!).toMatchObject({ x: 11, y: 0 })

		// press ctrl key and it snaps to 10, 0
		app.keyDown('Control')
		expect(app.getShapeById(ids.box2)!).toMatchObject({ x: 10, y: 0 })

		// release ctrl key and it unsnaps
		app.keyUp('Control')
		jest.advanceTimersByTime(200)

		expect(app.getShapeById(ids.box2)!).toMatchObject({ x: 11, y: 0 })

		// press ctrl and release the pointer and it should stay snapped
		app.keyDown('Control')
		expect(app.getShapeById(ids.box2)!).toMatchObject({ x: 10, y: 0 })

		app.pointerUp(16, 5, { ctrlKey: true })
		expect(app.getShapeById(ids.box2)!).toMatchObject({ x: 10, y: 0 })
	})

	it('snaps to the center point as well as all four corners of a bounding box', () => {
		// ┌──────┐
		// │  B   │
		// └──────┘
		//         ┌──────┐
		//         │  A   │
		//         └──────┘
		app.pointerDown(25, 5, ids.box2).pointerMove(-6, -6, { ctrlKey: true })
		expect(app.getShapeById(ids.box2)!).toMatchObject({ x: -10, y: -10 })

		//         ┌──────┐
		//         │  B   │
		//         └──────┘
		// ┌──────┐
		// │  A   │
		// └──────┘
		app.pointerMove(16, -6, { ctrlKey: true })
		expect(app.getShapeById(ids.box2)!).toMatchObject({ x: 10, y: -10 })

		// ┌──────┐
		// │  A   │
		// └──────┘
		//         ┌──────┐
		//         │  B   │
		//         └──────┘
		app.pointerMove(16, 16, { ctrlKey: true })
		expect(app.getShapeById(ids.box2)!).toMatchObject({ x: 10, y: 10 })

		//         ┌──────┐
		//         │  A   │
		//         └──────┘
		// ┌──────┐
		// │  B   │
		// └──────┘
		app.pointerMove(-6, 16, { ctrlKey: true })
		expect(app.getShapeById(ids.box2)!).toMatchObject({ x: -10, y: 10 })

		// ┌──────┐
		// │  AB  │
		// └──────┘
		app.pointerMove(6, 6, { ctrlKey: true })
		expect(app.getShapeById(ids.box2)!).toMatchObject({ x: 0, y: 0 })
	})

	it('creates snap lines + points to render in the UI', () => {
		// 0     10
		// ┌──────┐  ┼
		// │      │
		// └──────┘  ┼     one line, four points
		//         │
		//         │
		//         │
		//         │11     21
		//       ┼  ┌──────┐
		//          │      │
		//       ┼  └──────┘

		app.pointerDown(25, 5, ids.box2).pointerMove(16, 35, { ctrlKey: true })
		expect(app.snaps.lines?.length).toBe(1)

		expect(getNumSnapPoints(app.snaps.lines![0])).toBe(4)
	})

	it('shows all the horizonal lines + points where the bounding boxes align', () => {
		// x─────x────────────────────x─────x
		// ┌─────┐                    ┌─────┐
		// │  x──┼────────────────────┼──x  │
		// └─────┘                    └─────┘
		// x─────x────────────────────x─────x
		app.pointerDown(25, 5, ids.box2).pointerMove(36, 5, { ctrlKey: true })

		const snaps = app.snaps.lines!.sort((a, b) => getNumSnapPoints(a) - getNumSnapPoints(b))
		expect(snaps.length).toBe(3)

		// center snap line
		expect(getNumSnapPoints(snaps[0])).toBe(2)

		// top and bottom lines
		expect(getNumSnapPoints(snaps[1])).toBe(4)
		expect(getNumSnapPoints(snaps[2])).toBe(4)
	})

	it('shows all the vertical lines + points where the bounding boxes align', () => {
		// x ┌─────┐ x
		// │ │  x  │ │
		// x └──┼──┘ x
		// │    │    │
		// x ┌──┼──┐ x
		// │ │  x  │ │
		// x └─────┘ x
		app.pointerDown(25, 5, ids.box2).pointerMove(5, 45, { ctrlKey: true })

		const snaps = app.snaps.lines!.sort((a, b) => getNumSnapPoints(a) - getNumSnapPoints(b))
		expect(snaps.length).toBe(3)

		// center snap line
		expect(getNumSnapPoints(snaps[0])).toBe(2)

		// left and right lines
		expect(getNumSnapPoints(snaps[1])).toBe(4)
		expect(getNumSnapPoints(snaps[2])).toBe(4)
	})

	it('does not snap to shapes that are not visible in the viewport', () => {
		// move A off screen
		app.updateShapes([{ id: ids.box1, type: 'geo', x: -20 }])

		app.pointerDown(25, 5, ids.box2).pointerMove(36, 5, { ctrlKey: true })
		expect(app.snaps.lines!.length).toBe(0)

		app.updateShapes([{ id: ids.box1, type: 'geo', x: app.viewportScreenBounds.w + 10 }])
		app.pointerMove(33, 5, { ctrlKey: true })

		expect(app.snaps.lines!.length).toBe(0)
		app.updateShapes([{ id: ids.box1, type: 'geo', y: -20 }])

		app.pointerMove(5, 5, { ctrlKey: true })
		expect(app.snaps.lines!.length).toBe(0)

		app.updateShapes([{ id: ids.box1, type: 'geo', x: 0, y: app.viewportScreenBounds.h + 10 }])

		app.pointerMove(5, 5, { ctrlKey: true })
		expect(app.snaps.lines!.length).toBe(0)
	})

	it('does not snap on the Y axis if the shift key is pressed', () => {
		//               ┌──────┐ ──────►
		// ┌──────┐      │  B   │ drag with shift
		// │  A   │      └──────┘
		// └──────┘

		// move B up one pixel
		app.updateShapes([{ id: ids.box2, type: 'geo', y: app.getShapeById(ids.box2)!.y - 1 }])

		app.pointerDown(25, 5, ids.box2).pointerMove(36, 5, { ctrlKey: true })

		// should snap without shift key
		expect(app.getShapeById(ids.box2)).toMatchObject({ x: 31, y: 0 })

		app.keyDown('Shift')
		// should unsnap with shift key
		expect(app.getShapeById(ids.box2)).toMatchObject({ x: 31, y: -1 })
		// and continue not snapping while moving
		app.pointerMove(45, 5, { ctrlKey: true, shiftKey: true })
		expect(app.getShapeById(ids.box2)).toMatchObject({ x: 40, y: -1 })

		// should still snap to things on the X axis
		app.createShapes([{ type: 'geo', id: ids.line1, x: 100, y: 0, props: { w: 10, h: 10 } }])
		app.pointerMove(106, 5, { ctrlKey: true, shiftKey: true })
		expect(app.getShapeById(ids.box2)).toMatchObject({ x: 100, y: -1 })
	})

	it('does not snap on the X axis if the shift key is pressed', () => {
		// ┌──────┐
		// │  A   │
		// └──────┘
		//
		//  ┌──────┐                 │
		//  │  B   │ drag with shift │
		//  └──────┘                 ▼

		// move B into place
		app.updateShapes([{ id: ids.box2, type: 'geo', x: 1, y: 20 }])

		app.pointerDown(6, 25, ids.box2).pointerMove(6, 35, { ctrlKey: true })

		// should snap without shift key
		expect(app.getShapeById(ids.box2)).toMatchObject({ x: 0, y: 30 })

		app.keyDown('Shift')
		// should unsnap with shift key
		expect(app.getShapeById(ids.box2)).toMatchObject({ x: 1, y: 30 })
		// and continue not snapping while moving
		app.pointerMove(6, 50, { ctrlKey: true, shiftKey: true })
		expect(app.getShapeById(ids.box2)).toMatchObject({ x: 1, y: 45 })

		// should still snap to things on the Y axis
		app.createShapes([{ type: 'geo', id: ids.line1, x: 20, y: 100, props: { w: 10, h: 10 } }])
		app.pointerMove(6, 106, { ctrlKey: true, shiftKey: true })
		expect(app.getShapeById(ids.box2)).toMatchObject({ x: 1, y: 100 })
	})
})

describe('snapping with multiple shapes', () => {
	beforeEach(() => {
		// 0      100    200    300
		// ┌──────┐      ┌──────┐
		// │  A   │      │  B   │
		// └──────┘      └──────┘
		//
		// ┌────────────────────┐
		// │                    │
		// │                    │
		// │                    │
		// │         C          │
		// │                    │
		// │                    │
		// └────────────────────┘
		app.createShapes([
			{
				id: ids.box1,
				type: 'geo',
				x: 0,
				y: 0,
				props: { w: 100, h: 100 },
			},
			{
				id: ids.box2,
				type: 'geo',
				x: 200,
				y: 0,
				props: { w: 100, h: 100 },
			},
			{
				id: ids.line1,
				type: 'geo',
				x: 0,
				y: 200,
				props: { w: 300, h: 300 },
			},
		])
	})

	it("will not snap to inidivual shape's edges", () => {
		// 0      100    200    300
		//               ┌──────┐      ┌──────┐
		//               │  A   │      │  B   │
		//               └──────┘      └──────┘
		//
		// ┌────────────────────┐
		// │                    │
		// │                    │
		// │                    │
		// │         C          │
		// │                    │
		// │                    │
		// └────────────────────┘

		app.select(ids.box1, ids.box2)
		app.pointerDown(50, 50, ids.box1).pointerMove(249, 50, { ctrlKey: true })
		expect(app.getShapeById(ids.box1)!).toMatchObject({ x: 199, y: 0 })
	})

	it("will snap to the selection's bounding box", () => {
		// 0      100    200    300
		//                      ┌──────┐      ┌──────┐
		//                      │  A   │      │  B   │
		//                      └──────┘      └──────┘
		// ┌────────────────────┐
		// │                    │
		// │                    │
		// │                    │
		// │         C          │
		// │                    │
		// │                    │
		// └────────────────────┘

		app.select(ids.box1, ids.box2)
		app.pointerDown(50, 50, ids.box1).pointerMove(349, 50, { ctrlKey: true })
		expect(app.getShapeById(ids.box1)!).toMatchObject({ x: 300, y: 0 })
	})
})

describe('custom snapping points', () => {
	beforeEach(() => {
		app?.dispose()
		app = new TestApp({
			config: configWithCustomShape,

			// x───────┐
			// │ T     │
			// │       │
			// │       │
			// └───────┘
			//
			//             x───────x
			//             │ A     │
			//             │   x   │
			//             │       │
			//             x───────x
			//
			//                          x───────x
			//                          │ B     │
			//                          │   x   │
			//                          │       │
			//                          x───────x
		})
		app.createShapes([
			{
				type: '__test_top_left_snap_only',
				id: ids.boxT,
				x: 0,
				y: 0,
				props: { width: 100, height: 100 },
			},
			{
				type: 'geo',
				id: ids.box1,
				x: 200,
				y: 200,
				props: { w: 100, h: 100 },
			},
			{
				type: 'geo',
				id: ids.box2,
				x: 400,
				y: 400,
				props: { w: 100, h: 100 },
			},
		])
	})

	it('allows other shapes to snap to custom snap points', () => {
		// should snap to 0 on y axis
		// x────────────x───────x
		// x───────┐    x───────x
		// │ T     │    │ A     │
		// │       │    │   x   │
		// │       │    │ drag  │
		// └───────┘    x───────x
		app.pointerDown(250, 250, ids.box1).pointerMove(250, 51, { ctrlKey: true })
		expect(app.getShapeById(ids.box1)).toMatchObject({ x: 200, y: 0 })
		expect(app.snaps.lines?.length).toBe(1)
		expect(getNumSnapPoints(app.snaps.lines![0])).toBe(3)

		// should not snap to 100 on y axis
		// x───────┐
		// │ T     │
		// │       │
		// │       │
		// └───────┘    x───────x
		//              │ A     │
		//              │   x   │
		//              │ drag  │
		//              x───────x
		app.pointerMove(250, 151, { ctrlKey: true })
		expect(app.getShapeById(ids.box1)).toMatchObject({ x: 200, y: 101 })
		expect(app.snaps.lines?.length).toBe(0)

		// should not snap to 50 on y axis
		// x───────┐
		// │ T     │
		// │       │    x───────x
		// │       │    │ A     │
		// └───────┘    │   x   │
		//              │ drag  │
		//              x───────x
		app.pointerMove(250, 101, { ctrlKey: true })
		expect(app.getShapeById(ids.box1)).toMatchObject({ x: 200, y: 51 })
		expect(app.snaps.lines?.length).toBe(0)

		// should snap to 0 on x axis
		// x x───────┐
		// │ │ T     │
		// │ │       │
		// │ │       │
		// │ └───────┘
		// │
		// x x───────x
		// │ │ A     │
		// │ │   x   │
		// │ │ drag  │
		// x x───────x
		app.pointerMove(51, 250, { ctrlKey: true })
		expect(app.getShapeById(ids.box1)).toMatchObject({ x: 0, y: 200 })
		expect(app.snaps.lines?.length).toBe(1)
		expect(getNumSnapPoints(app.snaps.lines![0])).toBe(3)

		// should not snap to 100 on x axis
		// x───────┐
		// │ T     │
		// │       │
		// │       │
		// └───────┘
		//
		//         x───────x
		//         │ A     │
		//         │   x   │
		//         │ drag  │
		//         x───────x
		app.pointerMove(151, 250, { ctrlKey: true })
		expect(app.getShapeById(ids.box1)).toMatchObject({ x: 101, y: 200 })
		expect(app.snaps.lines?.length).toBe(0)

		// should not snap to 50 on x axis
		// x───────┐
		// │ T     │
		// │       │
		// │       │
		// └───────┘
		//
		//     x───────x
		//     │ A     │
		//     │   x   │
		//     │ drag  │
		//     x───────x
		app.pointerMove(101, 250, { ctrlKey: true })
		expect(app.getShapeById(ids.box1)).toMatchObject({ x: 51, y: 200 })
		expect(app.snaps.lines?.length).toBe(0)
	})

	it('allows shapes with custom points to snap to other shapes', () => {
		// should snap to 200 on y axis
		// x────────────x───────x
		// x───────┐    x───────x
		// │ T     │    │ A     │
		// │       │    │   x   │
		// │ drag  │    │       │
		// └───────┘    x───────x
		app.pointerDown(50, 50, ids.boxT).pointerMove(50, 251, { ctrlKey: true })
		expect(app.getShapeById(ids.boxT)).toMatchObject({ x: 0, y: 200 })
		expect(app.snaps.lines?.length).toBe(1)
		expect(getNumSnapPoints(app.snaps.lines![0])).toBe(3)

		// should snap to 250 on y axis
		// x─────────────────x
		//               x───────x
		//               │ A     │
		// x───────┐     │   x   │
		// │ T     │     │       │
		// │       │     x───────x
		// │ drag  │
		// └───────┘
		app.pointerMove(50, 301, { ctrlKey: true })
		expect(app.getShapeById(ids.boxT)).toMatchObject({ x: 0, y: 250 })
		expect(app.snaps.lines?.length).toBe(1)
		expect(getNumSnapPoints(app.snaps.lines![0])).toBe(2)

		// should snap to 300 on y axis
		// x─────────────x───────x
		//               x───────x
		//               │ A     │
		//               │   x   │
		//               │       │
		// x───────┐     x───────x
		// │ T     │
		// │       │
		// │ drag  │
		// └───────┘
		app.pointerMove(50, 351, { ctrlKey: true })
		expect(app.getShapeById(ids.boxT)).toMatchObject({ x: 0, y: 300 })
		expect(app.snaps.lines?.length).toBe(1)
		expect(getNumSnapPoints(app.snaps.lines![0])).toBe(3)

		// should snap to 200 on x axis
		// x x───────┐
		// │ │ T     │
		// │ │       │
		// │ │ drag  │
		// │ └───────┘
		// │
		// x x───────x
		// │ │ A     │
		// │ │   x   │
		// │ │       │
		// x x───────x
		app.pointerMove(251, 50, { ctrlKey: true })
		expect(app.getShapeById(ids.boxT)).toMatchObject({ x: 200, y: 0 })
		expect(app.snaps.lines?.length).toBe(1)
		expect(getNumSnapPoints(app.snaps.lines![0])).toBe(3)

		// should snap to 250 on x axis
		// x     x───────┐
		// │     │ T     │
		// │     │       │
		// │     │ drag  │
		// │     └───────┘
		// │
		// │ x───────x
		// │ │ A     │
		// x │   x   │
		//   │       │
		//   x───────x
		app.pointerMove(301, 50, { ctrlKey: true })
		expect(app.getShapeById(ids.boxT)).toMatchObject({ x: 250, y: 0 })
		expect(app.snaps.lines?.length).toBe(1)
		expect(getNumSnapPoints(app.snaps.lines![0])).toBe(2)

		// should snap to 300 on x axis
		// x         x───────┐
		// │         │ T     │
		// │         │       │
		// │         │ drag  │
		// │         └───────┘
		// │
		// x x───────x
		// │ │ A     │
		// │ │   x   │
		// │ │       │
		// x x───────x
		app.pointerMove(351, 50, { ctrlKey: true })
		expect(app.getShapeById(ids.boxT)).toMatchObject({ x: 300, y: 0 })
		expect(app.snaps.lines?.length).toBe(1)
		expect(getNumSnapPoints(app.snaps.lines![0])).toBe(3)
	})

	it('becomes part of the selection bounding box if there is more than one shape in the selection', () => {
		// ┌────────────────────────┐
		// │                        │
		// │ x───────┐              │
		// │ │ T     │              │
		// │ │       │              │
		// │ │       │              │
		// │ └───────┘ x            │
		// │           │ x───────x  │
		// │           │ │ A     │  │
		// │           │ │   x   │  │
		// │           │ │       │  │
		// │           │ x───────x  │
		// │           │            │
		// └───────────┼────────────┘
		//             │
		//             │ 450
		//         x───┼───x
		//         │ B │   │
		//         │   x   │
		//         │       │
		//         x───────x
		app.select(ids.boxT, ids.box1)
		app.pointerDown(50, 50, ids.boxT).pointerMove(351, 50, { ctrlKey: true })
		expect(app.snaps.lines?.length).toBe(1)
		expect(getNumSnapPoints(app.snaps.lines![0])).toBe(2)
		expect(getSnapPoints(app.snaps.lines![0])?.map(({ x }) => x)).toEqual([450, 450])
	})
})

describe('Snap-between behavior', () => {
	beforeEach(() => {
		app?.dispose()
	})
	it('snaps a shape horizontally between two others', () => {
		// ┌─────┐               ┌─────┐
		// │     │               │     │
		// │     │               │     │
		// │     │               │     │
		// │  A  │               │  B  │
		// │     │     ┌───┐     │     │
		// │     ├──┼──┤ C ├──┼──┤     │
		// │     │     └───┘     │     │
		// └─────┘               └─────┘
		app.createShapes([
			{ type: 'geo', id: ids.box1, x: 0, y: 0, props: { w: 50, h: 100 } },
			{ type: 'geo', id: ids.box2, x: 200, y: 0, props: { w: 50, h: 100 } },
			{ type: 'geo', id: ids.line1, x: 50, y: 0, props: { w: 10, h: 10 } },
		])

		// the midpoint is 125 and c is 10 wide so it should snap to 120 if we put it at 121
		app.pointerDown(55, 5, ids.line1).pointerMove(126, 67, { ctrlKey: true })
		expect(app.getShapeById(ids.line1)).toMatchObject({ x: 120, y: 62 })
		expect(app.snaps.lines?.length).toBe(1)
		assertGaps(app.snaps.lines![0])
		expect(app.snaps.lines![0].gaps.length).toBe(2)
	})
	it('shows horizontal point snaps at the same time as horizontal gap snaps', () => {
		// ┌─────┐               ┌─────┐
		// │     │               │     │
		// │     │               │     │
		// │     │               │     │
		// │  A  │               │  B  │
		// │     │               │     │
		// │     │     ┌───┐     │     │
		// │     ├──┼──┤ C ├──┼──┤     │
		// └─────┘     └───┘     └─────┘
		// x─────x─────x───x─────x─────x
		app.createShapes([
			{ type: 'geo', id: ids.box1, x: 0, y: 0, props: { w: 50, h: 100 } },
			{ type: 'geo', id: ids.box2, x: 200, y: 0, props: { w: 50, h: 100 } },
			{ type: 'geo', id: ids.line1, x: 50, y: 0, props: { w: 10, h: 10 } },
		])

		app.pointerDown(55, 5, ids.line1).pointerMove(126, 94, { ctrlKey: true })
		expect(app.getShapeById(ids.line1)).toMatchObject({ x: 120, y: 90 })
		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)
		expect(gapLines).toHaveLength(1)
		expect(pointLines).toHaveLength(1)
		expect(gapLines[0].gaps.length).toBe(2)
		expect(pointLines[0].points.length).toBe(6)
	})
	it('shows vertical point snaps at the same time as horizontal gap snaps', () => {
		// ┌─────┐               ┌─────┐
		// │     │               │     │
		// │     │               │     │
		// │     │               │     │
		// │  A  │               │  B  │
		// │     │     ┌───┐     │     │
		// │     ├──┼──┤ C ├──┼──┤     │ x
		// │     │     └───┘     │     │ │
		// └─────┘               └─────┘ │
		//                               │
		//           ┌───────┐           │
		//           │   D   │           x
		//           └───────┘
		app.createShapes([
			{ type: 'geo', id: ids.box1, x: 0, y: 0, props: { w: 50, h: 100 } },
			{ type: 'geo', id: ids.box2, x: 200, y: 0, props: { w: 50, h: 100 } },
			{ type: 'geo', id: ids.line1, x: 50, y: 0, props: { w: 10, h: 10 } },
			{ type: 'geo', id: ids.boxD, x: 75, y: 150, props: { w: 100, h: 10 } },
		])

		// the midpoint is 125 and c is 10 wide so it should snap to 120 if we put it at 121
		app.pointerDown(55, 5, ids.line1).pointerMove(126, 67, { ctrlKey: true })
		expect(app.getShapeById(ids.line1)).toMatchObject({ x: 120, y: 62 })
		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)
		expect(gapLines).toHaveLength(1)
		expect(pointLines).toHaveLength(1)

		expect(gapLines[0].gaps.length).toBe(2)
		expect(pointLines[0].points.length).toBe(2)
	})
	it('snaps a shape vertically between two others', () => {
		// ┌──────────────────────────┐
		// │                          │
		// │            A             │
		// │                          │
		// └─────┬────────────────────┘
		//       │
		//      ─┼─
		//       │
		//     ┌─┴─┐
		//     │ C │
		//     └─┬─┘
		//       │
		//      ─┼─
		//       │
		// ┌─────┴────────────────────┐
		// │                          │
		// │            B             │
		// │                          │
		// └──────────────────────────┘
		app.createShapes([
			{ type: 'geo', id: ids.box1, x: 0, y: 0, props: { w: 100, h: 50 } },
			{ type: 'geo', id: ids.box2, x: 0, y: 200, props: { w: 100, h: 50 } },
			{ type: 'geo', id: ids.line1, x: 50, y: 150, props: { w: 10, h: 10 } },
		])
		// the midpoint is 125 and c is 10 wide so it should snap to 120 if we put it at 121
		app.pointerDown(55, 155, ids.line1).pointerMove(27, 126, { ctrlKey: true })
		expect(app.getShapeById(ids.line1)).toMatchObject({ x: 22, y: 120 })
		expect(app.snaps.lines?.length).toBe(1)
		assertGaps(app.snaps.lines![0])
		const { gapLines } = getGapAndPointLines(app.snaps.lines!)
		expect(gapLines[0].gaps.length).toBe(2)
	})
	it('shows vertical snap points at the same time as vertical gaps', () => {
		// x ┌──────────────────────────┐
		// │ │                          │
		// │ │            A             │
		// │ │                          │
		// x └─┬────────────────────────┘
		// │   │
		// │  ─┼─
		// │   │
		// x ┌─┴─┐
		// │ │ C │
		// x └─┬─┘
		// │   │
		// │  ─┼─
		// │   │
		// x ┌─┴────────────────────────┐
		// │ │                          │
		// │ │            B             │
		// │ │                          │
		// x └──────────────────────────┘
		app.createShapes([
			{ type: 'geo', id: ids.box1, x: 0, y: 0, props: { w: 100, h: 50 } },
			{ type: 'geo', id: ids.box2, x: 0, y: 200, props: { w: 100, h: 50 } },
			{ type: 'geo', id: ids.line1, x: 50, y: 150, props: { w: 10, h: 10 } },
		])
		// the midpoint is 125 and c is 10 wide so it should snap to 120 if we put it at 121
		app.pointerDown(55, 155, ids.line1).pointerMove(6, 126, { ctrlKey: true })
		expect(app.getShapeById(ids.line1)).toMatchObject({ x: 0, y: 120 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)
		expect(gapLines).toHaveLength(1)
		expect(pointLines).toHaveLength(1)
		expect(gapLines[0].gaps.length).toBe(2)
		expect(pointLines[0].points.length).toBe(6)
	})
	it('shows horizontal snap points at the same time as vertical gaps', () => {
		// ┌──────────────────────────┐
		// │                          │
		// │            A             │
		// │                          │
		// └────┬─────────────────────┘
		//      │
		//     ─┼─       D┌───────────┐
		//      │         │           │
		//   C┌─┴─┐       │           │
		//    │ x─┼───────┼─────x     │
		//    └─┬─┘       │           │
		//      │         │           │
		//     ─┼─        └───────────┘
		//      │
		// ┌────┴─────────────────────┐
		// │                          │
		// │            B             │
		// │                          │
		// └──────────────────────────┘
		app.createShapes([
			{ type: 'geo', id: ids.box1, x: 0, y: 0, props: { w: 100, h: 50 } },
			{ type: 'geo', id: ids.box2, x: 0, y: 200, props: { w: 100, h: 50 } },
			{ type: 'geo', id: ids.line1, x: 50, y: 150, props: { w: 10, h: 10 } },
			{ type: 'geo', id: ids.boxD, x: 50, y: 75, props: { w: 10, h: 100 } },
		])
		// the midpoint is 125 and c is 10 wide so it should snap to 120 if we put it at 121
		app.pointerDown(55, 155, ids.line1).pointerMove(27, 126, { ctrlKey: true })
		expect(app.getShapeById(ids.line1)).toMatchObject({ x: 22, y: 120 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)
		expect(gapLines).toHaveLength(1)
		expect(pointLines).toHaveLength(1)
		expect(gapLines[0].gaps).toHaveLength(2)
		expect(pointLines[0].points).toHaveLength(2)
	})
	it('can happen on multiple axes at the same time', () => {
		//           ┌──────────────────────────┐
		//           │                          │
		//           │            A             │
		// ┌─────┐   │               ┌─────┐    │
		// │     │   └─────┬─────────┼─────┼────┘
		// │     │         │         │     │
		// │     │        ─┼─        │     │
		// │  D  │         │         │  B  │
		// │     │       ┌─┴─┐       │     │
		// │     ├───┼───┤ E ├───┼───┤     │
		// │     │       └─┬─┘       │     │
		// └─────┘         │         └─────┘
		//                ─┼─
		//                 │
		//           ┌─────┴────────────────────┐
		//           │                          │
		//           │            C             │
		//           │                          │
		//           └──────────────────────────┘
		app.createShapes([
			{ type: 'geo', id: ids.box1, x: 50, y: 0, props: { w: 200, h: 50 } },
			{ type: 'geo', id: ids.box2, x: 150, y: 50, props: { w: 50, h: 100 } },
			{ type: 'geo', id: ids.line1, x: 50, y: 200, props: { w: 200, h: 50 } },
			{ type: 'geo', id: ids.boxD, x: 0, y: 50, props: { w: 50, h: 100 } },
			{ type: 'geo', id: ids.boxE, x: 0, y: 0, props: { w: 10, h: 10 } },
		])
		app.pointerDown(5, 5, ids.boxE).pointerMove(101, 126, { ctrlKey: true })
		expect(app.getShapeById(ids.boxE)).toMatchObject({ x: 95, y: 120 })
		expect(app.snaps.lines?.length).toBe(2)
		assertGaps(app.snaps.lines![0])
		assertGaps(app.snaps.lines![1])
		const { gapLines } = getGapAndPointLines(app.snaps.lines!)
		expect(gapLines[0].gaps.length).toBe(2)
		expect(gapLines[1].gaps.length).toBe(2)
	})
	it('will expand a horizontal and vertical selections outwards if possible', () => {
		//                 ┌───┐
		//                 │ E │
		//                 └─┬─┘
		//                   ┼
		//                 ┌─┴─┐
		//                 │ F │
		//                 └─┬─┘
		//                   ┼
		// ┌───┐   ┌───┐   ┌─┴─┐   ┌───┐   ┌───┐
		// │ A ├─┼─┤ B ├─┼─┤ X ├─┼─┤ C ├─┼─┤ D │
		// └───┘   └───┘   └─┬─┘   └───┘   └───┘
		//                   ┼
		//                 ┌─┴─┐
		//                 │ G │
		//                 └─┬─┘
		//                   ┼
		//                 ┌─┴─┐
		//                 │ H │
		//                 └───┘
		// dragging X

		app.createShapes([
			box(ids.box1, 0, 40),
			box(ids.box2, 20, 40),
			box(ids.line1, 60, 40),
			box(ids.boxD, 80, 40),
			box(ids.boxE, 40, 0),
			box(ids.boxF, 40, 20),
			box(ids.boxG, 40, 60),
			box(ids.boxH, 40, 80),

			box(ids.boxX, 0, 0),
		])

		app.pointerDown(5, 5, ids.boxX).pointerMove(46, 46, { ctrlKey: true })
		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 40, y: 40 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)
		expect(gapLines).toHaveLength(2)
		expect(gapLines[0].gaps).toHaveLength(4)
		expect(gapLines[1].gaps).toHaveLength(4)

		// it should also have snap lines for all the edge/center alignments
		expect(pointLines).toHaveLength(6)
	})

	it('will show multiple non-overlapping snap-betweens on the same axis', () => {
		// ┌─────┐   ┌─────┐
		// │  A  │   │  B  │
		// └──┬──┘   └──┬──┘
		//    ┼         ┼
		// ┌──┴─────────┴──┐
		// │    X  drag    │
		// └──┬─────────┬──┘
		//    ┼         ┼
		// ┌──┴──┐   ┌──┴──┐
		// │  C  │   │  D  │
		// └─────┘   └─────┘

		app.createShapes([
			box(ids.box1, 0, 0),
			box(ids.box2, 20, 0),
			box(ids.line1, 0, 40),
			box(ids.boxD, 20, 40),
			box(ids.boxX, 50, 20, 30),
		])

		app.pointerDown(65, 25, ids.boxX).pointerMove(16, 25, { ctrlKey: true })
		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 0, y: 20 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)
		expect(gapLines).toHaveLength(2)
		expect(gapLines[0].gaps).toHaveLength(2)
		expect(gapLines[1].gaps).toHaveLength(2)

		// check outer edge snaps too
		expect(pointLines).toHaveLength(2)
		expect(pointLines[0].points).toHaveLength(6)
		expect(pointLines[1].points).toHaveLength(6)
	})

	it('should not snap horizontally if the shape is larger than the gap', () => {
		//        ┌─────┐             ┌─────┐
		//        │     │             │     │
		//        │  A  │             │  B  │
		//        │     │             │     │
		//        │     │             │     │
		// ┌──────┼─────┼─────────────┼─────┼──────┐
		// │      │     │             │     │      │
		// │      │     │      X      │     │      │ ◄─── drag
		// │      │     │             │     │      │
		// └──────┼─────┼─────────────┼─────┼──────┘
		//        │     │             │     │
		//        │     │             │     │
		//        │     │             │     │
		//        └─────┘             └─────┘
		//
		//   no snap to center gap between A + B
		app.createShapes([
			box(ids.box1, 20, 0, 10, 100),
			box(ids.box2, 70, 0, 10, 100),
			box(ids.boxX, 0, 50, 100, 10),
		])

		app.pointerDown(50, 55, ids.boxX).pointerMove(51, 66, { ctrlKey: true })

		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 1, y: 61 })
		expect(app.snaps.lines?.length).toBe(0)
	})

	it('should work if the thing being dragged is a selection', () => {
		//                   selection
		//                  ┌─────────────────────────┐
		//                  │                         │       ┌────────┐
		// ┌────────┐       │          ┌────────────┐ │       │        │
		// │        │       │          │            │ │       │        │
		// │        │       │          │    C       │ │       │        │
		// │   A    ├───┼───┤ ┌────┐   └────────────┘ ├───┼───┤   B    │
		// │        │       │ │    │                  │       │        │
		// │        │       │ │  D │                  │       │        │
		// └────────┘       │ └────┘                  │       └────────┘
		//                  └─────────────────────────┘
		app.createShapes([
			box(ids.box1, 0, 50, 50, 100),
			box(ids.box2, 350, 0, 50, 100),
			box(ids.line1, 200, 10, 100, 10),
			box(ids.boxD, 100, 80, 10, 50),
		])

		app.select(ids.line1, ids.boxD)

		app.pointerDown(200, 50, ids.line1).pointerMove(201, 61, { ctrlKey: true })

		expect(app.getShapeById(ids.line1)).toMatchObject({ x: 200, y: 21 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)

		expect(gapLines).toHaveLength(1)
		expect(pointLines).toHaveLength(0)

		expect(gapLines[0].gaps).toHaveLength(2)

		const sortedGaps = gapLines[0].gaps.sort((a, b) => a.startEdge[0].x - b.startEdge[0].x)

		expect(sortedGaps[0].startEdge[0].x).toBeCloseTo(50)
		expect(sortedGaps[0].endEdge[0].x).toBeCloseTo(100)

		expect(sortedGaps[1].startEdge[0].x).toBeCloseTo(300)
		expect(sortedGaps[1].endEdge[0].x).toBeCloseTo(350)
	})
})

describe('Snap-next-to behavior', () => {
	beforeEach(() => {
		app?.dispose()
	})
	it('snaps a shape to the left of two others, matching the gap size', () => {
		// ┌───┐
		// │ X │
		// └───┘         ┌───┐         ┌───┐
		//               │ A │         │ B │
		//               └───┘         └───┘
		//   │
		//   │  drag x down
		//   ▼
		//
		// ┌───┐         ┌───┐         ┌───┐
		// │ X ├────┼────┤ A ├────┼────┤ B │   *snap*
		// └───┘         └───┘         └───┘
		app.createShapes([box(ids.boxX, 0, 0), box(ids.box1, 50, 10), box(ids.box2, 100, 10)])

		app.pointerDown(5, 5, ids.boxX).pointerMove(6, 16, { ctrlKey: true })
		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 0, y: 10 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)

		expect(gapLines).toHaveLength(1)
		expect(gapLines[0].gaps).toHaveLength(2)

		// also check the outer edge snaps
		expect(pointLines).toHaveLength(3)
	})

	it('expands the selection to the right for left snap-besides ', () => {
		// ┌───┐
		// │ X │
		// └───┘         ┌───┐         ┌───┐         ┌───┐         ┌───┐
		//               │ A │         │ B │         │ C │         │ D │
		//               └───┘         └───┘         └───┘         └───┘
		//   │
		//   │  drag x down
		//   ▼
		//
		// ┌───┐         ┌───┐         ┌───┐         ┌───┐         ┌───┐
		// │ X ├────┼────┤ A ├────┼────┤ B ├────┼────┤ C ├────┼────┤ D │
		// └───┘         └───┘         └───┘         └───┘         └───┘
		//
		//                                     *snap*
		//
		app.createShapes([
			box(ids.boxX, 0, 0),
			box(ids.box1, 50, 10),
			box(ids.box2, 100, 10),
			box(ids.line1, 150, 10),
			box(ids.boxD, 200, 10),
		])

		app.pointerDown(5, 5, ids.boxX).pointerMove(6, 16, { ctrlKey: true })
		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 0, y: 10 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)

		expect(gapLines).toHaveLength(1)
		expect(gapLines[0].gaps).toHaveLength(4)

		// also check the outer edge snaps
		expect(pointLines).toHaveLength(3)
	})

	it('snaps a shape to the right of two others, matching the gap size', () => {
		//                             ┌───┐
		//                             │ X │
		// ┌───┐         ┌───┐         └───┘
		// │ A │         │ B │
		// └───┘         └───┘
		//                        │
		//                        │  drag X down
		//                        ▼
		//
		// ┌───┐         ┌───┐         ┌───┐
		// │ A ├────┼────┤ B ├────┼────┤ X │   *snap*
		// └───┘         └───┘         └───┘
		app.createShapes([box(ids.box1, 0, 10), box(ids.box2, 50, 10), box(ids.boxX, 100, 0)])

		app.pointerDown(105, 5, ids.boxX).pointerMove(106, 16, { ctrlKey: true })
		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 100, y: 10 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)

		expect(gapLines).toHaveLength(1)
		expect(gapLines[0].gaps).toHaveLength(2)

		// also check the outer edge snaps
		expect(pointLines).toHaveLength(3)
	})
	it('expands the selection to the left for right snap-besides ', () => {
		//                                                         ┌───┐
		//                                                         │ X │
		// ┌───┐         ┌───┐         ┌───┐         ┌───┐         └───┘
		// │ A │         │ B │         │ C │         │ D │
		// └───┘         └───┘         └───┘         └───┘
		//                                                           │
		//                                             drag x down   │
		//                                                           ▼
		//
		// ┌───┐         ┌───┐         ┌───┐         ┌───┐         ┌───┐
		// │ A ├────┼────┤ B ├────┼────┤ C ├────┼────┤ D ├────┼────┤ x │
		// └───┘         └───┘         └───┘         └───┘         └───┘
		//
		//                            *snap*
		app.createShapes([
			box(ids.box1, 0, 10),
			box(ids.box2, 50, 10),
			box(ids.line1, 100, 10),
			box(ids.boxD, 150, 10),
			box(ids.boxX, 200, 0),
		])

		app.pointerDown(205, 5, ids.boxX).pointerMove(206, 16, { ctrlKey: true })
		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 200, y: 10 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)

		expect(gapLines).toHaveLength(1)
		expect(gapLines[0].gaps).toHaveLength(4)

		// also check the outer edge snaps
		expect(pointLines).toHaveLength(3)
	})
	it('snaps a shape above two others, matching the gap size', () => {
		// ┌───┐                 ┌───┐
		// │ X │                 │ X │
		// └───┘                 └─┬─┘
		//            drag X       ┼
		//    ┌───┐              ┌─┴─┐
		//    │ A │     ────►    │ A │   *snap*
		//    └───┘              └─┬─┘
		//                         ┼
		//    ┌───┐              ┌─┴─┐
		//    │ B │              │ B │
		//    └───┘              └───┘
		app.createShapes([box(ids.boxX, 0, 0), box(ids.box1, 10, 20), box(ids.box2, 10, 40)])

		app.pointerDown(5, 5, ids.boxX).pointerMove(16, 6, { ctrlKey: true })

		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 10, y: 0 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)

		expect(gapLines).toHaveLength(1)
		expect(gapLines[0].gaps).toHaveLength(2)

		// also check the outer edge snaps
		expect(pointLines).toHaveLength(3)
	})

	it('expands the selection downwards for top snap-besides ', () => {
		// ┌───┐                 ┌───┐
		// │ X │                 │ X │
		// └───┘                 └─┬─┘
		//            drag X       ┼
		//    ┌───┐              ┌─┴─┐
		//    │ A │     ────►    │ A │   *snap*
		//    └───┘              └─┬─┘
		//                         ┼
		//    ┌───┐              ┌─┴─┐
		//    │ B │              │ B │
		//    └───┘              └─┬─┘
		//                         ┼
		//    ┌───┐              ┌─┴─┐
		//    │ C │              │ C │
		//    └───┘              └─┬─┘
		//                         ┼
		//    ┌───┐              ┌─┴─┐
		//    │ D │              │ D │
		//    └───┘              └───┘

		app.createShapes([
			box(ids.boxX, 0, 0),
			box(ids.box1, 10, 20),
			box(ids.box2, 10, 40),
			box(ids.line1, 10, 60),
			box(ids.boxD, 10, 80),
		])

		app.pointerDown(5, 5, ids.boxX).pointerMove(16, 6, { ctrlKey: true })

		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 10, y: 0 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)

		expect(gapLines).toHaveLength(1)
		expect(gapLines[0].gaps).toHaveLength(4)

		// also check the outer edge snaps
		expect(pointLines).toHaveLength(3)
	})

	it('snaps a shape below two others, matching the gap size', () => {
		//     ┌───┐              ┌───┐
		//     │ A │              │ A │
		//     └───┘              └─┬─┘
		//                          ┼
		//     ┌───┐              ┌─┴─┐
		//     │ B │              │ B │
		//     └───┘              └─┬─┘
		//                          ┼
		// ┌───┐      drag X      ┌─┴─┐  *snap*
		// │ X │                  │ X │
		// └───┘        ────►     └───┘
		app.createShapes([box(ids.box1, 10, 0), box(ids.box2, 10, 20), box(ids.boxX, 0, 40)])

		app.pointerDown(5, 45, ids.boxX).pointerMove(16, 46, { ctrlKey: true })

		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 10, y: 40 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)

		expect(gapLines).toHaveLength(1)
		expect(gapLines[0].gaps).toHaveLength(2)

		// also check the outer edge snaps
		expect(pointLines).toHaveLength(3)
	})

	it('expands the selection upwards for bottom snap-besides ', () => {
		//     ┌───┐              ┌───┐
		//     │ A │              │ A │
		//     └───┘              └─┬─┘
		//                          ┼
		//     ┌───┐              ┌─┴─┐
		//     │ B │              │ B │
		//     └───┘              └─┬─┘
		//                          ┼
		//     ┌───┐              ┌─┴─┐
		//     │ C │              │ C │
		//     └───┘              └─┬─┘
		//                          ┼
		//     ┌───┐              ┌─┴─┐
		//     │ D │              │ D │
		//     └───┘              └─┬─┘
		//                          ┼
		// ┌───┐      drag X      ┌─┴─┐  *snap*
		// │ X │                  │ X │
		// └───┘        ────►     └───┘
		app.createShapes([
			box(ids.box1, 10, 0),
			box(ids.box2, 10, 20),
			box(ids.line1, 10, 40),
			box(ids.boxD, 10, 60),
			box(ids.boxX, 0, 80),
		])

		app.pointerDown(5, 85, ids.boxX).pointerMove(16, 86, { ctrlKey: true })

		expect(app.getShapeById(ids.boxX)).toMatchObject({ x: 10, y: 80 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)

		expect(gapLines).toHaveLength(1)
		expect(gapLines[0].gaps).toHaveLength(4)

		// also check the outer edge snaps
		expect(pointLines).toHaveLength(3)
	})

	it('should work if the thing being dragged is a selection', () => {
		//                                    selection
		//                                   ┌─────────────────────────┐
		//                                   │                         │
		// ┌────────┐       ┌────────┐       │          ┌────────────┐ │
		// │        │       │        │       │          │  C         │ │
		// │        │       │        │       │          │            │ │
		// │   A    ├───┼───┤   B    ├───┼───┤ ┌────┐   └────────────┘ │
		// │        │       │        │       │ │ D  │                  │
		// │        │       │        │       │ │    │                  │
		// └────────┘       └────────┘       │ └────┘                  │
		//                                   └─────────────────────────┘
		app.createShapes([
			box(ids.box1, 0, 50, 50, 100),
			box(ids.box2, 100, 50, 50, 100),
			box(ids.line1, 300, 10, 100, 10),
			box(ids.boxD, 200, 80, 10, 50),
		])

		app.select(ids.line1, ids.boxD)

		app.pointerDown(300, 50, ids.line1).pointerMove(301, 101, { ctrlKey: true })

		expect(app.getShapeById(ids.boxD)).toMatchObject({ x: 200, y: 131 })

		const { gapLines, pointLines } = getGapAndPointLines(app.snaps.lines!)

		expect(gapLines).toHaveLength(1)
		expect(pointLines).toHaveLength(0)

		expect(gapLines[0].gaps).toHaveLength(2)

		const sortedGaps = gapLines[0].gaps.sort((a, b) => a.startEdge[0].x - b.startEdge[0].x)

		expect(sortedGaps[0].startEdge[0].x).toBeCloseTo(50)
		expect(sortedGaps[0].endEdge[0].x).toBeCloseTo(100)

		expect(sortedGaps[1].startEdge[0].x).toBeCloseTo(150)
		expect(sortedGaps[1].endEdge[0].x).toBeCloseTo(200)
	})
})

describe('translating while the grid is enabled', () => {
	it('does not snap to the grid', () => {
		// 0   20      50   70
		//  ┌───┐       ┌───┐
		//  │ A │       │ B │
		//  └───┘       └───┘
		app.createShapes([box(ids.box1, 0, 0, 20, 20), box(ids.box2, 50, 0, 20, 20)])

		app.updateUserDocumentSettings({ isGridMode: true })

		// try to snap A to B
		// doesn't work because of the grid

		// 0   20      50   70
		//         ┌───┬┬───┐
		//         │ A ││ B │
		//         └───┴┴───┘

		app.select(ids.box1).pointerDown(10, 10, ids.box1).pointerMove(39, 10)

		// rounds to nearest 10
		expect(app.getPageBoundsById(ids.box1)!.x).toEqual(30)

		// engage snap mode and it should indeed snap to B

		// 0   20      50   70
		//          ┌───┬───┐
		//          │ A │ B │
		//          └───┴───┘
		app.keyDown('Control')
		expect(app.getPageBoundsById(ids.box1)!.x).toEqual(30)

		// and we can move the box anywhere if there are no snaps nearby
		app.pointerMove(-19, -32, { ctrlKey: true })
		expect(app.getPageBoundsById(ids.box1)!).toMatchObject({ x: -29, y: -42 })
	})
})

describe('snap lines', () => {
	it('should show up for all matching snaps, even if the axis is locked', () => {
		//   0           60                    200
		//
		//               ┌─────────────┐        ┌─────────────┐
		//               │ A           │        │ B           │
		//               │             │        │             │
		//     ◄──────── │             │        │             │
		//               │             │        │             │
		//               │             │        │             │
		// 100           └─────────────┘        └─────────────┘
		//
		//     hold shift and
		//     drag A left to C
		//
		// 200 ┌─────────────┐
		//     │ C           │
		//     │             │
		//     │             │
		//     │             │
		//     │             │
		//     └─────────────┘
		//
		//
		//    ────────────────────────────────────────────────────────
		//
		//
		//   0    *snap*    100                200
		//
		//     x─────────────x──────────────────x─────────────x
		//     │ A           │                  │ B           │
		//     │             │                  │             │
		//     │      x──────┼──────────────────┼──────x      │
		//     │      │      │                  │             │
		//     │      │      │                  │             │
		// 100 x──────┼──────x──────────────────x─────────────x
		//     │      │      │
		//     │      │      │
		//     │      │      │
		//     │      │      │
		//     │      │      │
		// 200 x──────┼──────x
		//     │ C    │      │
		//     │      │      │
		//     │      x      │
		//     │             │
		//     │             │
		//     x─────────────x
		app.createShapes([
			box(ids.box1, 60, 0, 100, 100),
			box(ids.box2, 200, 0, 100, 100),
			box(ids.line1, 0, 200, 100, 100),
		])

		app
			.select(ids.box1)
			.pointerDown(110, 50, ids.box1)
			.pointerMove(49, 52, { shiftKey: true, ctrlKey: true })

		expect(app.getShapeById(ids.box1)).toMatchObject({
			x: 0,
			y: 0,
			props: { w: 100, h: 100 },
		})

		expect(getSnapLines(app)).toMatchInlineSnapshot(`
      Array [
        "0,0 0,100 0,200 0,300",
        "0,0 100,0 200,0 300,0",
        "0,100 100,100 200,100 300,100",
        "100,0 100,100 100,200 100,300",
        "50,50 250,50",
        "50,50 50,250",
      ]
    `)
	})
})

describe('translating a shape with a child', () => {
	it('should not snap to the child', () => {
		// 0 1   11           50
		// ┌───────────────────┐
		// │ ┌───┐             │
		// │ │ B │             │
		// │ └───┘             │
		// │                   │
		// │          A        │
		// │                   │
		// │                   │
		// │                   │
		// └───────────────────┘
		app.createShapes([box(ids.box1, 0, 0, 50, 50), box(ids.box2, 1, 1)])
		app.updateShapes([{ id: ids.box2, type: 'geo', parentId: ids.box1 }])

		app.pointerDown(25, 25, ids.box1).pointerMove(50, 25, { ctrlKey: true })

		expect(app.snaps.lines?.length).toBe(0)
		expect(app.getShapeById(ids.box1)).toMatchObject({
			x: 25,
			y: 0,
			props: { w: 50, h: 50 },
		})
		expect(app.getShapeById(ids.box2)).toMatchObject({ x: 1, y: 1, props: { w: 10, h: 10 } })
		expect(app.getPageBoundsById(ids.box2)).toMatchObject({
			x: 26,
			y: 1,
			w: 10,
			h: 10,
		})
	})
})

describe('translating a shape with a bound shape', () => {
	it('should not snap to arrows', () => {
		//   100         200
		// ┌───────────────────┐
		// │ ┌───┐      ┌───┐  │
		// │ │ A │ ---> │ B │  │
		// │ └───┘      └───┘  │
		// └───────────────────┘
		app.createShapes([box(ids.box1, 0, 0, 100, 100), box(ids.box2, 200, 0, 100, 100)])

		// Create an arrow starting within the first box and ending within the second box
		app.setSelectedTool('arrow').pointerDown(50, 50).pointerMove(250, 50).pointerUp()

		//   100         200
		// ┌───────────────────┐
		// │            ┌───┐  │
		// │          , │ B │  │
		// │      ┌───┐ └───┘  │
		// |      │ A │        |
		// |      └───┘        |
		// └───────────────────┘

		expect(app.getShapeById(app.selectedIds[0])?.type).toBe('arrow')

		app.pointerDown(50, 50, ids.box1).pointerMove(84, 110, { ctrlKey: true })

		expect(app.snaps.lines.length).toBe(0)
	})

	it('should preserve arrow bindings', () => {
		const arrow1 = app.createShapeId('arrow1')
		app.createShapes([
			{ id: ids.box1, type: 'geo', x: 100, y: 100, props: { w: 100, h: 100 } },
			{ id: ids.box2, type: 'geo', x: 300, y: 300, props: { w: 100, h: 100 } },
			{
				id: arrow1,
				type: 'arrow',
				x: 150,
				y: 150,
				props: {
					start: {
						type: 'binding',
						isExact: false,
						boundShapeId: ids.box1,
						normalizedAnchor: { x: 0.5, y: 0.5 },
					},
					end: {
						type: 'binding',
						isExact: false,
						boundShapeId: ids.box2,
						normalizedAnchor: { x: 0.5, y: 0.5 },
					},
				},
			},
		])

		app.select(ids.box1, arrow1)
		app.pointerDown(150, 150, ids.box1).pointerMove(0, 0)

		expect(app.getShapeById(ids.box1)).toMatchObject({ x: -50, y: -50 })
		expect(app.getShapeById(arrow1)).toMatchObject({
			props: { start: { type: 'binding' }, end: { type: 'binding' } },
		})
	})

	it('breaks arrow bindings when cloning', () => {
		const arrow1 = app.createShapeId('arrow1')
		app.createShapes([
			{ id: ids.box1, type: 'geo', x: 100, y: 100, props: { w: 100, h: 100 } },
			{ id: ids.box2, type: 'geo', x: 300, y: 300, props: { w: 100, h: 100 } },
			{
				id: arrow1,
				type: 'arrow',
				x: 150,
				y: 150,
				props: {
					start: {
						type: 'binding',
						isExact: false,
						boundShapeId: ids.box1,
						normalizedAnchor: { x: 0.5, y: 0.5 },
					},
					end: {
						type: 'binding',
						isExact: false,
						boundShapeId: ids.box2,
						normalizedAnchor: { x: 0.5, y: 0.5 },
					},
				},
			},
		])

		app.select(ids.box1, arrow1)
		app.pointerDown(150, 150, ids.box1).pointerMove(0, 0, { altKey: true })

		expect(app.getShapeById(ids.box1)).toMatchObject({ x: 100, y: 100 })
		expect(app.getShapeById(arrow1)).toMatchObject({
			props: { start: { type: 'binding' }, end: { type: 'binding' } },
		})

		const newArrow = app.shapesArray.find((s) => s.type === 'arrow' && s.id !== arrow1)
		expect(newArrow).toMatchObject({
			props: { start: { type: 'binding' }, end: { type: 'point' } },
		})
	})
})

describe('When dragging a shape onto a parent', () => {
	it('reparents the shape', () => {
		app.createShapes([
			{
				id: ids.frame1,
				type: 'frame',
				x: 0,
				y: 0,
				props: {
					w: 200,
					h: 200,
				},
			},
			{
				id: ids.box1,
				type: 'geo',
				x: 500,
				y: 500,
				props: {
					w: 100,
					h: 100,
				},
			},
		])

		app.pointerDown(550, 550, ids.box1).pointerMove(100, 100).pointerUp()
		expect(app.getShapeById(ids.box1)?.parentId).toBe(ids.frame1)
	})

	it('does not reparent the shape when the parent is clipped', () => {
		app.createShapes([
			{
				id: ids.frame1,
				type: 'frame',
				x: 0,
				y: 0,
				props: {
					w: 200,
					h: 200,
				},
			},
			{
				id: ids.frame2,
				type: 'frame',
				x: 200,
				y: 200,
				props: {
					w: 500,
					h: 500,
				},
			},
			{
				id: ids.box1,
				type: 'geo',
				x: 500,
				y: 500,
				props: {
					w: 100,
					h: 100,
				},
			},
		])

		// drop the frame2 onto frame 1
		app.reparentShapesById([ids.frame2], ids.frame1)
		expect(app.getShapeById(ids.frame2)?.parentId).toBe(ids.frame1)

		// drop box1 onto the CLIPPED part of frame2
		app.pointerDown(550, 550, ids.box1).pointerMove(350, 350).pointerUp()

		// It should not become the child of frame2 because it is clipped
		expect(app.getShapeById(ids.box1)?.parentId).toBe(app.currentPageId)
	})
})

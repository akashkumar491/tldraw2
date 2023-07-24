import { TLFrameShape, TLGeoShape, createShapeId } from '@tldraw/editor'
import { TestEditor } from './TestEditor'

let editor: TestEditor

const ids = {
	box1: createShapeId('box1'),
	box2: createShapeId('box2'),
	box3: createShapeId('box3'),
	box4: createShapeId('box4'),
	box5: createShapeId('box5'),
	frame1: createShapeId('frame1'),
	group1: createShapeId('group1'),
	group2: createShapeId('group2'),
	group3: createShapeId('group3'),
}

beforeEach(() => {
	editor = new TestEditor()
})

it('lists a sorted shapes array correctly', () => {
	editor.createShapes([
		{ id: ids.box1, type: 'geo' },
		{ id: ids.box2, type: 'geo' },
		{ id: ids.box3, type: 'geo' },
		{ id: ids.frame1, type: 'frame' },
		{ id: ids.box4, type: 'geo', parentId: ids.frame1 },
		{ id: ids.box5, type: 'geo', parentId: ids.frame1 },
	])

	editor.sendBackward([ids.frame1])
	editor.sendBackward([ids.frame1])

	expect(editor.sortedShapesArray.map((s) => s.id)).toEqual([
		ids.box1,
		ids.frame1,
		ids.box4,
		ids.box5,
		ids.box2,
		ids.box3,
	])
})

describe('when shape is filled', () => {
	let box1: TLGeoShape
	beforeEach(() => {
		editor.createShapes([{ id: ids.box1, type: 'geo', props: { fill: 'solid' } }])
		box1 = editor.getShape<TLGeoShape>(ids.box1)!
	})

	it('hits on pointer down over shape', () => {
		editor.pointerDown(50, 50)
		expect(editor.selectedIds).toEqual([box1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})

	it('hits on pointer down over shape margin (inside', () => {
		editor.pointerDown(96, 50)
		expect(editor.selectedIds).toEqual([box1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})

	it('hits on pointer down over shape margin (outside)', () => {
		editor.pointerDown(104, 50)
		expect(editor.selectedIds).toEqual([box1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})

	it('misses on pointer down outside of shape', () => {
		editor.pointerDown(250, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('selects and drags on point inside and drag', () => {
		editor.pointerDown(50, 50)
		expect(editor.selectedIds).toEqual([box1.id])
		editor.pointerMove(55, 55)
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})
})

describe('when shape is hollow', () => {
	let box1: TLGeoShape
	beforeEach(() => {
		editor.createShapes([{ id: ids.box1, type: 'geo', props: { fill: 'none' } }])
		box1 = editor.getShape<TLGeoShape>(ids.box1)!
	})

	it('misses on pointer down over shape, hits on pointer up', () => {
		editor.pointerDown(50, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})

	it('hits on pointer down over shape margin (inside)', () => {
		editor.pointerDown(96, 50)
		expect(editor.selectedIds).toEqual([box1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})

	it('hits on pointer down over shape margin (outside)', () => {
		editor.pointerDown(104, 50)
		expect(editor.selectedIds).toEqual([box1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})

	it('misses on pointer down outside of shape', () => {
		editor.pointerDown(250, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('brushes on point inside and drag', () => {
		editor.pointerDown(50, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerMove(55, 55)
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})
})

describe('when shape is a frame', () => {
	let frame1: TLFrameShape
	beforeEach(() => {
		editor.createShape<TLFrameShape>({ id: ids.frame1, type: 'frame', props: { w: 100, h: 100 } })
		frame1 = editor.getShape<TLFrameShape>(ids.frame1)!
	})

	it('misses on pointer down over shape, hits on pointer up', () => {
		editor.pointerDown(50, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('hits on pointer down over shape margin (inside)', () => {
		editor.pointerDown(96, 50)
		expect(editor.selectedIds).toEqual([frame1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([frame1.id])
	})

	it('hits on pointer down over shape margin (outside)', () => {
		editor.pointerDown(104, 50)
		expect(editor.selectedIds).toEqual([frame1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([frame1.id])
	})

	it('misses on pointer down outside of shape', () => {
		editor.pointerDown(250, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('brushes on point inside and drag', () => {
		editor.pointerDown(50, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerMove(55, 55)
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})
})

describe('When a shape is behind a frame', () => {
	beforeEach(() => {
		editor.selectAll().deleteShapes(editor.selectedIds)
		editor.createShape<TLGeoShape>({ id: ids.box1, type: 'geo', x: 25, y: 25 })
		editor.createShape<TLFrameShape>({ id: ids.frame1, type: 'frame', props: { w: 100, h: 100 } })
	})

	it('does not select the shape when clicked inside', () => {
		editor.sendToBack([ids.box1]) // send it to back!
		expect(editor.sortedShapesArray.map((s) => s.index)).toEqual(['a1', 'a2'])
		expect(editor.sortedShapesArray.map((s) => s.id)).toEqual([ids.box1, ids.frame1])
		editor.pointerDown(50, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('does not select the shape when clicked on its margin', () => {
		editor.pointerDown(25, 25)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})
})

describe('when shape is inside of a frame', () => {
	let frame1: TLFrameShape
	let box1: TLGeoShape
	beforeEach(() => {
		editor.createShape<TLFrameShape>({ id: ids.frame1, type: 'frame', props: { w: 100, h: 100 } })
		editor.createShape<TLGeoShape>({
			id: ids.box1,
			parentId: ids.frame1,
			type: 'geo',
			x: 25,
			y: 25,
		})
		frame1 = editor.getShape<TLFrameShape>(ids.frame1)!
		box1 = editor.getShape<TLGeoShape>(ids.box1)!
	})

	it('misses on pointer down over frame, misses on pointer up', () => {
		editor.pointerDown(10, 10) // inside of frame1, outside of box1, outside of all margins
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('misses on pointer down over shape, hits on pointer up', () => {
		editor.pointerDown(50, 50) // inside of box1
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})

	it('misses when shape is masked by frame on pointer down over shape, misses on pointer up', () => {
		editor.pointerDown(110, 50) // inside of box1 but outside of frame1
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('hits frame on pointer down over shape margin (inside)', () => {
		editor.pointerDown(96, 50) // inside of box1, in margin of frame1
		expect(editor.selectedIds).toEqual([frame1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([frame1.id])
	})

	it('hits frame on pointer down over shape margin where intersecting child shape margin (inside)', () => {
		editor.pointerDown(96, 25) // in margin of box1 AND frame1
		expect(editor.selectedIds).toEqual([box1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})

	it('hits frame on pointer down over shape margin (outside)', () => {
		editor.pointerDown(104, 25)
		expect(editor.selectedIds).toEqual([frame1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([frame1.id])
	})

	it('misses on pointer down outside of shape', () => {
		editor.pointerDown(250, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('brushes on point inside and drag', () => {
		editor.pointerDown(50, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerMove(55, 55)
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('misses when shape is behind frame', () => {
		editor.deleteShape(ids.box1)
		editor.createShape({
			id: ids.box5,
			parentId: editor.currentPageId,
			type: 'geo',
			props: {
				w: 75,
				h: 75,
			},
		})
		editor.sendToBack([ids.box5])
		editor.pointerDown(50, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])

		editor.pointerDown(75, 75)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})
})

describe('when a frame has multiple children', () => {
	let box1: TLGeoShape
	let box2: TLGeoShape
	beforeEach(() => {
		editor
			.createShape<TLFrameShape>({ id: ids.frame1, type: 'frame', props: { w: 100, h: 100 } })
			.createShape<TLGeoShape>({
				id: ids.box1,
				parentId: ids.frame1,
				type: 'geo',
				x: 25,
				y: 25,
			})
			.createShape<TLGeoShape>({
				id: ids.box2,
				parentId: ids.frame1,
				type: 'geo',
				x: 50,
				y: 50,
				props: {
					w: 80,
					h: 80,
				},
			})
		box1 = editor.getShape<TLGeoShape>(ids.box1)!
		box2 = editor.getShape<TLGeoShape>(ids.box2)!
	})

	it('selects the smaller of two overlapping hollow shapes on pointer up when both are the child of a frame', () => {
		// make box2 smaller
		editor.updateShape({ ...box2, props: { w: 99, h: 99 } })
		editor.pointerDown(64, 64)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box2])
		// flip it...
		editor.selectNone()
		editor.updateShape({ ...box2, props: { w: 101, h: 101 } })
		editor.pointerDown(64, 64)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1])
	})

	it('brush does not select a shape when brushing its masked parts', () => {
		editor.pointerDown(110, 0)
		editor.pointerMove(160, 160)
		editor.expectPathToBe('root.select.brushing')
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('brush selects a shape inside of the frame', () => {
		editor.pointerDown(10, 10)
		editor.pointerMove(30, 30)
		editor.expectPathToBe('root.select.brushing')
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1])
	})

	it('brush selects a shape when dragging from outside of the frame', () => {
		editor.pointerDown(-50, -50)
		editor.pointerMove(30, 30)
		editor.expectPathToBe('root.select.brushing')
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1])
	})

	it('brush selects shapes when containing them in a drag from outside of the frame', () => {
		editor.updateShape({ ...box1, x: 10, y: 10, props: { w: 10, h: 10 } })
		editor.updateShape({ ...box2, x: 20, y: 20, props: { w: 10, h: 10 } })
		editor.pointerDown(-50, -50)
		editor.pointerMove(99, 99)
		editor.expectPathToBe('root.select.brushing')
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
	})

	it('brush selects shapes when containing them in a drag from outside of the frame and also having the current page point outside of the frame without containing the frame', () => {
		editor.updateShape({ ...box1, x: 10, y: 10, props: { w: 10, h: 10 } })
		editor.updateShape({ ...box2, x: 20, y: 20, props: { w: 10, h: 10 } })
		editor.pointerDown(5, -50)
		editor.pointerMove(150, 150)
		editor.expectPathToBe('root.select.brushing')
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
	})

	it('selects only the frame when brush wraps the entire frame', () => {
		editor.updateShape({ ...box1, x: 10, y: 10, props: { w: 10, h: 10 } })
		editor.updateShape({ ...box2, x: 20, y: 20, props: { w: 10, h: 10 } })
		editor.pointerDown(-50, -50)
		editor.pointerMove(150, 150)
		editor.expectPathToBe('root.select.brushing')
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.frame1])
	})

	it('selects only the frame when brush wraps the entire frame (with overlapping / masked shapes)', () => {
		editor.pointerDown(-50, -50)
		editor.pointerMove(150, 150)
		editor.expectPathToBe('root.select.brushing')
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.frame1])
	})
})

describe('when shape is selected', () => {
	let box1: TLGeoShape
	beforeEach(() => {
		editor.createShapes([{ id: ids.box1, type: 'geo', props: { fill: 'none' } }])
		box1 = editor.getShape<TLGeoShape>(ids.box1)!
		editor.select(ids.box1)
	})

	it('misses on pointer down over shape, hits on pointer up', () => {
		editor.pointerDown(50, 50)
		expect(editor.selectedIds).toEqual([box1.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})
})

describe('When shapes are overlapping', () => {
	let box1: TLGeoShape
	let box2: TLGeoShape
	let box3: TLGeoShape
	let box4: TLGeoShape
	let box5: TLGeoShape
	beforeEach(() => {
		editor.createShapes<TLGeoShape>([
			{
				id: ids.box1,
				type: 'geo',
				x: 0,
				y: 0,
				props: {
					w: 300,
					h: 300,
				},
			},
			{
				id: ids.box2,
				type: 'geo',
				x: 50,
				y: 50,
				props: {
					w: 100,
					h: 150,
				},
			},
			{
				id: ids.box3,
				type: 'geo',
				x: 75,
				y: 75,
				props: {
					w: 100,
					h: 100,
				},
			},
			{
				id: ids.box4,
				type: 'geo',
				x: 100,
				y: 25,
				props: {
					w: 100,
					h: 100,
					fill: 'solid',
				},
			},
			{
				id: ids.box5,
				type: 'geo',
				x: 125,
				y: 0,
				props: {
					w: 100,
					h: 100,
					fill: 'solid',
				},
			},
		])

		box1 = editor.getShape<TLGeoShape>(ids.box1)!
		box2 = editor.getShape<TLGeoShape>(ids.box2)!
		box3 = editor.getShape<TLGeoShape>(ids.box3)!
		box4 = editor.getShape<TLGeoShape>(ids.box4)!
		box5 = editor.getShape<TLGeoShape>(ids.box5)!

		editor.sendToBack([ids.box4])
		editor.bringToFront([ids.box5])
		editor.bringToFront([ids.box2])

		expect(editor.sortedShapesArray.map((s) => s.id)).toEqual([
			ids.box4, // filled
			ids.box1, // hollow
			ids.box3, // hollow
			ids.box5, // filled
			ids.box2, // hollow
		])
	})

	it('selects the filled shape behind the hollow shapes', () => {
		editor.pointerDown(110, 90)
		expect(editor.selectedIds).toEqual([box4.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box4.id])
	})

	it('selects the hollow above the filled shapes when in margin', () => {
		expect(editor.sortedShapesArray.map((s) => s.id)).toEqual([
			ids.box4,
			ids.box1,
			ids.box3,
			ids.box5,
			ids.box2,
		])

		editor.pointerDown(125, 50)
		expect(editor.selectedIds).toEqual([box2.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box2.id])
	})

	it('selects the front-most filled shape', () => {
		editor.pointerDown(175, 50)
		expect(editor.selectedIds).toEqual([box5.id])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box5.id])
	})

	it('selects the smallest overlapping hollow shape', () => {
		editor.pointerDown(125, 150)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box3.id])
		editor.selectNone()
		editor.pointerDown(65, 65)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box2.id])
		editor.selectNone()
		editor.pointerDown(35, 35)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([box1.id])
	})
})

describe('Selects inside of groups', () => {
	beforeEach(() => {
		editor.createShapes([
			{ id: ids.box1, type: 'geo', x: 0, y: 0, props: { w: 100, h: 100 } },
			{ id: ids.box2, type: 'geo', x: 200, y: 0, props: { w: 100, h: 100, fill: 'solid' } },
		])
		editor.groupShapes([ids.box1, ids.box2], ids.group1)
		editor.selectNone()
	})

	it('cretes the group with the correct bounds', () => {
		expect(editor.getGeometry(ids.group1).bounds).toMatchObject({
			x: 0,
			y: 0,
			w: 300,
			h: 100,
		})
	})

	it('does not selects the group when clicking over the group but between grouped shapes bounds', () => {
		editor.pointerDown(150, 50)
		expect(editor.selectedIds).toEqual([])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('selects on page down when over a shape edge', () => {
		editor.pointerDown(0, 0)
		expect(editor.selectedIds).toEqual([ids.group1])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.group1])
	})

	it('selects on page down when over a filled shape', () => {
		editor.pointerDown(250, 50)
		expect(editor.selectedIds).toEqual([ids.group1])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.group1])
	})

	it('drops selection when pointing up on the space between shapes in a group', () => {
		editor.pointerDown(0, 0)
		expect(editor.selectedIds).toEqual([ids.group1])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.group1])
		editor.pointerDown(150, 50)
		editor.expectToBeIn('select.pointing_selection')
		expect(editor.selectedIds).toEqual([ids.group1])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([])
	})

	it('selects child when pointing on a filled child shape', () => {
		editor.pointerDown(250, 0)
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.group1])
		editor.pointerDown(250, 50)
		editor.expectToBeIn('select.pointing_shape')
		expect(editor.selectedIds).toEqual([ids.group1])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box2])
	})

	it('selects child when pointing inside of a hollow child shape', () => {
		editor.pointerDown(50, 50)
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.group1])
		editor.pointerDown(50, 50)
		editor.expectToBeIn('select.pointing_selection')
		expect(editor.selectedIds).toEqual([ids.group1])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1])
	})

	it('selects a solid shape in a group when double clicking it', () => {
		editor.doubleClick(250, 50)
		expect(editor.selectedIds).toEqual([ids.box2])
		expect(editor.focusLayerId).toBe(ids.group1)
	})

	it('selects a solid shape in a group when double clicking its margin', () => {
		editor.doubleClick(198, 50)
		expect(editor.selectedIds).toEqual([ids.box2])
		expect(editor.focusLayerId).toBe(ids.group1)
	})

	it('selects a hollow shape in a group when double clicking it', () => {
		editor.doubleClick(50, 50)
		expect(editor.selectedIds).toEqual([ids.box1])
		expect(editor.focusLayerId).toBe(ids.group1)
	})

	it('selects a hollow shape in a group when double clicking its edge', () => {
		editor.doubleClick(102, 50)
		expect(editor.selectedIds).toEqual([ids.box1])
		expect(editor.focusLayerId).toBe(ids.group1)
	})

	it('double clicks a hollow shape when the focus layer is the shapes parent', () => {
		editor.doubleClick(50, 50)
		editor.doubleClick(50, 50)
		expect(editor.editingId).toBe(ids.box1)
		editor.expectToBeIn('select.editing_shape')
	})

	it('double clicks a solid shape when the focus layer is the shapes parent', () => {
		editor.doubleClick(250, 50)
		editor.doubleClick(250, 50)
		expect(editor.editingId).toBe(ids.box2)
		editor.expectToBeIn('select.editing_shape')
	})

	it('double clicks a sibling shape when the focus layer is the shapes parent', () => {
		editor.doubleClick(50, 50)
		editor.doubleClick(250, 50)
		expect(editor.editingId).toBe(ids.box2)
		editor.expectToBeIn('select.editing_shape')
	})

	it('selects a different sibling shape when editing a layer', () => {
		editor.doubleClick(50, 50)
		editor.doubleClick(50, 50)
		expect(editor.editingId).toBe(ids.box1)
		editor.expectToBeIn('select.editing_shape')
		editor.pointerDown(250, 50)
		editor.expectToBeIn('select.pointing_shape')
		expect(editor.editingId).toBe(null)
		expect(editor.selectedIds).toEqual([ids.box2])
	})
})

describe('when selecting behind selection', () => {
	beforeEach(() => {
		editor
			.createShapes([
				{ id: ids.box1, type: 'geo', x: 100, y: 0 },
				{ id: ids.box2, type: 'geo', x: 0, y: 0 },
				{ id: ids.box3, type: 'geo', x: 200, y: 0 },
			])
			.select(ids.box2, ids.box3)
	})

	it('does not select on pointer down, only on pointer up', () => {
		editor.pointerDown(150, 50) // inside of box 1
		expect(editor.selectedIds).toEqual([ids.box2, ids.box3])
		editor.pointerUp(150, 50)
		expect(editor.selectedIds).toEqual([ids.box1])
	})

	it('can drag the selection', () => {
		editor.pointerDown(150, 50) // inside of box 1
		expect(editor.selectedIds).toEqual([ids.box2, ids.box3])
		editor.pointerMove(250, 50)
		editor.expectToBeIn('select.translating')
		editor.pointerMove(150, 50)
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box2, ids.box3])
	})
})

describe('when shift+selecting', () => {
	beforeEach(() => {
		editor
			.createShapes([
				{ id: ids.box1, type: 'geo', x: 0, y: 0 },
				{ id: ids.box2, type: 'geo', x: 200, y: 0 },
				{ id: ids.box3, type: 'geo', x: 400, y: 0, props: { fill: 'solid' } },
			])
			.select(ids.box1)
	})

	it('adds solid shape to selection on pointer down', () => {
		editor.keyDown('Shift')
		editor.pointerMove(450, 50) // inside of box 3
		editor.pointerDown()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box3])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box3])
	})

	it('adds and removes solid shape from selection on pointer up (without causing a double click)', () => {
		editor.keyDown('Shift')
		editor.pointerMove(450, 50) // above box 3
		editor.pointerDown()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box3])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box3])
		editor.pointerDown()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box3])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1])
	})

	it('adds how shape to selection on pointer down when pointing margin', () => {
		editor.keyDown('Shift')
		editor.pointerMove(204, 50) // inside of box 2 margin
		editor.pointerDown()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
	})

	it('adds and removes hollow shape from selection on pointer up (without causing a double click) when pointing margin', () => {
		editor.keyDown('Shift')
		editor.pointerMove(204, 50) // inside of box 2 margin
		editor.pointerDown()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
		editor.pointerDown()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1])
	})

	it('adds hollow shape to selection on pointer up', () => {
		editor.keyDown('Shift')
		editor.pointerMove(250, 50) // above box 2
		editor.pointerDown()
		expect(editor.selectedIds).toEqual([ids.box1])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
	})

	it('adds and removes solid shape from selection on pointer up (without causing a double click)', () => {
		editor.keyDown('Shift')
		editor.pointerMove(250, 50) // above box 2
		editor.pointerDown()
		expect(editor.selectedIds).toEqual([ids.box1])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
		editor.pointerDown()
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
		editor.pointerUp()
		expect(editor.selectedIds).toEqual([ids.box1])
	})
})

describe('when shift+selecting a group', () => {
	beforeEach(() => {
		editor
			.createShapes([
				{ id: ids.box1, type: 'geo', x: 0, y: 0 },
				{ id: ids.box2, type: 'geo', x: 200, y: 0 },
				{ id: ids.box3, type: 'geo', x: 400, y: 0, props: { fill: 'solid' } },
				{ id: ids.box4, type: 'geo', x: 600, y: 0 },
			])
			.groupShapes([ids.box2, ids.box3], ids.group1)
			.select(ids.box1)
	})

	it('does not add group to selection when pointing empty space in the group', () => {
		editor.pointerDown(350, 50, { target: 'canvas' }, { shiftKey: true }) // inside of box 2, inside of group 1
		expect(editor.selectedIds).toEqual([ids.box1])
		editor.pointerUp(350, 50, { target: 'canvas' }, { shiftKey: true })
		expect(editor.selectedIds).toEqual([ids.box1])
	})

	it('adds to selection on shift + on pointer up when clicking in hollow shape', () => {
		editor.pointerDown(250, 50, { target: 'canvas' }, { shiftKey: true }) // inside of box 2, inside of group 1
		expect(editor.selectedIds).toEqual([ids.box1])
		editor.pointerUp(250, 50, { target: 'canvas' }, { shiftKey: true })
		expect(editor.selectedIds).toEqual([ids.box1, ids.group1])
	})

	it('adds to selection on pointer down when clicking in margin', () => {
		editor.pointerDown(304, 50, { target: 'canvas' }, { shiftKey: true }) // inside of box 2, inside of group 1
		expect(editor.selectedIds).toEqual([ids.box1, ids.group1])
		editor.pointerUp(304, 50, { target: 'canvas' }, { shiftKey: true })
		expect(editor.selectedIds).toEqual([ids.box1, ids.group1])
	})

	it('adds to selection on pointer down when clicking in filled', () => {
		editor.pointerDown(450, 50, { target: 'canvas' }, { shiftKey: true }) // inside of box 2, inside of group 1
		expect(editor.selectedIds).toEqual([ids.box1, ids.group1])
		editor.pointerUp(450, 50, { target: 'canvas' }, { shiftKey: true })
		expect(editor.selectedIds).toEqual([ids.box1, ids.group1])
	})

	it('brushes on down + move', () => {
		editor.pointerDown(250, 50, { target: 'canvas' }, { shiftKey: true }) // inside of box 2, inside of group 1
		expect(editor.selectedIds).toEqual([ids.box1])
		editor.pointerUp(250, 50, { target: 'canvas' }, { shiftKey: true })
		expect(editor.selectedIds).toEqual([ids.box1, ids.group1])
	})

	it('deselects on pointer up', () => {
		editor.pointerDown(250, 50, { target: 'canvas' }, { shiftKey: true }) // inside of box 2, inside of group 1
		expect(editor.selectedIds).toEqual([ids.box1])
		editor.pointerUp(250, 50, { target: 'canvas' }, { shiftKey: true })
		expect(editor.selectedIds).toEqual([ids.box1, ids.group1])
		editor.pointerDown(250, 50, { target: 'canvas' }, { shiftKey: true })
		expect(editor.selectedIds).toEqual([ids.box1, ids.group1])
		editor.pointerUp(250, 50, { target: 'canvas' }, { shiftKey: true })
		expect(editor.selectedIds).toEqual([ids.box1])
	})
})

describe('When children / descendants of a group are selected', () => {
	beforeEach(() => {
		editor
			.createShapes([
				{ id: ids.box1, type: 'geo', x: 0, y: 0 },
				{ id: ids.box2, type: 'geo', x: 200, y: 0 },
				{ id: ids.box3, type: 'geo', x: 400, y: 0, props: { fill: 'solid' } },
				{ id: ids.box4, type: 'geo', x: 600, y: 0 },
				{ id: ids.box5, type: 'geo', x: 800, y: 0 },
			])
			.groupShapes([ids.box1, ids.box2], ids.group1)
			.groupShapes([ids.box3, ids.box4], ids.group2)
			.groupShapes([ids.group1, ids.group2], ids.group3)
			.selectNone()
	})

	it('selects the child', () => {
		editor.select(ids.box1)
		expect(editor.selectedIds).toEqual([ids.box1])
		expect(editor.focusLayerId).toBe(ids.group1)
	})

	it('selects the children', () => {
		editor.select(ids.box1, ids.box2)
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2])
		expect(editor.focusLayerId).toBe(ids.group1)
	})

	it('does not allow parents and children to be selected, picking the parent', () => {
		editor.select(ids.group1, ids.box1)
		expect(editor.selectedIds).toEqual([ids.group1])
		expect(editor.focusLayerId).toBe(ids.group3)

		editor.select(ids.group1, ids.box1, ids.box2)
		expect(editor.selectedIds).toEqual([ids.group1])
		expect(editor.focusLayerId).toBe(ids.group3)
	})

	it('does not allow ancestors and children to be selected, picking the ancestor', () => {
		editor.select(ids.group3, ids.box1)
		expect(editor.selectedIds).toEqual([ids.group3])
		expect(editor.focusLayerId).toBe(editor.currentPageId)

		editor.select(ids.group3, ids.box1, ids.box2)
		expect(editor.selectedIds).toEqual([ids.group3])
		expect(editor.focusLayerId).toBe(editor.currentPageId)

		editor.select(ids.group3, ids.group2, ids.box1)
		expect(editor.selectedIds).toEqual([ids.group3])
		expect(editor.focusLayerId).toBe(editor.currentPageId)
	})

	it('picks the highest common focus layer id', () => {
		editor.select(ids.box1, ids.box4) // child of group1, child of group 2
		expect(editor.selectedIds).toEqual([ids.box1, ids.box4])
		expect(editor.focusLayerId).toBe(ids.group3)
	})

	it('picks the highest common focus layer id', () => {
		editor.select(ids.box1, ids.box5) // child of group1 and child of the page
		expect(editor.selectedIds).toEqual([ids.box1, ids.box5])
		expect(editor.focusLayerId).toBe(editor.currentPageId)
	})

	// it('sets the parent to the highest common ancestor', () => {
	// 	editor.selectNone()
	// 	expect(editor.focusLayerId).toBe(editor.currentPageId)
	// 	editor.select(ids.group3)
	// 	expect(editor.focusLayerId).toBe(editor.currentPageId)
	// 	editor.select(ids.group3, ids.box1)
	// 	expect(editor.focusLayerId).toBe(editor.currentPageId)
	// 	expect(editor.selectedIds).toEqual([ids.group3, ids.box1])
	// })
})

describe('When pressing the enter key with groups selected', () => {
	beforeEach(() => {
		editor
			.createShapes([
				{ id: ids.box1, type: 'geo', x: 0, y: 0 },
				{ id: ids.box2, type: 'geo', x: 200, y: 0 },
				{ id: ids.box3, type: 'geo', x: 400, y: 0, props: { fill: 'solid' } },
				{ id: ids.box4, type: 'geo', x: 600, y: 0 },
				{ id: ids.box5, type: 'geo', x: 800, y: 0 },
			])
			.groupShapes([ids.box1, ids.box2], ids.group1)
			.groupShapes([ids.box3, ids.box4], ids.group2)
	})

	it('selects the children of the groups on enter up', () => {
		editor.select(ids.group1, ids.group2)
		editor.keyDown('Enter')
		expect(editor.selectedIds).toEqual([ids.group1, ids.group2])
		expect(editor.focusLayerId).toBe(editor.currentPageId)
		editor.keyUp('Enter')
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2, ids.box3, ids.box4])
		expect(editor.focusLayerId).toBe(editor.currentPageId)
	})

	it('repeats children of the groups on enter up', () => {
		editor.groupShapes([ids.group1, ids.group2], ids.group3)
		editor.select(ids.group3)
		expect(editor.selectedIds).toEqual([ids.group3])
		editor.keyDown('Enter').keyUp('Enter')
		expect(editor.selectedIds).toEqual([ids.group1, ids.group2])
		expect(editor.focusLayerId).toBe(ids.group3)
		editor.keyDown('Enter').keyUp('Enter')
		expect(editor.selectedIds).toEqual([ids.box1, ids.box2, ids.box3, ids.box4])
		expect(editor.focusLayerId).toBe(ids.group3)
	})

	it('does not select the children of the group if a non-group is also selected', () => {
		editor.select(ids.group1, ids.group2, ids.box5)
		editor.keyDown('Enter')
		expect(editor.selectedIds).toEqual([ids.group1, ids.group2, ids.box5])
		editor.keyUp('Enter')
		expect(editor.selectedIds).toEqual([ids.group1, ids.group2, ids.box5])
	})
})

it.todo('shift selects to add to and remove from the selection')
it.todo('shift brushes to add to the selection')
it.todo('scribble brushes to add to the selection')
it.todo('alt brushes to select only when containing a shape')
it.todo('does not select a hollow closed shape that contains the viewport?')
it.todo('does not select a hollow closed shape if the negative distance is more than X?')

it.todo(
	'maybe? does not edit a hollow geo shape when double clicking inside of it unless it already has a label OR the double click is in the middle of the shape'
)

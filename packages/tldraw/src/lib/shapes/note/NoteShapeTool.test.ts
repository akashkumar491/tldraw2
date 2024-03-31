import { TestEditor } from '../../../test/TestEditor'
import { NoteShapeTool } from './NoteShapeTool'

let editor: TestEditor

beforeEach(() => {
	editor = new TestEditor()
})
afterEach(() => {
	editor?.dispose()
})

describe(NoteShapeTool, () => {
	it('Creates note shapes on click-and-drag, supports undo and redo', () => {
		expect(editor.getCurrentPageShapes().length).toBe(0)

		editor.setCurrentTool('note')
		editor.pointerDown(50, 50)
		editor.pointerMove(100, 100)
		editor.pointerUp(100, 100)

		expect(editor.getCurrentPageShapes().length).toBe(1)
		expect(editor.getCurrentPageShapes()[0]?.type).toBe('note')
		expect(editor.getSelectedShapeIds()[0]).toBe(editor.getCurrentPageShapes()[0]?.id)

		editor.cancel() // leave edit mode

		editor.undo() // undoes the selection change
		editor.undo()

		expect(editor.getCurrentPageShapes().length).toBe(0)

		editor.redo()

		expect(editor.getCurrentPageShapes().length).toBe(1)
	})

	it('Creates note shapes on click, supports undo and redo', () => {
		expect(editor.getCurrentPageShapes().length).toBe(0)

		editor.setCurrentTool('note')
		editor.pointerDown(50, 50)
		editor.pointerUp(50, 50)

		expect(editor.getCurrentPageShapes().length).toBe(1)
		expect(editor.getCurrentPageShapes()[0]?.type).toBe('note')
		expect(editor.getSelectedShapeIds()[0]).toBe(editor.getCurrentPageShapes()[0]?.id)

		editor.undo()

		expect(editor.getCurrentPageShapes().length).toBe(0)

		editor.redo()

		expect(editor.getCurrentPageShapes().length).toBe(1)
	})
})

describe('When selecting the tool', () => {
	it('selects the tool and enters the idle state', () => {
		editor.setCurrentTool('note')
		editor.expectToBeIn('note.idle')
	})
})

describe('When in the idle state', () => {
	it('Enters pointing state on pointer down', () => {
		editor.setCurrentTool('note')
		editor.pointerDown(100, 100)
		editor.expectToBeIn('note.pointing')
	})

	it('Switches back to select tool on cancel', () => {
		editor.setCurrentTool('note')
		editor.cancel()
		editor.expectToBeIn('select.idle')
	})

	it('Does nothing on interrupt', () => {
		editor.setCurrentTool('note')
		editor.interrupt()
		editor.expectToBeIn('note.idle')
	})
})

describe('When in the pointing state', () => {
	it('Switches back to idle on cancel', () => {
		editor.setCurrentTool('note')
		editor.pointerDown(50, 50)
		editor.expectToBeIn('note.pointing')
		editor.cancel()
		editor.expectToBeIn('note.idle')
	})

	it('Enters the select.translating state on drag start', () => {
		editor.setCurrentTool('note')
		editor.pointerDown(50, 50)
		editor.pointerMove(51, 51) // not far enough!
		editor.expectToBeIn('note.pointing')
		editor.pointerMove(55, 55)
		editor.expectToBeIn('select.translating')
	})

	it('Returns to the note tool on cancel from translating', () => {
		editor.setCurrentTool('note')
		editor.pointerDown(50, 50)
		editor.pointerMove(55, 55)
		editor.cancel()
		editor.expectToBeIn('note.idle')
	})

	it('Returns to the note tool on complete from translating when tool lock is enabled', () => {
		editor.updateInstanceState({ isToolLocked: true })
		editor.setCurrentTool('note')
		editor.pointerDown(50, 50)
		editor.pointerMove(55, 55)
		editor.pointerUp()
		editor.expectToBeIn('note.idle')
	})

	it('Returns to the idle state on interrupt', () => {
		editor.setCurrentTool('note')
		editor.pointerDown(50, 50)
		editor.interrupt()
		editor.expectToBeIn('note.idle')
	})

	it('Creates a note and begins editing on pointer up', () => {
		expect(editor.getCurrentPageShapes().length).toBe(0)
		editor.setCurrentTool('note')
		editor.pointerDown(50, 50)
		editor.pointerUp(50, 50)
		editor.expectToBeIn('select.editing_shape')
		expect(editor.getCurrentPageShapes().length).toBe(1)
	})

	it('Creates a frame and returns to frame.idle on pointer up if tool lock is enabled', () => {
		editor.updateInstanceState({ isToolLocked: true })
		expect(editor.getCurrentPageShapes().length).toBe(0)
		editor.setCurrentTool('note')
		editor.pointerDown(50, 50)
		editor.pointerUp(50, 50)
		editor.expectToBeIn('note.idle')
		expect(editor.getCurrentPageShapes().length).toBe(1)
	})
})

describe('Grid placement helpers', () => {
	it('Creates a new sticky note outside of a sticky pit', () => {
		editor.createShape({ type: 'note', x: 0, y: 0 })

		for (const pit of [
			{ x: 100, y: -120 },
			{ x: 320, y: 100 },
			{ x: 100, y: 320 },
			{ x: -120, y: 100 },
		]) {
			const OFFSET_DISTANCE = 8
			editor
				.setCurrentTool('note')
				.pointerMove(pit.x + OFFSET_DISTANCE, pit.y + OFFSET_DISTANCE) // too far from the pit
				.click()
				.expectShapeToMatch({
					id: editor.getLastCreatedShapes()[0].id,
					x: pit.x + OFFSET_DISTANCE - 100,
					y: pit.y + OFFSET_DISTANCE - 100,
				})
		}
	})

	it('Creates a new sticky note in a sticky pit', () => {
		editor.createShape({ type: 'note', x: 0, y: 0 })

		for (const pit of [
			{ x: 100, y: -120 },
			{ x: 320, y: 100 },
			{ x: 100, y: 320 },
			{ x: -120, y: 100 },
		]) {
			const OFFSET_DISTANCE = 7 // close enough to the pit to fall into it
			editor
				.setCurrentTool('note')
				.pointerMove(pit.x + OFFSET_DISTANCE, pit.y + OFFSET_DISTANCE)
				.click()
				.expectShapeToMatch({
					id: editor.getLastCreatedShapes()[0].id,
					x: pit.x - 100,
					y: pit.y - 100,
				})
		}
	})

	it('Does not fall into pits around rotated notes', () => {
		editor.createShape({ type: 'note', x: 0, y: 0, rotation: 0.0000001 })

		for (const pit of [
			{ x: 100, y: -120 },
			{ x: 320, y: 100 },
			{ x: 100, y: 320 },
			{ x: -120, y: 100 },
		]) {
			const OFFSET_DISTANCE = 7 // close enough to the pit to fall into it (if it weren't rotated)
			editor
				.setCurrentTool('note')
				.pointerMove(pit.x + OFFSET_DISTANCE, pit.y + OFFSET_DISTANCE)
				.click()
				.expectShapeToMatch({
					id: editor.getLastCreatedShapes()[0].id,
					x: pit.x + OFFSET_DISTANCE - 100,
					y: pit.y + OFFSET_DISTANCE - 100,
				})
		}
	})

	it('Falls into correct pit below notes with growY', () => {
		editor
			.createShape({ type: 'note', x: 0, y: 0 })
			.updateShape({ id: editor.getLastCreatedShapes()[0].id, type: 'note', props: { growY: 100 } })

		// Misses the pit below the note because the note has growY
		// instead of being at 100, 320, it's at 100, 320 + 100 = 320
		editor
			.setCurrentTool('note')
			.pointerMove(100, 324)
			.click()
			.expectShapeToMatch({
				id: editor.getLastCreatedShapes()[0].id,
				x: 0,
				y: 224,
			})
			.undo()

		// Let's get it in that pit
		editor
			.setCurrentTool('note')
			.pointerMove(100, 424)
			.click()
			.expectShapeToMatch({
				id: editor.getLastCreatedShapes()[0].id,
				x: 0,
				y: 320,
			})
			.undo()
	})
})

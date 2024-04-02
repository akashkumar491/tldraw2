import {
	ANIMATION_MEDIUM_MS,
	Editor,
	TLNoteShape,
	TLShape,
	Vec,
	compact,
	createShapeId,
} from '@tldraw/editor'

/** @internal */
export const ADJACENT_NOTE_MARGIN = 20
/** @internal */
export const CLONE_HANDLE_MARGIN = 0
/** @internal */
export const NOTE_SIZE = 200
/** @internal */
export const CENTER_OFFSET = { x: NOTE_SIZE / 2, y: NOTE_SIZE / 2 }
/** @internal */
export const NOTE_PIT_RADIUS = 10
/** @internal */
export type NotePit = Vec

const DEFAULT_PITS: NotePit[] = [
	new Vec(NOTE_SIZE * 0.5, NOTE_SIZE * -0.5 - ADJACENT_NOTE_MARGIN), // t
	new Vec(NOTE_SIZE * 1.5 + ADJACENT_NOTE_MARGIN, NOTE_SIZE * 0.5), // r
	new Vec(NOTE_SIZE * 0.5, NOTE_SIZE * 1.5 + ADJACENT_NOTE_MARGIN), // b
	new Vec(NOTE_SIZE * -0.5 - ADJACENT_NOTE_MARGIN, NOTE_SIZE * 0.5), // l
]

/** @internal */
export function getNotePitsForShape(
	pagePoint: Vec,
	pageRotation: number,
	growY: number,
	extraHeight: number
) {
	return DEFAULT_PITS.map((v, i) => {
		const point = v.clone()
		if (i === 0 && extraHeight) {
			// apply top margin (the growY of the moving note shape)
			point.y -= extraHeight
		} else if (i === 2 && growY) {
			// apply bottom margin (the growY of this note shape)
			point.y += growY
		}
		return point.rot(pageRotation).add(pagePoint)
	})
}

/** @internal */
export function getNotePits(editor: Editor, rotation: number, extraHeight: number) {
	const selectedShapeIds = editor.getSelectedShapeIds()
	const allUnselectedNoteShapes = editor
		.getCurrentPageShapes()
		.filter((shape) => shape.type === 'note' && !selectedShapeIds.includes(shape.id))
	return compact(
		allUnselectedNoteShapes.flatMap((shape) => {
			if (!editor.isShapeOfType<TLNoteShape>(shape, 'note')) return
			const transform = editor.getShapePageTransform(shape.id)!
			const pageRotation = transform.rotation()
			// We only want to create pits for notes with the specified rotation
			if (rotation !== pageRotation) return
			const pagePoint = transform.point()
			return getNotePitsForShape(pagePoint, pageRotation, shape.props.growY, extraHeight)
		})
	).filter((pit) => !allUnselectedNoteShapes.some((shape) => editor.isPointInShape(shape, pit)))
}

/** @internal */
export function createOrSelectNoteInPosition(
	editor: Editor,
	shape: TLNoteShape,
	center: Vec,
	pageRotation: number,
	forceNew = false
) {
	// There might already be a note in that position! If there is, we'll
	// select the next note and switch focus to it. If there's not, then
	// we'll create a new note in that position.

	let nextNote: TLShape | undefined

	// Check the center of where a new note would be
	// Start from the top of the stack, and work our way down
	const allShapesOnPage = editor.getCurrentPageShapesSorted()

	for (let i = allShapesOnPage.length - 1; i >= 0; i--) {
		const otherNote = allShapesOnPage[i]
		if (otherNote.type === 'note') {
			if (otherNote.id === shape.id) continue
			if (editor.isPointInShape(otherNote, center)) {
				nextNote = otherNote
				break
			}
		}
	}

	editor.complete()
	editor.mark()

	// If we didn't find any in that position, then create a new one
	if (!nextNote || forceNew) {
		const id = createShapeId()

		// We create it at the center first, so that it becomes
		//  the child of whatever parent was at that center
		editor.createShape({
			id,
			type: 'note',
			x: center.x,
			y: center.y,
			rotation: pageRotation,
		})

		// Now we need to correct its location within its new parent

		const createdShape = editor.getShape(id)!

		// We need to put the page point in the same coordinate
		// space as the newly created shape (i.e its parent's space)
		const topLeft = editor.getPointInParentSpace(
			createdShape,
			Vec.Sub(center, Vec.Rot(CENTER_OFFSET, pageRotation))
		)

		editor.updateShape({
			id,
			type: 'note',
			x: topLeft.x,
			y: topLeft.y,
		})

		nextNote = editor.getShape(id)!
	}

	// Animate to the next sticky if it would be off screen
	const selectionPageBounds = editor.getSelectionPageBounds()
	const viewportPageBounds = editor.getViewportPageBounds()
	if (selectionPageBounds && !viewportPageBounds.contains(selectionPageBounds)) {
		editor.centerOnPoint(selectionPageBounds.center, {
			duration: ANIMATION_MEDIUM_MS,
		})
	}

	return nextNote
}

/** @internal */
export function startEditingNoteShape(editor: Editor, shape: TLShape) {
	// Finish this sticky and start editing the next one
	editor.select(shape)
	editor.setEditingShape(shape)
	editor.setCurrentTool('select.editing_shape', {
		target: 'shape',
		shape: shape,
	})

	// Select any text that's in the newly selected sticky
	;(document.getElementById(`text-input-${shape.id}`) as HTMLTextAreaElement)?.select()

	const selectionPageBounds = editor.getSelectionPageBounds()
	const viewportPageBounds = editor.getViewportPageBounds()
	if (selectionPageBounds && !viewportPageBounds.contains(selectionPageBounds)) {
		editor.centerOnPoint(selectionPageBounds.center, {
			duration: ANIMATION_MEDIUM_MS,
		})
	}
}

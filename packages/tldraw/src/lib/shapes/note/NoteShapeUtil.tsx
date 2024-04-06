import {
	Editor,
	Group2d,
	IndexKey,
	Rectangle2d,
	ShapeUtil,
	SvgExportContext,
	TLGroupShape,
	TLHandle,
	TLNoteShape,
	TLOnEditEndHandler,
	TLShape,
	TLShapeId,
	Vec,
	WeakMapCache,
	getDefaultColorTheme,
	noteShapeMigrations,
	noteShapeProps,
	rng,
	toDomPrecision,
	useEditor,
	useValue,
} from '@tldraw/editor'
import { useCallback } from 'react'
import { useCurrentTranslation } from '../../ui/hooks/useTranslation/useTranslation'
import { isRightToLeftLanguage } from '../../utils/text/text'
import { HyperlinkButton } from '../shared/HyperlinkButton'
import { useDefaultColorTheme } from '../shared/ShapeFill'
import { SvgTextLabel } from '../shared/SvgTextLabel'
import { TextLabel } from '../shared/TextLabel'
import {
	FONT_FAMILIES,
	LABEL_FONT_SIZES,
	LABEL_PADDING,
	TEXT_PROPS,
} from '../shared/default-shape-constants'
import { getFontDefForExport } from '../shared/defaultStyleDefs'

import { startEditingShapeWithLabel } from '../shared/TextHelpers'
import { useForceSolid } from '../shared/useForceSolid'
import {
	ADJACENT_NOTE_MARGIN,
	CLONE_HANDLE_MARGIN,
	NOTE_CENTER_OFFSET,
	NOTE_SIZE,
	getNoteShapeForAdjacentPosition,
} from './noteHelpers'

/** @public */
export class NoteShapeUtil extends ShapeUtil<TLNoteShape> {
	static override type = 'note' as const
	static override props = noteShapeProps
	static override migrations = noteShapeMigrations

	override canEdit = () => true
	override hideResizeHandles = () => true
	override hideSelectionBoundsFg = () => false

	override canReceiveNewChildrenOfType = (shape: TLNoteShape, type: string) => {
		return !shape.isLocked && type !== 'frame'
	}

	override canDropShapes = (shape: TLNoteShape, _shapes: TLShape[]): boolean => {
		return !shape.isLocked
	}

	override onDragShapesOver = (note: TLNoteShape, shapes: TLShape[]) => {
		if (!shapes.every((child) => child.parentId === note.id)) {
			const shapesWithoutFrames = shapes.filter(
				(shape) => !this.editor.isShapeOfType(shape, 'frame')
			)
			this.editor.reparentShapes(shapesWithoutFrames, note.id)
		}
	}

	override onDragShapesOut = (note: TLNoteShape, shapes: TLShape[]) => {
		const parent = this.editor.getShape(note.parentId)
		const isInGroup = parent && this.editor.isShapeOfType<TLGroupShape>(parent, 'group')

		// If sticky is in a group, keep the shape in that group

		if (isInGroup) {
			this.editor.reparentShapes(shapes, parent.id)
		} else {
			this.editor.reparentShapes(shapes, this.editor.getCurrentPageId())
		}
	}

	getDefaultProps(): TLNoteShape['props'] {
		return {
			color: 'black',
			size: 'm',
			text: '',
			font: 'draw',
			align: 'middle',
			verticalAlign: 'middle',
			growY: 0,
			fontSizeAdjustment: 0,
			url: '',
		}
	}

	getGeometry(shape: TLNoteShape) {
		const noteHeight = getNoteHeight(shape)
		const { labelHeight, labelWidth } = getLabelSize(this.editor, shape)

		return new Group2d({
			children: [
				new Rectangle2d({ width: NOTE_SIZE, height: noteHeight, isFilled: true }),
				new Rectangle2d({
					x:
						shape.props.align === 'start'
							? 0
							: shape.props.align === 'end'
								? NOTE_SIZE - labelWidth
								: (NOTE_SIZE - labelWidth) / 2,
					y:
						shape.props.verticalAlign === 'start'
							? 0
							: shape.props.verticalAlign === 'end'
								? noteHeight - labelHeight
								: (noteHeight - labelHeight) / 2,
					width: labelWidth,
					height: labelHeight,
					isFilled: true,
					isLabel: true,
				}),
			],
		})
	}

	override getHandles(shape: TLNoteShape): TLHandle[] {
		const zoom = this.editor.getZoomLevel()
		const offset = CLONE_HANDLE_MARGIN / zoom
		const noteHeight = getNoteHeight(shape)

		if (zoom < 0.25) return []

		return [
			{
				id: 'top',
				index: 'a1' as IndexKey,
				type: 'clone',
				x: NOTE_SIZE / 2,
				y: -offset,
			},
			{
				id: 'right',
				index: 'a2' as IndexKey,
				type: 'clone',
				x: NOTE_SIZE + offset,
				y: noteHeight / 2,
			},
			{
				id: 'bottom',
				index: 'a3' as IndexKey,
				type: 'clone',
				x: NOTE_SIZE / 2,
				y: noteHeight + offset,
			},
			{
				id: 'left',
				index: 'a4' as IndexKey,
				type: 'clone',
				x: -offset,
				y: noteHeight / 2,
			},
		]
	}

	component(shape: TLNoteShape) {
		const {
			id,
			type,
			props: { color, font, size, align, text, verticalAlign, fontSizeAdjustment },
		} = shape

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const handleKeyDown = useNoteKeydownHandler(id)

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const theme = useDefaultColorTheme()
		const noteHeight = getNoteHeight(shape)

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const rotation = useValue(
			'shape rotation',
			() => this.editor.getShapePageTransform(id)?.rotation() ?? 0,
			[this.editor]
		)

		// todo: consider hiding shadows on dark mode if they're invisible anyway
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const hideShadows = useForceSolid()

		const isSelected = shape.id === this.editor.getOnlySelectedShapeId()

		// Shadow stuff
		const oy = Math.cos(rotation)
		const ox = Math.sin(rotation)
		const random = rng(id)
		const lift = 1 + random() * 0.5

		const zoom = this.editor.getZoomLevel()

		return (
			<>
				<div
					id={id}
					className="tl-note__container"
					style={{
						width: NOTE_SIZE,
						height: noteHeight,
						backgroundColor: theme[color].note.fill,
						opacity: hideShadows ? 1 : 0.99,
						borderBottom: hideShadows ? `3px solid rgb(15, 23, 31, .2)` : 'none',
						boxShadow: hideShadows
							? 'none'
							: `${ox * 3}px ${4 - lift}px 5px -5px rgba(15, 23, 31,1),
						${ox * 6}px ${(4 + lift * 7) * Math.max(0, oy)}px ${6 + lift * 8}px -${4 + lift * 6}px rgba(15, 23, 31,${0.3 + lift * 0.1}), 
						0px 48px 10px -10px inset rgba(15, 23, 31,${0.02 + random() * 0.005})`,
					}}
				>
					<TextLabel
						id={id}
						type={type}
						font={font}
						fontSize={fontSizeAdjustment || LABEL_FONT_SIZES[size]}
						lineHeight={TEXT_PROPS.lineHeight}
						align={align}
						verticalAlign={verticalAlign}
						text={text}
						isNote
						isSelected={isSelected}
						labelColor={theme[color].note.text}
						wrap
						onKeyDown={handleKeyDown}
					/>
				</div>
				{'url' in shape.props && shape.props.url && (
					<HyperlinkButton url={shape.props.url} zoomLevel={zoom} />
				)}
			</>
		)
	}

	indicator(shape: TLNoteShape) {
		return (
			<rect
				rx="1"
				width={toDomPrecision(NOTE_SIZE)}
				height={toDomPrecision(getNoteHeight(shape))}
			/>
		)
	}

	override toSvg(shape: TLNoteShape, ctx: SvgExportContext) {
		ctx.addExportDef(getFontDefForExport(shape.props.font))
		if (shape.props.text) ctx.addExportDef(getFontDefForExport(shape.props.font))
		const theme = getDefaultColorTheme({ isDarkMode: ctx.isDarkMode })
		const bounds = this.editor.getShapeGeometry(shape).bounds
		const adjustedColor = shape.props.color === 'black' ? 'yellow' : shape.props.color

		return (
			<>
				<rect
					rx={10}
					width={NOTE_SIZE}
					height={bounds.h}
					fill={theme[adjustedColor].solid}
					stroke={theme[adjustedColor].solid}
					strokeWidth={1}
				/>
				<rect rx={10} width={NOTE_SIZE} height={bounds.h} fill={theme.background} opacity={0.28} />
				<SvgTextLabel
					fontSize={shape.props.fontSizeAdjustment || LABEL_FONT_SIZES[shape.props.size]}
					font={shape.props.font}
					align={shape.props.align}
					verticalAlign={shape.props.verticalAlign}
					text={shape.props.text}
					labelColor="black"
					bounds={bounds}
					stroke={false}
				/>
			</>
		)
	}

	override onBeforeCreate = (next: TLNoteShape) => {
		return getSizeAdjustments(this.editor, next)
	}

	override onBeforeUpdate = (prev: TLNoteShape, next: TLNoteShape) => {
		if (
			prev.props.text === next.props.text &&
			prev.props.font === next.props.font &&
			prev.props.size === next.props.size
		) {
			return
		}

		return getSizeAdjustments(this.editor, next)
	}

	override onTranslateStart = (shape: TLNoteShape) => {
		this.editor.bringToFront([shape])
	}

	override onEditEnd: TLOnEditEndHandler<TLNoteShape> = (shape) => {
		const {
			id,
			type,
			props: { text },
		} = shape

		if (text.trimEnd() !== shape.props.text) {
			this.editor.updateShapes([
				{
					id,
					type,
					props: {
						text: text.trimEnd(),
					},
				},
			])
		}
	}
}

/**
 * Get the growY and fontSizeAdjustment for a shape.
 */
function getSizeAdjustments(editor: Editor, shape: TLNoteShape) {
	const { labelHeight, fontSizeAdjustment } = getLabelSize(editor, shape)
	// When the label height is more than the height of the shape, we add extra height to it
	const growY = Math.max(0, labelHeight - NOTE_SIZE)

	if (growY !== shape.props.growY || fontSizeAdjustment !== shape.props.fontSizeAdjustment) {
		return {
			...shape,
			props: {
				...shape.props,
				growY,
				fontSizeAdjustment,
			},
		}
	}
}

/**
 * Get the label size for a note.
 */
function _getLabelSize(editor: Editor, shape: TLNoteShape) {
	const text = shape.props.text

	if (!text) {
		return { labelHeight: 0, labelWidth: 0, fontSizeAdjustment: 0 }
	}

	const unadjustedFontSize = LABEL_FONT_SIZES[shape.props.size]

	let fontSizeAdjustment = 0
	let iterations = 0
	let labelHeight = NOTE_SIZE
	let labelWidth = NOTE_SIZE

	// We slightly make the font smaller if the text is too big for the note, width-wise.
	do {
		fontSizeAdjustment = Math.min(unadjustedFontSize, unadjustedFontSize - iterations)
		const nextTextSize = editor.textMeasure.measureText(text, {
			...TEXT_PROPS,
			fontFamily: FONT_FAMILIES[shape.props.font],
			fontSize: fontSizeAdjustment,
			maxWidth: NOTE_SIZE - LABEL_PADDING * 2,
			disableOverflowWrapBreaking: true,
		})

		labelHeight = nextTextSize.h + LABEL_PADDING * 2
		labelWidth = nextTextSize.w + LABEL_PADDING * 2

		if (fontSizeAdjustment <= 14) {
			// Too small, just rely now on CSS `overflow-wrap: break-word`
			// We need to recalculate the text measurement here with break-word enabled.
			const nextTextSizeWithOverflowBreak = editor.textMeasure.measureText(text, {
				...TEXT_PROPS,
				fontFamily: FONT_FAMILIES[shape.props.font],
				fontSize: fontSizeAdjustment,
				maxWidth: NOTE_SIZE - LABEL_PADDING * 2,
			})
			labelHeight = nextTextSizeWithOverflowBreak.h + LABEL_PADDING * 2
			labelWidth = nextTextSizeWithOverflowBreak.w + LABEL_PADDING * 2
			break
		}

		if (nextTextSize.scrollWidth.toFixed(0) === nextTextSize.w.toFixed(0)) {
			break
		}
	} while (iterations++ < 50)

	return {
		labelHeight,
		labelWidth,
		fontSizeAdjustment,
	}
}

const labelSizesForNote = new WeakMapCache<TLShape, ReturnType<typeof _getLabelSize>>()

function getLabelSize(editor: Editor, shape: TLNoteShape) {
	return labelSizesForNote.get(shape, () => _getLabelSize(editor, shape))
}

function useNoteKeydownHandler(id: TLShapeId) {
	const editor = useEditor()
	const translation = useCurrentTranslation()

	return useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			const shape = editor.getShape<TLNoteShape>(id)
			if (!shape) return

			const isTab = e.key === 'Tab'
			const isCmdEnter = (e.metaKey || e.ctrlKey) && e.key === 'Enter'
			if (isTab || isCmdEnter) {
				e.preventDefault()

				const pageTransform = editor.getShapePageTransform(id)
				const pageRotation = pageTransform.rotation()

				// Based on the inputs, calculate the offset to the next note
				// tab controls x axis (shift inverts direction set by RTL)
				// cmd enter is the y axis (shift inverts direction)
				const isRTL = !!(translation.dir === 'rtl' || isRightToLeftLanguage(shape.props.text))

				const offsetLength =
					NOTE_SIZE +
					ADJACENT_NOTE_MARGIN +
					// If we're growing down, we need to account for the current shape's growY
					(isCmdEnter && !e.shiftKey ? shape.props.growY : 0)

				const adjacentCenter = new Vec(
					isTab ? (e.shiftKey != isRTL ? -1 : 1) : 0,
					isCmdEnter ? (e.shiftKey ? -1 : 1) : 0
				)
					.mul(offsetLength)
					.add(NOTE_CENTER_OFFSET)
					.rot(pageRotation)
					.add(pageTransform.point())

				const newNote = getNoteShapeForAdjacentPosition(editor, shape, adjacentCenter, pageRotation)

				if (newNote) {
					editor.mark('editing adjacent shape')
					startEditingShapeWithLabel(editor, newNote, true /* selectAll */)
				}
			}
		},
		[id, editor, translation.dir]
	)
}

function getNoteHeight(shape: TLNoteShape) {
	return NOTE_SIZE + shape.props.growY
}

import {
	ANIMATION_MEDIUM_MS,
	DefaultFontFamilies,
	Editor,
	Rectangle2d,
	ShapeUtil,
	SvgExportContext,
	TLNoteShape,
	TLOnEditEndHandler,
	TLShapeId,
	Vec,
	getDefaultColorTheme,
	noteShapeMigrations,
	noteShapeProps,
	toDomPrecision,
} from '@tldraw/editor'
import { HyperlinkButton } from '../shared/HyperlinkButton'
import { useDefaultColorTheme } from '../shared/ShapeFill'
import { TextLabel } from '../shared/TextLabel'
import { FONT_FAMILIES, LABEL_FONT_SIZES, TEXT_PROPS } from '../shared/default-shape-constants'
import { getFontDefForExport } from '../shared/defaultStyleDefs'
import { getTextLabelSvgElement } from '../shared/getTextLabelSvgElement'
import { createSticky } from './toolStates/Pointing'

export const INITIAL_NOTE_SIZE = 200

/** @public */
export class NoteShapeUtil extends ShapeUtil<TLNoteShape> {
	static override type = 'note' as const
	static override props = noteShapeProps
	static override migrations = noteShapeMigrations

	override canEdit = () => true
	override hideResizeHandles = () => true
	override hideSelectionBoundsFg = () => true

	getDefaultProps(): TLNoteShape['props'] {
		return {
			color: 'black',
			size: 'm',
			text: '',
			font: 'draw',
			align: 'middle',
			verticalAlign: 'middle',
			growY: 0,
			url: '',
		}
	}

	getHeight(shape: TLNoteShape) {
		return INITIAL_NOTE_SIZE + shape.props.growY
	}

	getGeometry(shape: TLNoteShape) {
		const height = this.getHeight(shape)
		return new Rectangle2d({ width: INITIAL_NOTE_SIZE, height, isFilled: true })
	}

	component(shape: TLNoteShape) {
		const {
			id,
			type,
			props: { color, font, size, align, text, verticalAlign },
		} = shape

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const theme = useDefaultColorTheme()
		const adjustedColor = color === 'black' ? 'yellow' : color

		return (
			<>
				<div
					style={{
						position: 'absolute',
						width: INITIAL_NOTE_SIZE,
						height: this.getHeight(shape),
					}}
				>
					<div
						className="tl-note__container"
						style={{
							color: theme[adjustedColor].solid,
							backgroundColor: theme[adjustedColor].solid,
						}}
					>
						<div className="tl-note__scrim" />
						<TextLabel
							id={id}
							type={type}
							font={font}
							size={size}
							align={align}
							verticalAlign={verticalAlign}
							text={text}
							labelColor="black"
							wrap
							onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => this.handleKeyDown(e, id)}
						/>
					</div>
				</div>
				{'url' in shape.props && shape.props.url && (
					<HyperlinkButton url={shape.props.url} zoomLevel={this.editor.getZoomLevel()} />
				)}
			</>
		)
	}

	private handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: TLShapeId) => {
		const shape = this.editor.getShape<TLNoteShape>(id)!
		const isCmdOrCtrlEnter = (e.metaKey || e.ctrlKey) && e.key === 'Enter'
		if (isCmdOrCtrlEnter || e.key === 'Tab') {
			this.editor.complete()

			// Create a new sticky
			const size = INITIAL_NOTE_SIZE
			const offset = new Vec(shape.x + size * 1.5 + 10, shape.y + size / 2)
			const newSticky = createSticky(this.editor, undefined, offset)

			// Go into edit mode on the new sticky
			this.editor.setEditingShape(newSticky.id)
			this.editor.setCurrentTool('select.editing_shape', {
				target: 'shape',
				shape: newSticky,
			})

			// Animate to the new sticky, if necessary.
			const selectionPageBounds = this.editor.getSelectionPageBounds()
			const viewportPageBounds = this.editor.getViewportPageBounds()
			if (selectionPageBounds && !viewportPageBounds.contains(selectionPageBounds)) {
				this.editor.centerOnPoint(selectionPageBounds.center, {
					duration: ANIMATION_MEDIUM_MS,
				})
			}
		}
	}

	indicator(shape: TLNoteShape) {
		return (
			<rect
				rx="6"
				width={toDomPrecision(INITIAL_NOTE_SIZE)}
				height={toDomPrecision(this.getHeight(shape))}
			/>
		)
	}

	override toSvg(shape: TLNoteShape, ctx: SvgExportContext) {
		ctx.addExportDef(getFontDefForExport(shape.props.font))
		const theme = getDefaultColorTheme({ isDarkMode: ctx.isDarkMode })
		const bounds = this.editor.getShapeGeometry(shape).bounds

		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

		const adjustedColor = shape.props.color === 'black' ? 'yellow' : shape.props.color

		const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		rect1.setAttribute('rx', '10')
		rect1.setAttribute('width', INITIAL_NOTE_SIZE.toString())
		rect1.setAttribute('height', bounds.height.toString())
		rect1.setAttribute('fill', theme[adjustedColor].solid)
		rect1.setAttribute('stroke', theme[adjustedColor].solid)
		rect1.setAttribute('stroke-width', '1')
		g.appendChild(rect1)

		const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		rect2.setAttribute('rx', '10')
		rect2.setAttribute('width', INITIAL_NOTE_SIZE.toString())
		rect2.setAttribute('height', bounds.height.toString())
		rect2.setAttribute('fill', theme.background)
		rect2.setAttribute('opacity', '.28')
		g.appendChild(rect2)

		const textElm = getTextLabelSvgElement({
			editor: this.editor,
			shape,
			font: DefaultFontFamilies[shape.props.font],
			bounds,
		})

		textElm.setAttribute('fill', theme.text)
		textElm.setAttribute('stroke', 'none')
		g.appendChild(textElm)

		return g
	}

	override onBeforeCreate = (next: TLNoteShape) => {
		return getGrowY(this.editor, next, next.props.growY)
	}

	override onBeforeUpdate = (prev: TLNoteShape, next: TLNoteShape) => {
		if (
			prev.props.text === next.props.text &&
			prev.props.font === next.props.font &&
			prev.props.size === next.props.size
		) {
			return
		}

		return getGrowY(this.editor, next, prev.props.growY)
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

function getGrowY(editor: Editor, shape: TLNoteShape, prevGrowY = 0) {
	const PADDING = 17

	const nextTextSize = editor.textMeasure.measureText(shape.props.text, {
		...TEXT_PROPS,
		fontFamily: FONT_FAMILIES[shape.props.font],
		fontSize: LABEL_FONT_SIZES[shape.props.size],
		maxWidth: INITIAL_NOTE_SIZE - PADDING * 2,
	})

	const nextHeight = nextTextSize.h + PADDING * 2

	let growY: number | null = null

	if (nextHeight > INITIAL_NOTE_SIZE) {
		growY = nextHeight - INITIAL_NOTE_SIZE
	} else {
		if (prevGrowY) {
			growY = 0
		}
	}

	if (growY !== null) {
		return {
			...shape,
			props: {
				...shape.props,
				growY,
			},
		}
	}
}

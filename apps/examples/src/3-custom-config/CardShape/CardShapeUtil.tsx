import { resizeBox } from '@tldraw/editor/src/lib/editor/shapes/shared/resizeBox'
import { Box2d, HTMLContainer, ShapeUtil, TLOnResizeHandler } from '@tldraw/tldraw'
import { ICardShape } from './card-shape-types'

// A utility class for the card shape. This is where you define
// the shape's behavior, how it renders (its component and
// indicator), and how it handles different events.

export class CardShapeUtil extends ShapeUtil<ICardShape> {
	static override type = 'card' as const

	// Flags
	override isAspectRatioLocked = (_shape: ICardShape) => false
	override canResize = (_shape: ICardShape) => true
	override canBind = (_shape: ICardShape) => true

	getDefaultProps(): ICardShape['props'] {
		return {
			w: 300,
			h: 300,
			color: 'black',
			weight: 'regular',
		}
	}

	getBounds(shape: ICardShape) {
		return new Box2d(0, 0, shape.props.w, shape.props.h)
	}

	// Render method — the React component that will be rendered for the shape
	component(shape: ICardShape) {
		const bounds = this.editor.getBounds(shape)

		return (
			<HTMLContainer
				id={shape.id}
				style={{
					border: '1px solid black',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					pointerEvents: 'all',
					fontWeight: shape.props.weight,
					color: `var(--palette-${shape.props.color})`,
				}}
			>
				{bounds.w.toFixed()}x{bounds.h.toFixed()}
			</HTMLContainer>
		)
	}

	// Indicator — used when hovering over a shape or when it's selected; must return only SVG elements here
	indicator(shape: ICardShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}

	// Events
	override onResize: TLOnResizeHandler<ICardShape> = (shape, info) => {
		return resizeBox(shape, info)
	}
}

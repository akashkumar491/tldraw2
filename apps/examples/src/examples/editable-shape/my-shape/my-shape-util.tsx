import {
	DefaultColorStyle,
	HTMLContainer,
	Rectangle2d,
	ShapeProps,
	ShapeUtil,
	T,
	TLBaseShape,
	TLDefaultColorStyle,
	TLOnResizeHandler,
	getDefaultColorTheme,
	resizeBox,
	useIsEditing,
} from '@tldraw/tldraw'
import { useState } from 'react'

// There's a guide at the bottom of this file!

type IMyShape = TLBaseShape<
	'card',
	{
		w: number
		h: number
		color: TLDefaultColorStyle
	}
>

export const myShapeProps: ShapeProps<IMyShape> = {
	w: T.number,
	h: T.number,
	color: DefaultColorStyle,
}

export class MyShapeUtil extends ShapeUtil<IMyShape> {
	static override type = 'myshape' as const
	// [1]
	static override props = myShapeProps
	// [2]
	// [3]
	override isAspectRatioLocked = (_shape: IMyShape) => false
	override canResize = (_shape: IMyShape) => true
	override canBind = (_shape: IMyShape) => true

	override canEdit = () => true

	// [4]
	getDefaultProps(): IMyShape['props'] {
		return {
			w: 300,
			h: 300,
			color: 'black',
		}
	}

	// [5]
	getGeometry(shape: IMyShape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	// [6]
	component(shape: IMyShape) {
		const theme = getDefaultColorTheme({ isDarkMode: this.editor.user.getIsDarkMode() })

		const [animal, setAnimal] = useState<boolean>(true)
		//[a]

		return (
			<HTMLContainer
				id={shape.id}
				style={{
					border: '1px solid black',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					pointerEvents: 'all',
					backgroundColor: theme[shape.props.color].semi,
					color: theme[shape.props.color].solid,
				}}
			>
				<button
					onPointerDown={(e) => e.stopPropagation()}
					onClick={() => setAnimal((prev) => !prev)}
				>
					Change
				</button>
				<p style={{ fontSize: shape.props.h / 1.5, margin: 0 }}>{animal ? '🐶' : '🐱'}</p>
			</HTMLContainer>
		)
	}

	// [7]
	indicator(shape: IMyShape) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const isEditing = useIsEditing(shape.id)
		return <rect stroke={isEditing ? 'red' : 'blue'} width={shape.props.w} height={shape.props.h} />
	}

	// [8]
	override onResize: TLOnResizeHandler<IMyShape> = (shape, info) => {
		return resizeBox(shape, info)
	}
}

/* 
A utility class for the myshape shape. This is where you define the shape's behavior, 
how it renders (its component and indicator), and how it handles different events.

[1]
A validation schema for the shape's props (optional)
Check out myshape-shape-props.ts for more info.

[2]
Migrations for upgrading shapes (optional)
Check out e-shape-migrations.ts for more info.

[3]
Letting the editor know if the shape's aspect ratio is locked, and whether it 
can be resized or bound to other shapes. 

[4]
The default props the shape will be rendered with when click-creating one.

[5]
We use this to calculate the shape's geometry for hit-testing, bindings and
doing other geometric calculations. 

[6]
Render method — the React component that will be rendered for the shape. It takes the 
shape as an argument. HTMLContainer is just a div that's being used to wrap our text 
and button. We can get the shape's bounds using our own getGeometry method.
	
- [a] Check it out! We can do normal React stuff here like using setState.
   Annoying: eslint sometimes thinks this is a class component, but it's not.

- [b] You need to stop the pointer down event on buttons, otherwise the editor will
	   think you're trying to select drag the shape.

[7]
Indicator — used when hovering over a shape or when it's selected; must return only SVG elements here

[8]
Resize handler — called when the shape is resized. Sometimes you'll want to do some 
custom logic here, but for our purposes, this is fine.
*/

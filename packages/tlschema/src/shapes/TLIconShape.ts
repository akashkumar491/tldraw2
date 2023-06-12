import { defineMigrations } from '@tldraw/store'
import { T } from '@tldraw/validate'
import { TLColorType, colorValidator } from '../styles/TLColorStyle'
import { TLDashType, dashValidator } from '../styles/TLDashStyle'
import { TLIconType, iconValidator } from '../styles/TLIconStyle'
import { TLSizeType, sizeValidator } from '../styles/TLSizeStyle'
import { ShapeProps, TLBaseShape } from './TLBaseShape'

/** @public */
export type TLIconShapeProps = {
	size: TLSizeType
	icon: TLIconType
	dash: TLDashType
	color: TLColorType
	scale: number
}

/** @public */
export type TLIconShape = TLBaseShape<'icon', TLIconShapeProps>

/** @internal */
export const iconShapeProps: ShapeProps<TLIconShape> = {
	size: sizeValidator,
	icon: iconValidator,
	dash: dashValidator,
	color: colorValidator,
	scale: T.number,
}

/** @internal */
export const iconShapeMigrations = defineMigrations({})

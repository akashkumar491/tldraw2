import { defineMigrations } from '@tldraw/store'
import { T } from '@tldraw/validate'
import { TLHandle, handleTypeValidator } from '../misc/TLHandle'
import { TLColorType, colorValidator } from '../styles/TLColorStyle'
import { TLDashType, dashValidator } from '../styles/TLDashStyle'
import { TLOpacityType, opacityValidator } from '../styles/TLOpacityStyle'
import { TLSizeType, sizeValidator } from '../styles/TLSizeStyle'
import { TLSplineType, splineValidator } from '../styles/TLSplineStyle'
import { TLBaseShape, createShapeValidator } from './TLBaseShape'

/** @public */
export type TLLineShapeProps = {
	color: TLColorType
	dash: TLDashType
	size: TLSizeType
	opacity: TLOpacityType
	spline: TLSplineType
	handles: {
		[key: string]: TLHandle
	}
}

/** @public */
export type TLLineShape = TLBaseShape<'line', TLLineShapeProps>

/** @public */
export const lineShapeTypeValidator: T.Validator<TLLineShape> = createShapeValidator(
	'line',
	T.object({
		color: colorValidator,
		dash: dashValidator,
		size: sizeValidator,
		opacity: opacityValidator,
		spline: splineValidator,
		handles: T.dict(T.string, handleTypeValidator),
	})
)

/** @public */
export const lineShapeTypeMigrations = defineMigrations({})

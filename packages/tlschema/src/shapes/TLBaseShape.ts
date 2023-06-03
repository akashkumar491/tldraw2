import { BaseRecord } from '@tldraw/store'
import { T } from '@tldraw/validate'
import { idValidator } from '../misc/id-validator'
import { TLParentId, TLShapeId } from '../records/TLShape'

/** @public */
export interface TLBaseShape<Type extends string, Props extends object>
	extends BaseRecord<'shape', TLShapeId> {
	type: Type
	x: number
	y: number
	rotation: number
	index: string
	parentId: TLParentId
	isLocked: boolean
	props: Props
}

/** @internal */
export const parentIdValidator = T.string.refine((id) => {
	if (!id.startsWith('page:') && !id.startsWith('shape:')) {
		throw new Error('Parent ID must start with "page:" or "shape:"')
	}
	return id as TLParentId
})

/** @internal */
export const shapeIdValidator = idValidator<TLShapeId>('shape')

/** @public */
export function createShapeValidator<Type extends string, Props extends object>(
	type: Type,
	props: T.Validator<Props>
) {
	return T.object({
		id: shapeIdValidator,
		typeName: T.literal('shape'),
		x: T.number,
		y: T.number,
		rotation: T.number,
		index: T.string,
		parentId: parentIdValidator,
		type: T.literal(type),
		isLocked: T.boolean,
		props,
	})
}

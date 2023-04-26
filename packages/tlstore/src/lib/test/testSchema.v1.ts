import { assert } from '@tldraw/utils'
import { BaseRecord, ID } from '../BaseRecord'
import { createRecordType } from '../RecordType'
import { StoreSnapshot } from '../Store'
import { StoreSchema } from '../StoreSchema'
import { defineMigrations } from '../migrate'

const UserVersion = {
	Initial: 0,
	AddLocale: 1,
	AddPhoneNumber: 2,
} as const

/** A user of tldraw */
interface User extends BaseRecord<'user'> {
	name: string
	locale: string
	phoneNumber: string | null
}

const userMigrations = defineMigrations({
	currentVersion: UserVersion.AddPhoneNumber,
	firstVersion: UserVersion.Initial,
	migrators: {
		[UserVersion.AddLocale]: {
			up: (record) => ({
				...record,
				locale: 'en',
			}),
			down: (record) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { locale, ...rest } = record
				return rest
			},
		},
		[UserVersion.AddPhoneNumber]: {
			up: (record) => ({
				...record,
				phoneNumber: null,
			}),
			down: (record) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { phoneNumber, ...rest } = record
				return rest
			},
		},
	},
})

const User = createRecordType<User>('user', {
	migrations: userMigrations,
	validator: {
		validate: (record) => {
			assert(record && typeof record === 'object')
			assert('id' in record && typeof record.id === 'string')
			assert('name' in record && typeof record.name === 'string')
			assert('locale' in record && typeof record.locale === 'string')
			assert(
				'phoneNumber' in record &&
					(record.phoneNumber === null || typeof record.phoneNumber === 'string')
			)
			return record as User
		},
	},
	scope: 'document',
}).withDefaultProperties(() => ({
	/* STEP 6: Add any new default values for properties here */
	name: 'New User',
}))

const ShapeVersion = {
	Initial: 0,
	AddRotation: 1,
	AddParent: 2,
} as const

const RectangleVersion = {
	Initial: 0,
	AddOpacity: 1,
} as const

const OvalVersion = {
	Initial: 0,
	AddBorderStyle: 1,
} as const

interface Shape<Props> extends BaseRecord<'shape'> {
	type: string
	x: number
	y: number
	rotation: number
	parentId: ID<Shape<Props>> | null
	props: Props
}

interface RectangleProps {
	width: number
	height: number
	opactiy: number
}

interface OvalProps {
	radius: number
	borderStyle: 'solid' | 'dashed'
}

const shapeMigrations = defineMigrations({
	currentVersion: ShapeVersion.AddParent,
	firstVersion: ShapeVersion.Initial,
	migrators: {
		[ShapeVersion.AddRotation]: {
			up: (record) => ({
				...record,
				rotation: 0,
			}),
			down: (record) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { rotation, ...rest } = record
				return rest
			},
		},
		[ShapeVersion.AddParent]: {
			up: (record) => ({
				...record,
				parentId: null,
			}),
			down: (record) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { parentId, ...rest } = record
				return rest
			},
		},
	},
	subTypeKey: 'type',
	subTypeMigrations: {
		rectangle: defineMigrations({
			currentVersion: RectangleVersion.AddOpacity,
			firstVersion: RectangleVersion.Initial,
			migrators: {
				[RectangleVersion.AddOpacity]: {
					up: (record) => ({
						...record,
						props: {
							...record.props,
							opacity: 1,
						},
					}),
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					down: ({ props: { opacity, ...others }, ...record }) => ({
						...record,
						props: {
							...others,
						},
					}),
				},
			},
		}),
		oval: defineMigrations({
			currentVersion: OvalVersion.AddBorderStyle,
			firstVersion: OvalVersion.Initial,
			migrators: {
				[OvalVersion.AddBorderStyle]: {
					up: (record) => ({
						...record,
						props: {
							...record.props,
							borderStyle: 'solid',
						},
					}),
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					down: ({ props: { borderStyle, ...others }, ...record }) => ({
						...record,
						props: {
							...others,
						},
					}),
				},
			},
		}),
	},
})

const Shape = createRecordType<Shape<RectangleProps | OvalProps>>('shape', {
	migrations: shapeMigrations,
	validator: {
		validate: (record) => {
			assert(record && typeof record === 'object')
			assert('id' in record && typeof record.id === 'string')
			assert('type' in record && typeof record.type === 'string')
			assert('x' in record && typeof record.x === 'number')
			assert('y' in record && typeof record.y === 'number')
			assert('rotation' in record && typeof record.rotation === 'number')
			return record as Shape<RectangleProps | OvalProps>
		},
	},
	scope: 'document',
}).withDefaultProperties(() => ({
	x: 0,
	y: 0,
	rotation: 0,
	parentId: null,
}))

const StoreVersions = {
	Initial: 0,
	RemoveOrg: 1,
}

const snapshotMigrations = defineMigrations({
	currentVersion: StoreVersions.RemoveOrg,
	firstVersion: StoreVersions.Initial,
	migrators: {
		[StoreVersions.RemoveOrg]: {
			up: (store: StoreSnapshot<any>) => {
				return Object.fromEntries(Object.entries(store).filter(([_, r]) => r.typeName !== 'org'))
			},
			down: (store: StoreSnapshot<any>) => {
				// noop
				return store
			},
		},
	},
})

export const testSchemaV1 = StoreSchema.create<User | Shape<any>>(
	{
		user: User,
		shape: Shape,
	},
	{
		snapshotMigrations,
	}
)

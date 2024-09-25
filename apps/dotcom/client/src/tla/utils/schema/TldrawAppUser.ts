import {
	BaseRecord,
	RecordId,
	T,
	createMigrationIds,
	createRecordMigrationSequence,
	createRecordType,
	idValidator,
} from 'tldraw'
import { TldrawAppFileId } from './TldrawAppFile'

export interface TldrawAppUser extends BaseRecord<'user', RecordId<TldrawAppUser>> {
	name: string
	email: string
	avatar: string
	color: string
	createdAt: number
	updatedAt: number
	// Separate table for user presences?
	presence: {
		fileIds: TldrawAppFileId[]
	}
	flags: {
		placeholder_feature_flag: boolean
	}
}

export type TldrawAppUserId = RecordId<TldrawAppUser>

/** @public */
export const tldrawAppUserValidator: T.Validator<TldrawAppUser> = T.model(
	'user',
	T.object({
		typeName: T.literal('user'),
		id: idValidator<TldrawAppUserId>('user'),
		name: T.string,
		email: T.string,
		avatar: T.string,
		color: T.string,
		createdAt: T.number,
		updatedAt: T.number,
		presence: T.object({
			fileIds: T.arrayOf(idValidator<TldrawAppFileId>('file')),
		}),
		flags: T.object({
			placeholder_feature_flag: T.boolean,
		}),
	})
)

/** @public */
export const tldrawAppUserVersions = createMigrationIds('com.tldraw.user', {} as const)

/** @public */
export const tldrawAppUserMigrations = createRecordMigrationSequence({
	sequenceId: 'com.tldraw-app.user',
	recordType: 'user',
	sequence: [],
})

/** @public */
export const TldrawAppUserRecordType = createRecordType<TldrawAppUser>('user', {
	validator: tldrawAppUserValidator,
	scope: 'document',
}).withDefaultProperties(
	(): Omit<TldrawAppUser, 'id' | 'typeName' | 'presence'> => ({
		name: 'Steve Ruiz',
		email: 'steve@tldraw.com',
		color: 'coral', // coral
		avatar: '',
		createdAt: Date.now(),
		updatedAt: Date.now(),
		flags: {
			placeholder_feature_flag: false,
		},
	})
)

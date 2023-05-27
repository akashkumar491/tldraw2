import {
	createCustomShapeId,
	createTldrawEditorStore,
	InstanceRecordType,
	TLStore,
} from '@tldraw/editor'
import { MigrationFailureReason, UnknownRecord } from '@tldraw/tlstore'
import { assert } from '@tldraw/utils'
import { parseTldrawJsonFile as _parseTldrawJsonFile, TldrawFile } from '../lib/file'

const parseTldrawJsonFile = (store: TLStore, json: string) =>
	_parseTldrawJsonFile({
		store,
		json,
		instanceId: InstanceRecordType.createCustomId('instance'),
	})

function serialize(file: TldrawFile): string {
	return JSON.stringify(file)
}

describe('parseTldrawJsonFile', () => {
	it('returns an error if the file is not json', () => {
		const store = createTldrawEditorStore().store
		const result = parseTldrawJsonFile(store, 'not json')
		assert(!result.ok)
		expect(result.error.type).toBe('notATldrawFile')
	})

	it("returns an error if the file doesn't look like a tldraw file", () => {
		const store = createTldrawEditorStore().store
		const result = parseTldrawJsonFile(store, JSON.stringify({ not: 'a tldraw file' }))
		assert(!result.ok)
		expect(result.error.type).toBe('notATldrawFile')
	})

	it('returns an error if the file version is too old', () => {
		const store = createTldrawEditorStore().store
		const result = parseTldrawJsonFile(
			store,
			serialize({
				tldrawFileFormatVersion: 0,
				schema: store.schema.serialize(),
				records: [],
			})
		)
		assert(!result.ok)
		expect(result.error.type).toBe('notATldrawFile')
	})

	it('returns an error if the file version is too new', () => {
		const store = createTldrawEditorStore().store
		const result = parseTldrawJsonFile(
			store,
			serialize({
				tldrawFileFormatVersion: 100,
				schema: store.schema.serialize(),
				records: [],
			})
		)
		assert(!result.ok)
		expect(result.error.type).toBe('fileFormatVersionTooNew')
	})

	it('returns an error if migrations fail', () => {
		const store = createTldrawEditorStore().store
		const serializedSchema = store.schema.serialize()
		serializedSchema.storeVersion = 100
		const result = parseTldrawJsonFile(
			store,
			serialize({
				tldrawFileFormatVersion: 1,
				schema: serializedSchema,
				records: [],
			})
		)
		assert(!result.ok)
		assert(result.error.type === 'migrationFailed')
		expect(result.error.reason).toBe(MigrationFailureReason.TargetVersionTooOld)

		const store2 = createTldrawEditorStore().store
		const serializedSchema2 = store2.schema.serialize()
		serializedSchema2.recordVersions.shape.version = 100
		const result2 = parseTldrawJsonFile(
			store2,
			serialize({
				tldrawFileFormatVersion: 1,
				schema: serializedSchema2,
				records: [{ typeName: 'shape', id: createCustomShapeId('shape') }],
			})
		)

		assert(!result2.ok)
		assert(result2.error.type === 'migrationFailed')
		expect(result2.error.reason).toBe(MigrationFailureReason.TargetVersionTooOld)
	})

	it('returns an error if a record is invalid', () => {
		const store = createTldrawEditorStore().store
		const result = parseTldrawJsonFile(
			store,
			serialize({
				tldrawFileFormatVersion: 1,
				schema: store.schema.serialize(),
				records: [
					{
						typeName: 'shape',
						id: createCustomShapeId('shape'),
						type: 'geo',
						props: {},
					} as UnknownRecord,
				],
			})
		)

		assert(!result.ok)
		assert(result.error.type === 'invalidRecords')
		expect(result.error.cause).toMatchInlineSnapshot(
			`[ValidationError: At (typeName = shape).shape(id = shape:shape, type = geo).x: Expected number, got undefined]`
		)
	})

	it('returns a store if the file is valid', () => {
		const store = createTldrawEditorStore().store
		const result = parseTldrawJsonFile(
			store,
			serialize({
				tldrawFileFormatVersion: 1,
				schema: store.schema.serialize(),
				records: [],
			})
		)
		assert(result.ok)
	})
})

import { BaseRecord, createRecordType, defineMigrations, ID } from '@tldraw/tlstore'
import { T } from '@tldraw/tlvalidate'

/**
 * TLDocument
 *
 * @public
 */
export interface TLDocument extends BaseRecord<'document', ID<TLDocument>> {
	gridSize: number
}

/** @public */
export const documentTypeValidator: T.Validator<TLDocument> = T.model(
	'document',
	T.object({
		typeName: T.literal('document'),
		id: T.literal('document:document' as ID<TLDocument>),
		gridSize: T.number,
	})
)

/** @public */
export const DocumentRecordType = createRecordType<TLDocument>('document', {
	validator: documentTypeValidator,
	scope: 'document',
}).withDefaultProperties(
	(): Omit<TLDocument, 'id' | 'typeName'> => ({
		gridSize: 10,
	})
)

// all document records have the same ID: 'document:document'
/** @public */
export const TLDOCUMENT_ID: ID<TLDocument> = DocumentRecordType.createCustomId('document')

/** @public */
export const documentTypeMigrations = defineMigrations({})

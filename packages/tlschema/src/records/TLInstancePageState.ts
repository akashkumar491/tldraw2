import { BaseRecord, createRecordType, defineMigrations, ID } from '@tldraw/tlstore'
import { T } from '@tldraw/tlvalidate'
import { idValidator, instanceIdValidator, pageIdValidator, shapeIdValidator } from '../validation'
import { TLCamera, TLCameraId } from './TLCamera'
import { TLInstance } from './TLInstance'
import { TLPage } from './TLPage'
import { TLShapeId } from './TLShape'

/**
 * TLInstancePageState
 *
 * State that is unique to a particular page of the document in a particular browser tab
 *
 * @public
 */
export interface TLInstancePageState extends BaseRecord<'instance_page_state'> {
	instanceId: ID<TLInstance>
	pageId: ID<TLPage>
	cameraId: ID<TLCamera>
	selectedIds: TLShapeId[]
	hintingIds: TLShapeId[]
	erasingIds: TLShapeId[]
	hoveredId: TLShapeId | null
	editingId: TLShapeId | null
	croppingId: TLShapeId | null
	focusLayerId: TLShapeId | null
}

// --- VALIDATION ---
/** @public */
export const instancePageStateTypeValidator: T.Validator<TLInstancePageState> = T.model(
	'instance_page_state',
	T.object({
		typeName: T.literal('instance_page_state'),
		id: idValidator<TLInstancePageStateId>('instance_page_state'),
		instanceId: instanceIdValidator,
		pageId: pageIdValidator,
		cameraId: idValidator<TLCameraId>('camera'),
		selectedIds: T.arrayOf(shapeIdValidator),
		hintingIds: T.arrayOf(shapeIdValidator),
		erasingIds: T.arrayOf(shapeIdValidator),
		hoveredId: shapeIdValidator.nullable(),
		editingId: shapeIdValidator.nullable(),
		croppingId: shapeIdValidator.nullable(),
		focusLayerId: shapeIdValidator.nullable(),
	})
)

// --- MIGRATIONS ---
// STEP 1: Add a new version number here, give it a meaningful name.
// It should be 1 higher than the current version
const Versions = {
	Initial: 0,
	AddCroppingId: 1,
} as const

/** @public */
export const instancePageStateMigrations = defineMigrations({
	firstVersion: Versions.Initial,
	currentVersion: Versions.AddCroppingId,
	migrators: {
		[Versions.AddCroppingId]: {
			up(instance) {
				return { ...instance, croppingId: null }
			},
			down({ croppingId: _croppingId, ...instance }) {
				return instance
			},
		},
	},
})

/** @public */
export const TLInstancePageState = createRecordType<TLInstancePageState>('instance_page_state', {
	migrations: instancePageStateMigrations,
	validator: instancePageStateTypeValidator,
	scope: 'instance',
}).withDefaultProperties(
	(): Omit<
		TLInstancePageState,
		'id' | 'typeName' | 'userId' | 'instanceId' | 'cameraId' | 'pageId'
	> => ({
		editingId: null,
		croppingId: null,
		selectedIds: [],
		hoveredId: null,
		erasingIds: [],
		hintingIds: [],
		focusLayerId: null,
	})
)

/** @public */
export type TLInstancePageStateId = ID<TLInstancePageState>

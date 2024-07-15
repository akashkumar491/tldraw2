export { ClientWebSocketAdapter, ReconnectManager } from './lib/ClientWebSocketAdapter'
export { RoomSessionState, type RoomSession } from './lib/RoomSession'
export { TLRemoteSyncError } from './lib/TLRemoteSyncError'
export { TLSocketRoom, type TLSyncLog } from './lib/TLSocketRoom'
export {
	TLCloseEventCode,
	TLSyncClient,
	type SubscribingFn,
	type TLPersistentClientSocket,
	type TLPersistentClientSocketStatus,
} from './lib/TLSyncClient'
export { DocumentState, TLSyncRoom, type RoomSnapshot, type TLRoomSocket } from './lib/TLSyncRoom'
export { chunk } from './lib/chunk'
export {
	RecordOpType,
	ValueOpType,
	applyObjectDiff,
	diffRecord,
	getNetworkDiff,
	type AppendOp,
	type DeleteOp,
	type NetworkDiff,
	type ObjectDiff,
	type PatchOp,
	type PutOp,
	type RecordOp,
	type ValueOp,
} from './lib/diff'
export {
	TLIncompatibilityReason,
	getTlsyncProtocolVersion,
	type TLConnectRequest,
	type TLPingRequest,
	type TLPushRequest,
	type TLSocketClientSentEvent,
	type TLSocketServerSentDataEvent,
	type TLSocketServerSentEvent,
} from './lib/protocol'
export type { PersistedRoomSnapshotForSupabase } from './lib/server-types'

import type { StoreSchema, UnknownRecord } from '@tldraw/store'
import { TLStoreSnapshot, createTLSchema } from '@tldraw/tlschema'
import { objectMapValues } from 'tldraw'
import { ServerSocketAdapter, WebSocketMinimal } from './ServerSocketAdapter'
import { RoomSnapshot, TLSyncRoom } from './TLSyncRoom'
import { JsonChunkAssembler } from './chunk'
import { TLSocketServerSentEvent } from './protocol'

// TODO: structured logging support
/** @public */
export interface TLSyncLog {
	warn?: (...args: any[]) => void
	error?: (...args: any[]) => void
}

/** @public */
export class TLSocketRoom<R extends UnknownRecord = UnknownRecord, SessionMeta = void> {
	private room: TLSyncRoom<R, SessionMeta>
	private readonly sessions = new Map<
		string,
		{ assembler: JsonChunkAssembler; socket: WebSocketMinimal; unlisten: () => void }
	>()
	readonly log?: TLSyncLog

	constructor(
		public readonly opts: {
			initialSnapshot?: RoomSnapshot | TLStoreSnapshot
			schema?: StoreSchema<R, any>
			// how long to wait for a client to communicate before disconnecting them
			clientTimeout?: number
			log?: TLSyncLog
			// a callback that is called when a client is disconnected
			onSessionRemoved?: (
				room: TLSocketRoom<R, SessionMeta>,
				args: { sessionId: string; numSessionsRemaining: number; meta: SessionMeta }
			) => void
			// a callback that is called whenever a message is sent
			onBeforeSendMessage?: (args: {
				sessionId: string
				/** @internal keep the protocol private for now */
				message: TLSocketServerSentEvent<R>
				stringified: string
				meta: SessionMeta
			}) => void
			onAfterReceiveMessage?: (args: {
				sessionId: string
				/** @internal keep the protocol private for now */
				message: TLSocketServerSentEvent<R>
				stringified: string
				meta: SessionMeta
			}) => void
			onDataChange?: () => void
		}
	) {
		const initialSnapshot =
			opts.initialSnapshot && 'store' in opts.initialSnapshot
				? convertStoreSnapshotToRoomSnapshot(opts.initialSnapshot!)
				: opts.initialSnapshot

		const initialClock = initialSnapshot?.clock ?? 0
		this.room = new TLSyncRoom<R, SessionMeta>({
			schema: opts.schema ?? (createTLSchema() as any),
			snapshot: initialSnapshot,
			log: opts.log,
		})
		if (this.room.clock !== initialClock) {
			this.opts?.onDataChange?.()
		}
		this.room.events.on('session_removed', (args) => {
			this.sessions.delete(args.sessionId)
			if (this.opts.onSessionRemoved) {
				this.opts.onSessionRemoved(this, {
					sessionId: args.sessionId,
					numSessionsRemaining: this.room.sessions.size,
					meta: args.meta,
				})
			}
		})
		this.log = 'log' in opts ? opts.log : { error: console.error }
	}

	/**
	 * Returns the number of active sessions.
	 * Note that this is not the same as the number of connected sockets!
	 * Sessions time out a few moments after sockets close, to smooth over network hiccups.
	 *
	 * @returns the number of active sessions
	 */
	getNumActiveSessions() {
		return this.room.sessions.size
	}

	/**
	 * Call this when a client establishes a new socket connection.
	 *
	 * - `sessionId` is a unique ID for a browser tab. This is passed as a query param by the useSync hook.
	 * - `socket` is a WebSocket-like object that the server uses to communicate with the client.
	 * - `meta` is an optional object that can be used to store additional information about the session.
	 *
	 * @param opts - The options object
	 */
	handleSocketConnect(
		opts: OmitVoid<{ sessionId: string; socket: WebSocketMinimal; meta: SessionMeta }>
	) {
		const { sessionId, socket } = opts
		const handleSocketMessage = (event: MessageEvent) =>
			this.handleSocketMessage(sessionId, event.data)
		const handleSocketError = this.handleSocketError.bind(this, sessionId)
		const handleSocketClose = this.handleSocketClose.bind(this, sessionId)

		this.sessions.set(sessionId, {
			assembler: new JsonChunkAssembler(),
			socket,
			unlisten: () => {
				socket.removeEventListener?.('message', handleSocketMessage)
				socket.removeEventListener?.('close', handleSocketClose)
				socket.removeEventListener?.('error', handleSocketError)
			},
		})

		this.room.handleNewSession(
			sessionId,
			new ServerSocketAdapter({
				ws: socket,
				onBeforeSendMessage: this.opts.onBeforeSendMessage
					? (message, stringified) =>
							this.opts.onBeforeSendMessage!({
								sessionId,
								message,
								stringified,
								meta: this.room.sessions.get(sessionId)?.meta as SessionMeta,
							})
					: undefined,
			}),
			'meta' in opts ? (opts.meta as any) : undefined
		)

		socket.addEventListener?.('message', handleSocketMessage)
		socket.addEventListener?.('close', handleSocketClose)
		socket.addEventListener?.('error', handleSocketError)
	}

	/**
	 * If executing in a server environment where sockets do not have instance-level listeners
	 * (e.g. Bun.serve, Cloudflare Worker with WebSocket hibernation), you should call this
	 * method when messages are received. See our self-hosting example for Bun.serve for an example.
	 *
	 * @param sessionId - The id of the session. (should match the one used when calling handleSocketConnect)
	 * @param message - The message received from the client.
	 */
	handleSocketMessage(sessionId: string, message: string | AllowSharedBufferSource) {
		const documentClockAtStart = this.room.documentClock
		const assembler = this.sessions.get(sessionId)?.assembler
		if (!assembler) {
			this.log?.warn?.('Received message from unknown session', sessionId)
			return
		}

		try {
			const messageString =
				typeof message === 'string' ? message : new TextDecoder().decode(message)
			const res = assembler.handleMessage(messageString)
			if (!res) {
				// not enough chunks yet
				return
			}
			if ('data' in res) {
				// need to do this first in case the session gets removed as a result of handling the message
				if (this.opts.onAfterReceiveMessage) {
					const session = this.room.sessions.get(sessionId)
					if (session) {
						this.opts.onAfterReceiveMessage({
							sessionId,
							message: res.data as any,
							stringified: res.stringified,
							meta: session.meta,
						})
					}
				}

				this.room.handleMessage(sessionId, res.data as any)
			} else {
				this.log?.error?.('Error assembling message', res.error)
				// close the socket to reset the connection
				this.handleSocketError(sessionId)
			}
		} catch (e) {
			this.log?.error?.(e)
			const socket = this.sessions.get(sessionId)?.socket
			if (socket) {
				socket.send(
					JSON.stringify({
						type: 'error',
						error: typeof e?.toString === 'function' ? e.toString() : e,
					} satisfies TLSocketServerSentEvent<R>)
				)
				socket.close()
			}
		} finally {
			if (this.room.documentClock !== documentClockAtStart) {
				this.opts.onDataChange?.()
			}
		}
	}

	/**
	 * If executing in a server environment where sockets do not have instance-level listeners,
	 * call this when a socket error occurs.
	 * @param sessionId - The id of the session. (should match the one used when calling handleSocketConnect)
	 */
	handleSocketError(sessionId: string) {
		this.room.handleClose(sessionId)
	}

	/**
	 * If executing in a server environment where sockets do not have instance-level listeners,
	 * call this when a socket is closed.
	 * @param sessionId - The id of the session. (should match the one used when calling handleSocketConnect)
	 */
	handleSocketClose(sessionId: string) {
		this.room.handleClose(sessionId)
	}

	/**
	 * Returns the current 'clock' of the document.
	 * The clock is an integer that increments every time the document changes.
	 * The clock is stored as part of the snapshot of the document for consistency purposes.
	 *
	 * @returns The clock
	 */
	getCurrentDocumentClock() {
		return this.room.documentClock
	}

	/**
	 * Return a snapshot of the document state, including clock-related bookkeeping.
	 * You can store this and load it later on when initializing a TLSocketRoom.
	 * You can also pass a snapshot to {@link TLSocketRoom#loadSnapshot} if you need to revert to a previous state.
	 * @returns The snapshot
	 */
	getCurrentSnapshot() {
		return this.room.getSnapshot()
	}

	/**
	 * Load a snapshot of the document state, overwriting the current state.
	 * @param snapshot - The snapshot to load
	 */
	loadSnapshot(snapshot: RoomSnapshot | TLStoreSnapshot) {
		if ('store' in snapshot) {
			snapshot = convertStoreSnapshotToRoomSnapshot(snapshot)
		}
		const oldRoom = this.room
		const oldIds = oldRoom.getSnapshot().documents.map((d) => d.state.id)
		const newIds = new Set(snapshot.documents.map((d) => d.state.id))
		const removedIds = oldIds.filter((id) => !newIds.has(id))

		const tombstones = { ...snapshot.tombstones }
		removedIds.forEach((id) => {
			tombstones[id] = oldRoom.clock + 1
		})
		newIds.forEach((id) => {
			delete tombstones[id]
		})

		const newRoom = new TLSyncRoom<R, SessionMeta>({
			schema: oldRoom.schema,
			snapshot: {
				clock: oldRoom.clock + 1,
				documents: snapshot.documents.map((d) => ({
					lastChangedClock: oldRoom.clock + 1,
					state: d.state,
				})),
				schema: snapshot.schema,
				tombstones,
			},
			log: this.log,
		})

		// replace room with new one and kick out all the clients
		this.room = newRoom
		oldRoom.close()
	}

	/**
	 * Close the room and disconnect all clients. Call this before discarding the room instance or shutting down the server.
	 */
	close() {
		this.room.close()
	}

	/**
	 * @returns true if the room is closed
	 */
	isClosed() {
		return this.room.isClosed()
	}
}

/** @public */
export type OmitVoid<T, KS extends keyof T = keyof T> = {
	[K in KS extends any ? (void extends T[KS] ? never : KS) : never]: T[K]
}

function convertStoreSnapshotToRoomSnapshot(snapshot: TLStoreSnapshot): RoomSnapshot {
	return {
		clock: 0,
		documents: objectMapValues(snapshot.store).map((state) => ({
			state,
			lastChangedClock: 0,
		})),
		schema: snapshot.schema,
		tombstones: {},
	}
}

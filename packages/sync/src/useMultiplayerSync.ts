import { isSignal } from '@tldraw/state'
import { useAtom } from '@tldraw/state-react'
import {
	ClientWebSocketAdapter,
	TLCloseEventCode,
	TLIncompatibilityReason,
	TLPersistentClientSocketStatus,
	TLRemoteSyncError,
	TLSyncClient,
} from '@tldraw/sync-core'
import { useEffect } from 'react'
import {
	Editor,
	Signal,
	TAB_ID,
	TLAssetStore,
	TLRecord,
	TLStore,
	TLStoreSchemaOptions,
	TLStoreWithStatus,
	computed,
	createPresenceStateDerivation,
	createTLStore,
	defaultUserPreferences,
	getUserPreferences,
	uniqueId,
	useNullableShallowObjectIdentity,
	useRefState,
	useTLSchemaFromUtils,
	useValue,
} from 'tldraw'

const MULTIPLAYER_EVENT_NAME = 'multiplayer.client'

/** @public */
export type RemoteTLStoreWithStatus = Exclude<
	TLStoreWithStatus,
	{ status: 'synced-local' } | { status: 'not-synced' }
>

/**
 * useMultiplayerSync creates a store that is synced with a multiplayer server.
 *
 * The store can be passed directly into the `<Tldraw />` component to enable multiplayer features.
 * It will handle loading states, and enable multiplayer UX like user cursors and following.
 *
 * To enable external blob storage, you should also pass in an `assets` object that implements the {@link tldraw#TLAssetStore} interface.
 * If you don't do this, adding large images and videos to rooms will cause performance issues at serialization boundaries.
 *
 * @example
 * ```tsx
 * function MyApp() {
 *     const store = useMultiplayerSync({
 *         uri: 'wss://myapp.com/sync/my-test-room',
 *         assets: myAssetStore
 *     })
 *     return <Tldraw store={store} />
 * }
 *
 * ```
 * @param opts - Options for the multiplayer sync store. See {@link UseMultiplayerSyncOptions} and {@link tldraw#TLStoreSchemaOptions}.
 *
 * @public
 */
export function useMultiplayerSync(
	opts: UseMultiplayerSyncOptions & TLStoreSchemaOptions
): RemoteTLStoreWithStatus {
	const [state, setState] = useRefState<{
		readyClient?: TLSyncClient<TLRecord, TLStore>
		error?: Error
	} | null>(null)
	const {
		uri,
		roomId = 'default',
		assets,
		onEditorMount,
		trackAnalyticsEvent: track,
		userInfo,
		...schemaOpts
	} = opts

	// This line will throw a type error if we add any new options to the useMultiplayerSync hook but we don't destructure them
	// This is required because otherwise the useTLSchemaFromUtils might return a new schema on every render if the newly-added option
	// is allowed to be unstable (e.g. userInfo)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const __never__: never = 0 as any as keyof Omit<typeof schemaOpts, keyof TLStoreSchemaOptions>

	const schema = useTLSchemaFromUtils(schemaOpts)

	const prefs = useNullableShallowObjectIdentity(userInfo)

	const userAtom = useAtom<TLMultiplayerUserInfo | Signal<TLMultiplayerUserInfo> | undefined>(
		'userAtom',
		prefs
	)

	useEffect(() => {
		userAtom.set(prefs)
	}, [prefs, userAtom])

	useEffect(() => {
		const storeId = uniqueId()

		const userPreferences = computed<{ id: string; color: string; name: string }>(
			'userPreferences',
			() => {
				const userStuff = userAtom.get()
				const user = (isSignal(userStuff) ? userStuff.get() : userStuff) ?? getUserPreferences()
				return {
					id: user.id,
					color: user.color ?? defaultUserPreferences.color,
					name: user.name ?? defaultUserPreferences.name,
				}
			}
		)

		const socket = new ClientWebSocketAdapter(async () => {
			// set sessionId as a query param on the uri
			const withParams = new URL(uri)
			withParams.searchParams.set('sessionId', TAB_ID)
			withParams.searchParams.set('storeId', storeId)
			return withParams.toString()
		})

		socket.onStatusChange((val: TLPersistentClientSocketStatus, closeCode?: number) => {
			if (val === 'error' && closeCode === TLCloseEventCode.NOT_FOUND) {
				track?.(MULTIPLAYER_EVENT_NAME, { name: 'room-not-found', roomId })
				setState({ error: new TLRemoteSyncError(TLIncompatibilityReason.RoomNotFound) })
				client.close()
				socket.close()
				return
			}
		})

		let didCancel = false

		const store = createTLStore({
			id: storeId,
			schema,
			assets,
			onEditorMount,
			multiplayerStatus: computed('multiplayer status', () =>
				socket.connectionStatus === 'error' ? 'offline' : socket.connectionStatus
			),
		})

		const client = new TLSyncClient({
			store,
			socket,
			didCancel: () => didCancel,
			onLoad(client) {
				track?.(MULTIPLAYER_EVENT_NAME, { name: 'load', roomId })
				setState({ readyClient: client })
			},
			onLoadError(err) {
				track?.(MULTIPLAYER_EVENT_NAME, { name: 'load-error', roomId })
				console.error(err)
				setState({ error: err })
			},
			onSyncError(reason) {
				track?.(MULTIPLAYER_EVENT_NAME, { name: 'sync-error', roomId, reason })
				setState({ error: new TLRemoteSyncError(reason) })
			},
			onAfterConnect() {
				// if the server crashes and loses all data it can return an empty document
				// when it comes back up. This is a safety check to make sure that if something like
				// that happens, it won't render the app broken and require a restart. The user will
				// most likely lose all their changes though since they'll have been working with pages
				// that won't exist. There's certainly something we can do to make this better.
				// but the likelihood of this happening is very low and maybe not worth caring about beyond this.
				store.ensureStoreIsUsable()
			},
			presence: createPresenceStateDerivation(userPreferences)(store),
		})

		return () => {
			didCancel = true
			client.close()
			socket.close()
			setState(null)
		}
	}, [assets, onEditorMount, userAtom, roomId, schema, setState, track, uri])

	return useValue<RemoteTLStoreWithStatus>(
		'remote synced store',
		() => {
			if (!state) return { status: 'loading' }
			if (state.error) return { status: 'error', error: state.error }
			if (!state.readyClient) return { status: 'loading' }
			const connectionStatus = state.readyClient.socket.connectionStatus
			return {
				status: 'synced-remote',
				connectionStatus: connectionStatus === 'error' ? 'offline' : connectionStatus,
				store: state.readyClient.store,
			}
		},
		[state]
	)
}

/**
 * The information about a user which is used for multiplayer features.
 * @public
 */
export interface TLMultiplayerUserInfo {
	/**
	 * id - A unique identifier for the user. This should be the same across all devices and sessions.
	 */
	id: string
	/**
	 * The user's display name. If not given, 'New User' will be shown.
	 */
	name?: string | null
	/**
	 * The user's color. If not given, a random color will be assigned.
	 */
	color?: string | null
}

/**
 * Options for the {@link useMultiplayerSync} hook.
 * @public
 */
export interface UseMultiplayerSyncOptions {
	/**
	 * The URI of the multiplayer server. This must include the protocol,
	 *
	 *   e.g. `wss://server.example.com/my-room` or `ws://localhost:5858/my-room`.
	 *
	 * Note that the protocol can also be `https` or `http` and it will upgrade to a websocket connection.
	 */
	uri: string
	/**
	 * A signal that contains the user information needed for multiplayer features.
	 * This should be synchronized with the `userPreferences` configuration for the main `<Tldraw />` component.
	 * If not provided, a default implementation based on localStorage will be used.
	 */
	userInfo?: TLMultiplayerUserInfo | Signal<TLMultiplayerUserInfo>
	/**
	 * The asset store for blob storage. See {@link tldraw#TLAssetStore}.
	 *
	 * If you don't have time to implement blob storage and just want to get started, you can use the inline base64 asset store. {@link tldraw#inlineBase64AssetStore}
	 * Note that storing base64 blobs inline in JSON is very inefficient and will cause performance issues quickly with large images and videos.
	 */
	assets: TLAssetStore

	/** @internal */
	onEditorMount?: (editor: Editor) => void
	/** @internal used for analytics only, we should refactor this away */
	roomId?: string
	/** @internal */
	trackAnalyticsEvent?(name: string, data: { [key: string]: any }): void
}

import { TLAsset, TLInstanceId, TLRecord, TLStore } from '@tldraw/tlschema'
import { Store, StoreSnapshot } from '@tldraw/tlstore'
import { annotateError } from '@tldraw/utils'
import React, { memo, useCallback, useLayoutEffect, useState, useSyncExternalStore } from 'react'
import { App } from './app/App'
import { StateNodeConstructor } from './app/statechart/StateNode'
import { EditorAssetUrls, defaultEditorAssetUrls } from './assetUrls'
import { DefaultErrorFallback } from './components/DefaultErrorFallback'
import { OptionalErrorBoundary } from './components/ErrorBoundary'
import { ShapeInfo } from './config/createTLStore'
import { ContainerProvider, useContainer } from './hooks/useContainer'
import { useCursor } from './hooks/useCursor'
import { useDarkMode } from './hooks/useDarkMode'
import { AppContext } from './hooks/useEditor'
import {
	EditorComponentsProvider,
	TLEditorComponents,
	useEditorComponents,
} from './hooks/useEditorComponents'
import { useEvent } from './hooks/useEvent'
import { useForceUpdate } from './hooks/useForceUpdate'
import { useLocalStore } from './hooks/useLocalStore'
import { usePreloadAssets } from './hooks/usePreloadAssets'
import { useSafariFocusOutFix } from './hooks/useSafariFocusOutFix'
import { useZoomCss } from './hooks/useZoomCss'
import { StoreWithStatus } from './utils/sync/StoreWithStatus'
import { TAB_ID } from './utils/sync/persistence-constants'

/** @public */
export type TldrawEditorProps = {
	children?: any
	/**
	 * An array of shape utils to use in the editor.
	 */
	shapes?: Record<string, ShapeInfo>
	/**
	 * An array of tools to use in the editor.
	 */
	tools?: StateNodeConstructor[]
	/**
	 * Urls for where to find fonts and other assets.
	 */
	assetUrls?: EditorAssetUrls
	/**
	 * Whether to automatically focus the editor when it mounts.
	 */
	autoFocus?: boolean
	/**
	 * Overrides for the tldraw user interface components.
	 */
	components?: Partial<TLEditorComponents>
	/**
	 * Called when the editor has mounted.
	 *
	 * @example
	 *
	 * ```ts
	 * function TldrawEditor() {
	 * 	return <Editor onMount={(app) => app.selectAll()} />
	 * }
	 * ```
	 *
	 * @param app - The app instance.
	 */
	onMount?: (app: App) => void
	/**
	 * Called when the editor generates a new asset from a file, such as when an image is dropped into
	 * the canvas.
	 *
	 * @example
	 *
	 * ```ts
	 * const app = new App({
	 * 	onCreateAssetFromFile: (file) => uploadFileAndCreateAsset(file),
	 * })
	 * ```
	 *
	 * @param file - The file to generate an asset from.
	 * @param id - The id to be assigned to the resulting asset.
	 */
	onCreateAssetFromFile?: (file: File) => Promise<TLAsset>

	/**
	 * Called when a URL is converted to a bookmark. This callback should return the metadata for the
	 * bookmark.
	 *
	 * @example
	 *
	 * ```ts
	 * app.onCreateBookmarkFromUrl(url, id)
	 * ```
	 *
	 * @param url - The url that was created.
	 * @public
	 */
	onCreateBookmarkFromUrl?: (
		url: string
	) => Promise<{ image: string; title: string; description: string }>
} & (
	| {
			/**
			 * The Store instance to use for keeping the editor's data. This may be prepopulated, e.g. by loading
			 * from a server or database.
			 */
			store: TLStore | StoreWithStatus
	  }
	| {
			store?: undefined
			/**
			 * The editor's initial data.
			 */
			initialData?: StoreSnapshot<TLRecord>
			/**
			 * The id of the editor instance (e.g. a browser tab if the editor will have only one tldraw app per
			 * tab). If not given, one will be generated.
			 */
			instanceId?: TLInstanceId
			/**
			 * The id under which to sync and persist the editor's data.
			 */
			persistenceKey?: string
			/**
			 * The initial document name to use for the new store.
			 */
			defaultName?: string
	  }
)

declare global {
	interface Window {
		tldrawReady: boolean
	}
}

/** @public */
export const TldrawEditor = memo(function TldrawEditor(props: TldrawEditorProps) {
	const [container, setContainer] = React.useState<HTMLDivElement | null>(null)

	const ErrorFallback =
		props.components?.ErrorFallback === undefined
			? DefaultErrorFallback
			: props.components?.ErrorFallback

	const { store, ...rest } = props

	return (
		<div ref={setContainer} draggable={false} className="tl-container tl-theme__light" tabIndex={0}>
			<OptionalErrorBoundary
				fallback={ErrorFallback ? (error) => <ErrorFallback error={error} /> : null}
				onError={(error) => annotateError(error, { tags: { origin: 'react.tldraw-before-app' } })}
			>
				{container && (
					<ContainerProvider container={container}>
						<EditorComponentsProvider overrides={props.components}>
							{store ? (
								store instanceof Store ? (
									// Store is ready to go, whether externally synced or not
									<TldrawEditorWithReadyStore {...rest} store={store} />
								) : (
									// Store is a synced store, so handle syncing stages internally
									<TldrawEditorWithLoadingStore {...rest} store={store} />
								)
							) : (
								// We have no store (it's undefined) so create one and possibly sync it
								<TldrawEditorWithOwnStore {...rest} store={store} />
							)}
						</EditorComponentsProvider>
					</ContainerProvider>
				)}
			</OptionalErrorBoundary>
		</div>
	)
})

function TldrawEditorWithOwnStore(props: TldrawEditorProps & { store: undefined }) {
	const { defaultName, initialData, instanceId = TAB_ID, shapes, persistenceKey } = props

	const syncedStore = useLocalStore({
		customShapes: shapes,
		instanceId,
		initialData,
		persistenceKey,
		defaultName,
	})

	return <TldrawEditorWithLoadingStore {...props} store={syncedStore} />
}

const TldrawEditorWithLoadingStore = memo(function TldrawEditorBeforeLoading({
	store,
	assetUrls,
	...rest
}: TldrawEditorProps & { store: StoreWithStatus }) {
	const { done: preloadingComplete, error: preloadingError } = usePreloadAssets(
		assetUrls ?? defaultEditorAssetUrls
	)

	switch (store.status) {
		case 'error': {
			// for error handling, we fall back to the default error boundary.
			// if users want to handle this error differently, they can render
			// their own error screen before the TldrawEditor component
			throw store.error
		}
		case 'loading': {
			return <LoadingScreen>Connecting...</LoadingScreen>
		}
		case 'not-synced': {
			break
		}
		case 'synced-local': {
			break
		}
		case 'synced-remote': {
			break
		}
	}

	if (preloadingError) {
		return <ErrorScreen>Could not load assets. Please refresh the page.</ErrorScreen>
	}

	if (!preloadingComplete) {
		return <LoadingScreen>Loading assets...</LoadingScreen>
	}

	return <TldrawEditorWithReadyStore {...rest} store={store.store} />
})

function TldrawEditorWithReadyStore({
	onMount,
	children,
	onCreateAssetFromFile,
	onCreateBookmarkFromUrl,
	store,
	tools,
	shapes,
	autoFocus,
}: TldrawEditorProps & {
	store: TLStore
}) {
	const { ErrorFallback } = useEditorComponents()
	const container = useContainer()
	const [app, setApp] = useState<App | null>(null)

	useLayoutEffect(() => {
		const app = new App({
			store,
			shapes,
			tools,
			getContainer: () => container,
		})
		;(window as any).app = app
		setApp(app)
		return () => {
			app.dispose()
		}
	}, [container, shapes, tools, store])

	React.useEffect(() => {
		if (!app) return

		// Overwrite the default onCreateAssetFromFile handler.
		if (onCreateAssetFromFile) {
			app.onCreateAssetFromFile = onCreateAssetFromFile
		}

		if (onCreateBookmarkFromUrl) {
			app.onCreateBookmarkFromUrl = onCreateBookmarkFromUrl
		}
	}, [app, onCreateAssetFromFile, onCreateBookmarkFromUrl])

	React.useLayoutEffect(() => {
		if (app && autoFocus) app.focus()
	}, [app, autoFocus])

	const onMountEvent = useEvent((app: App) => {
		onMount?.(app)
		app.emit('mount')
		window.tldrawReady = true
	})

	React.useEffect(() => {
		if (app) onMountEvent(app)
	}, [app, onMountEvent])

	const crashingError = useSyncExternalStore(
		useCallback(
			(onStoreChange) => {
				if (app) {
					app.on('crash', onStoreChange)
					return () => app.off('crash', onStoreChange)
				}
				return () => {
					// noop
				}
			},
			[app]
		),
		() => app?.crashingError ?? null
	)

	if (!app) {
		return null
	}

	return (
		// the top-level tldraw component also renders an error boundary almost
		// identical to this one. the reason we have two is because this one has
		// access to `App`, which means that here we can enrich errors with data
		// from app for reporting, and also still attempt to render the user's
		// document in the event of an error to reassure them that their work is
		// not lost.
		<OptionalErrorBoundary
			fallback={ErrorFallback ? (error) => <ErrorFallback error={error} app={app} /> : null}
			onError={(error) => app.annotateError(error, { origin: 'react.tldraw', willCrashApp: true })}
		>
			{crashingError ? (
				<Crash crashingError={crashingError} />
			) : (
				<AppContext.Provider value={app}>
					<Layout>{children}</Layout>
				</AppContext.Provider>
			)}
		</OptionalErrorBoundary>
	)
}

function Layout({ children }: { children: any }) {
	useZoomCss()
	useCursor()
	useDarkMode()
	useSafariFocusOutFix()
	useForceUpdate()

	return children
}

function Crash({ crashingError }: { crashingError: unknown }): null {
	throw crashingError
}

/** @public */
export function LoadingScreen({ children }: { children: any }) {
	const { Spinner } = useEditorComponents()

	return (
		<div className="tl-loading">
			{Spinner ? <Spinner /> : null}
			{children}
		</div>
	)
}

/** @public */
export function ErrorScreen({ children }: { children: any }) {
	return <div className="tl-loading">{children}</div>
}

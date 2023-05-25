import { Canvas, TldrawEditor, TldrawEditorConfig, TldrawEditorProps } from '@tldraw/editor'
import {
	DEFAULT_DOCUMENT_NAME,
	TAB_ID,
	getUserData,
	useLocalSyncClient,
} from '@tldraw/tlsync-client'
import { ContextMenu, TldrawUi, TldrawUiContextProviderProps } from '@tldraw/ui'
import { useEffect, useState } from 'react'

/** @public */
export function Tldraw(
	props: Omit<TldrawEditorProps, 'store' | 'config'> &
		TldrawUiContextProviderProps & {
			/** The key under which to persist this editor's data to local storage. */
			persistenceKey?: string
			/** Whether to hide the user interface and only display the canvas. */
			hideUi?: boolean
			/** A custom configuration for this Tldraw editor */
			config?: TldrawEditorProps['config']
		}
) {
	const {
		config,
		children,
		persistenceKey = DEFAULT_DOCUMENT_NAME,
		instanceId = TAB_ID,
		...rest
	} = props

	const [_config, _setConfig] = useState(() => config ?? new TldrawEditorConfig())

	useEffect(() => {
		_setConfig(config ?? new TldrawEditorConfig())
	}, [config])

	const userData = getUserData()

	const userId = props.userId ?? userData.id

	const syncedStore = useLocalSyncClient({
		instanceId,
		userId,
		config: _config,
		universalPersistenceKey: persistenceKey,
	})

	return (
		<TldrawEditor
			{...rest}
			instanceId={instanceId}
			userId={userId}
			store={syncedStore}
			config={_config}
		>
			<TldrawUi {...rest}>
				<ContextMenu>
					<Canvas />
				</ContextMenu>
				{children}
			</TldrawUi>
		</TldrawEditor>
	)
}

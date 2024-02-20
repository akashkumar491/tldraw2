import {
	DefaultHelpMenu,
	DefaultHelpMenuContent,
	DefaultKeyboardShortcutsDialog,
	DefaultKeyboardShortcutsDialogContent,
	DefaultMainMenu,
	DefaultMainMenuContent,
	SAVE_FILE_COPY_ACTION,
	SerializedSchema,
	TLComponents,
	TLRecord,
	Tldraw,
	TldrawUiMenuGroup,
	TldrawUiMenuItem,
	useActions,
	useFileSystem,
} from '@tldraw/tldraw'
import { UrlStateSync } from '../components/MultiplayerEditor'
import { StoreErrorScreen } from '../components/StoreErrorScreen'
import { useLocalStore } from '../hooks/useLocalStore'
import { assetUrls } from '../utils/assetUrls'
import { DebugMenuItems } from '../utils/migration/DebugMenuItems'
import { useSharing } from '../utils/sharing'
import { useHandleUiEvents } from '../utils/useHandleUiEvent'
import { ExportMenu } from './ExportMenu'
import { MultiplayerFileMenu } from './FileMenu'
import { Links } from './Links'

const components: TLComponents = {
	ErrorFallback: ({ error }) => {
		throw error
	},
	HelpMenu: () => (
		<DefaultHelpMenu>
			<TldrawUiMenuGroup id="help">
				<DefaultHelpMenuContent />
			</TldrawUiMenuGroup>
			<Links />
		</DefaultHelpMenu>
	),
	MainMenu: () => (
		<DefaultMainMenu>
			<MultiplayerFileMenu />
			<DefaultMainMenuContent />
		</DefaultMainMenu>
	),
	KeyboardShortcutsDialog: (props) => {
		const actions = useActions()
		return (
			<DefaultKeyboardShortcutsDialog {...props}>
				<TldrawUiMenuGroup id="shortcuts-dialog.file">
					<TldrawUiMenuItem {...actions[SAVE_FILE_COPY_ACTION]} />
				</TldrawUiMenuGroup>
				<DefaultKeyboardShortcutsDialogContent />
			</DefaultKeyboardShortcutsDialog>
		)
	},
	SharePanel: () => {
		return (
			<div className="tlui-share-zone" draggable={false}>
				<ExportMenu />
			</div>
		)
	},
}

type SnapshotEditorProps = {
	schema: SerializedSchema
	records: TLRecord[]
}

export function SnapshotsEditor(props: SnapshotEditorProps) {
	const handleUiEvent = useHandleUiEvents()
	const sharingUiOverrides = useSharing()
	const fileSystemUiOverrides = useFileSystem({ isMultiplayer: true })
	const storeResult = useLocalStore(props.records, props.schema)
	if (!storeResult?.ok) return <StoreErrorScreen error={new Error(storeResult?.error)} />

	return (
		<div className="tldraw__editor">
			<Tldraw
				assetUrls={assetUrls}
				store={storeResult.value}
				overrides={[sharingUiOverrides, fileSystemUiOverrides]}
				onUiEvent={handleUiEvent}
				onMount={(editor) => {
					editor.updateInstanceState({ isReadonly: true })
				}}
				components={components}
				renderDebugMenuItems={() => <DebugMenuItems />}
				autoFocus
				inferDarkMode
			>
				<UrlStateSync />
			</Tldraw>
		</div>
	)
}

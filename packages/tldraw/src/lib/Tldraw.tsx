import {
	Canvas,
	ErrorScreen,
	LoadingScreen,
	RecursivePartial,
	TldrawEditor,
	TldrawEditorProps,
} from '@tldraw/editor'
import { useMemo } from 'react'
import { TldrawHandles } from './canvas/TldrawHandles'
import { TldrawHoveredShapeIndicator } from './canvas/TldrawHoveredShapeIndicator'
import { TldrawScribble } from './canvas/TldrawScribble'
import { TldrawSelectionBackground } from './canvas/TldrawSelectionBackground'
import { TldrawSelectionForeground } from './canvas/TldrawSelectionForeground'
import { defaultShapeTools } from './defaultShapeTools'
import { defaultShapeUtils } from './defaultShapeUtils'
import { defaultTools } from './defaultTools'
import { TldrawUi, TldrawUiProps } from './ui/TldrawUi'
import { ContextMenu } from './ui/components/ContextMenu'
import { useRegisterExternalContentHandlers } from './useRegisterExternalContentHandlers'
import { useSideEffects } from './useSideEffects'
import { TLEditorAssetUrls, useDefaultEditorAssetsWithOverrides } from './utils/assetUrls'
import { usePreloadAssets } from './utils/usePreloadAssets'

/** @public */
export function Tldraw(
	props: TldrawEditorProps &
		TldrawUiProps & {
			/**
			 * Urls for the editor to find fonts and other assets.
			 */
			assetUrls?: RecursivePartial<TLEditorAssetUrls>
		}
) {
	const { children, ...rest } = props

	const withDefaults: TldrawEditorProps = {
		initialState: 'select',
		...rest,
		components: useMemo(
			() => ({
				Scribble: TldrawScribble,
				CollaboratorScribble: TldrawScribble,
				SelectionForeground: TldrawSelectionForeground,
				SelectionBackground: TldrawSelectionBackground,
				Handles: TldrawHandles,
				HoveredShapeIndicator: TldrawHoveredShapeIndicator,
				...rest.components,
			}),
			[rest.components]
		),
		shapeUtils: useMemo(
			() => [...defaultShapeUtils, ...(rest.shapeUtils ?? [])],
			[rest.shapeUtils]
		),
		tools: useMemo(
			() => [...defaultTools, ...defaultShapeTools, ...(rest.tools ?? [])],
			[rest.tools]
		),
	}

	const assets = useDefaultEditorAssetsWithOverrides(rest.assetUrls)

	const { done: preloadingComplete, error: preloadingError } = usePreloadAssets(assets)

	if (preloadingError) {
		return <ErrorScreen>Could not load assets. Please refresh the page.</ErrorScreen>
	}

	if (!preloadingComplete) {
		return <LoadingScreen>Loading assets...</LoadingScreen>
	}

	return (
		<TldrawEditor {...withDefaults}>
			<TldrawUi {...withDefaults}>
				<ContextMenu>
					<Canvas />
				</ContextMenu>
				{children}
				<Hacks />
			</TldrawUi>
		</TldrawEditor>
	)
}

function Hacks() {
	useRegisterExternalContentHandlers()
	useSideEffects()

	return null
}

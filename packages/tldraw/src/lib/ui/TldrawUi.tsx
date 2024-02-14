import { ToastProvider } from '@radix-ui/react-toast'
import { useEditor, useValue } from '@tldraw/editor'
import classNames from 'classnames'
import React, { ReactNode } from 'react'
import { TLUiAssetUrlOverrides } from './assetUrls'
import { DebugPanel } from './components/DebugPanel'
import { Dialogs } from './components/Dialogs'
import { FollowingIndicator } from './components/FollowingIndicator'
import { MenuZone } from './components/MenuZone'
import { ToastViewport, Toasts } from './components/Toasts'
import { Button } from './components/primitives/Button'
import {
	TldrawUiContextProvider,
	TldrawUiContextProviderProps,
} from './context/TldrawUiContextProvider'
import { useActions } from './context/actions'
import { useBreakpoint } from './context/breakpoints'
import { TLUiComponents, useTldrawUiComponents } from './context/components'
import { useNativeClipboardEvents } from './hooks/useClipboardEvents'
import { useEditorEvents } from './hooks/useEditorEvents'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useRelevantStyles } from './hooks/useRevelantStyles'
import { useTranslation } from './hooks/useTranslation/useTranslation'

/**
 * Props for the {@link @tldraw/tldraw#Tldraw} and {@link TldrawUi} components.
 *
 * @public
 */
export type TldrawUiProps = TldrawUiBaseProps & TldrawUiContextProviderProps

/**
 * Base props for the {@link @tldraw/tldraw#Tldraw} and {@link TldrawUi} components.
 *
 * @public
 */
export interface TldrawUiBaseProps {
	/**
	 * The component's children.
	 */
	children?: ReactNode

	/**
	 * Whether to hide the user interface and only display the canvas.
	 */
	hideUi?: boolean

	/**
	 * Overrides for the UI components.
	 */
	components?: TLUiComponents

	/**
	 * A component to use for the share zone (will be deprecated)
	 */
	shareZone?: ReactNode

	/**
	 * A component to use for the top zone (will be deprecated)
	 * @internal
	 */
	topZone?: ReactNode

	/**
	 * Additional items to add to the debug menu (will be deprecated)
	 */
	renderDebugMenuItems?: () => React.ReactNode

	/** Asset URL override. */
	assetUrls?: TLUiAssetUrlOverrides
}

/**
 * @public
 */
export const TldrawUi = React.memo(function TldrawUi({
	shareZone,
	topZone,
	renderDebugMenuItems,
	children,
	hideUi,
	components,
	...rest
}: TldrawUiProps) {
	return (
		<TldrawUiContextProvider {...rest} components={components}>
			<TldrawUiInner
				hideUi={hideUi}
				shareZone={shareZone}
				topZone={topZone}
				renderDebugMenuItems={renderDebugMenuItems}
			>
				{children}
			</TldrawUiInner>
		</TldrawUiContextProvider>
	)
})

type TldrawUiContentProps = {
	hideUi?: boolean
	shareZone?: ReactNode
	topZone?: ReactNode
	renderDebugMenuItems?: () => React.ReactNode
}

const TldrawUiInner = React.memo(function TldrawUiInner({
	children,
	hideUi,
	...rest
}: TldrawUiContentProps & { children: ReactNode }) {
	// The hideUi prop should prevent the UI from mounting.
	// If we ever need want the UI to mount and preserve state, then
	// we should change this behavior and hide the UI via CSS instead.

	return (
		<>
			{children}
			{hideUi ? null : <TldrawUiContent {...rest} />}
		</>
	)
})

const TldrawUiContent = React.memo(function TldrawUI({ shareZone, topZone }: TldrawUiContentProps) {
	const editor = useEditor()
	const msg = useTranslation()
	const breakpoint = useBreakpoint()
	const isReadonlyMode = useValue('isReadonlyMode', () => editor.getInstanceState().isReadonly, [
		editor,
	])
	const isFocusMode = useValue('focus', () => editor.getInstanceState().isFocusMode, [editor])
	const isDebugMode = useValue('debug', () => editor.getInstanceState().isDebugMode, [editor])

	const { StylePanel, Toolbar, HelpMenu, NavigationPanel, HelperButtons } = useTldrawUiComponents()

	useKeyboardShortcuts()
	useNativeClipboardEvents()
	useEditorEvents()

	const { 'toggle-focus-mode': toggleFocus } = useActions()

	return (
		<ToastProvider>
			<div
				className={classNames('tlui-layout', {
					'tlui-layout__mobile': breakpoint < 5,
				})}
				data-breakpoint={breakpoint}
			>
				{isFocusMode ? (
					<div className="tlui-layout__top">
						<Button
							type="icon"
							className="tlui-focus-button"
							title={`${msg('focus-mode.toggle-focus-mode')}`}
							icon="dot"
							onClick={() => toggleFocus.onSelect('menu')}
						/>
					</div>
				) : (
					<>
						<div className="tlui-layout__top">
							<div className="tlui-layout__top__left">
								<MenuZone />
								{HelperButtons && <HelperButtons />}
							</div>
							<div className="tlui-layout__top__center">{topZone}</div>
							<div className="tlui-layout__top__right">
								{shareZone}
								{StylePanel && breakpoint >= 5 && !isReadonlyMode && <_StylePanel />}
							</div>
						</div>
						<div className="tlui-layout__bottom">
							<div className="tlui-layout__bottom__main">
								{NavigationPanel && <NavigationPanel />}
								{Toolbar && <Toolbar />}
								{HelpMenu && <HelpMenu />}
							</div>
							{isDebugMode && <DebugPanel />}
						</div>
					</>
				)}
				<Toasts />
				<Dialogs />
				<ToastViewport />
				<FollowingIndicator />
			</div>
		</ToastProvider>
	)
})

function _StylePanel() {
	const { StylePanel } = useTldrawUiComponents()
	const relevantStyles = useRelevantStyles()

	if (!StylePanel) return null
	return <StylePanel relevantStyles={relevantStyles} />
}

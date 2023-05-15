import { App, useApp } from '@tldraw/editor'
import { compact } from '@tldraw/utils'
import React, { useMemo } from 'react'
import { useValue } from 'signia-react'
import {
	MenuSchema,
	menuCustom,
	menuGroup,
	menuItem,
	menuSubmenu,
	showMenuPaste,
	useAllowGroup,
	useAllowUngroup,
} from './menuHelpers'
import { useActions } from './useActions'
import { useBreakpoint } from './useBreakpoint'
import { useCanRedo } from './useCanRedo'
import { useCanUndo } from './useCanUndo'
import { useHasLinkShapeSelected } from './useHasLinkShapeSelected'
import { useShowAutoSizeToggle } from './useShowAutoSizeToggle'

/** @public */
export type MenuSchemaContextType = MenuSchema

/** @public */
export const MenuSchemaContext = React.createContext({} as MenuSchemaContextType)

/** @public */
export type MenuSchemaProviderProps = {
	overrides?: (
		app: App,
		schema: MenuSchemaContextType,
		helpers: {
			actions: ReturnType<typeof useActions>
			noneSelected: boolean
			oneSelected: boolean
			twoSelected: boolean
			threeSelected: boolean
		}
	) => MenuSchemaContextType
	children: any
}

/** @public */
export function MenuSchemaProvider({ overrides, children }: MenuSchemaProviderProps) {
	const app = useApp()
	const actions = useActions()

	const breakpoint = useBreakpoint()
	const isMobile = breakpoint < 5

	const isDarkMode = useValue('isDarkMode', () => app.userDocumentSettings.isDarkMode, [app])
	const isGridMode = useValue('isGridMode', () => app.userDocumentSettings.isGridMode, [app])
	const isSnapMode = useValue('isSnapMode', () => app.userDocumentSettings.isSnapMode, [app])
	const isToolLock = useValue('isToolLock', () => app.instanceState.isToolLocked, [app])
	const isFocusMode = useValue('isFocusMode', () => app.instanceState.isFocusMode, [app])
	const isDebugMode = useValue('isDebugMode', () => app.instanceState.isDebugMode, [app])
	const exportBackground = useValue('exportBackground', () => app.instanceState.exportBackground, [
		app,
	])

	const emptyPage = useValue('emptyPage', () => app.shapeIds.size === 0, [app])

	const selectedCount = useValue('selectedCount', () => app.selectedIds.length, [app])
	const noneSelected = selectedCount === 0
	const oneSelected = selectedCount > 0
	const twoSelected = selectedCount > 1
	const threeSelected = selectedCount > 2

	const hasClipboardWrite = Boolean(window.navigator.clipboard?.write)
	const showEditLink = useHasLinkShapeSelected()
	const showAutoSizeToggle = useShowAutoSizeToggle()
	const allowGroup = useAllowGroup()
	const allowUngroup = useAllowUngroup()
	const canUndo = useCanUndo()
	const canRedo = useCanRedo()
	const isZoomedTo100 = useValue('isZoomedTo100', () => app.zoomLevel === 1, [app])

	const menuSchema = useMemo<MenuSchema>(() => {
		const menuSchema = compact([
			menuGroup(
				'menu',
				menuSubmenu(
					'file',
					'menu.file',
					menuGroup('print', menuItem(actions['print'], { disabled: emptyPage }))
				),
				menuSubmenu(
					'edit',
					'menu.edit',
					menuGroup(
						'undo-actions',
						menuItem(actions['undo'], { disabled: !canUndo }),
						menuItem(actions['redo'], { disabled: !canRedo })
					),
					menuGroup(
						'clipboard-actions',
						menuItem(actions['cut'], { disabled: noneSelected }),
						menuItem(actions['copy'], { disabled: noneSelected }),
						{
							id: 'MENU_PASTE',
							type: 'custom',
							disabled: !showMenuPaste,
							readonlyOk: false,
						}
					),
					menuGroup(
						'conversions',
						menuSubmenu(
							'copy-as',
							'menu.copy-as',
							menuGroup(
								'copy-as-group',
								menuItem(actions['copy-as-svg'], { disabled: emptyPage }),
								menuItem(actions['copy-as-png'], { disabled: emptyPage || !hasClipboardWrite }),
								menuItem(actions['copy-as-json'], { disabled: emptyPage })
							),
							menuGroup(
								'export-bg',
								menuItem(actions['toggle-transparent'], { checked: !exportBackground })
							)
						),
						menuSubmenu(
							'export-as',
							'menu.export-as',
							menuGroup(
								'export-as-group',
								menuItem(actions['export-as-svg'], { disabled: emptyPage }),
								menuItem(actions['export-as-png'], { disabled: emptyPage }),
								menuItem(actions['export-as-json'], { disabled: emptyPage })
							),
							menuGroup(
								'export-bg',
								menuItem(actions['toggle-transparent'], { checked: !exportBackground })
							)
						)
					),
					menuGroup(
						'set-selection-group',
						menuItem(actions['select-all'], { disabled: emptyPage }),
						menuItem(actions['select-none'], { disabled: !oneSelected })
					),
					menuGroup(
						'selection',
						showAutoSizeToggle && menuItem(actions['toggle-auto-size']),
						showEditLink && menuItem(actions['edit-link']),
						menuItem(actions['duplicate'], { disabled: !oneSelected }),
						allowGroup && menuItem(actions['group']),
						allowUngroup && menuItem(actions['ungroup'])
					),
					menuGroup('delete-group', menuItem(actions['delete'], { disabled: !oneSelected }))
				),
				menuSubmenu(
					'view',
					'menu.view',
					menuGroup(
						'view-actions',
						menuItem(actions['zoom-in']),
						menuItem(actions['zoom-out']),
						menuItem(actions['zoom-to-100'], { disabled: isZoomedTo100 }),
						menuItem(actions['zoom-to-fit'], { disabled: emptyPage }),
						menuItem(actions['zoom-to-selection'], { disabled: emptyPage || !oneSelected })
					)
				)
			),
			menuGroup('extras', menuItem(actions['insert-embed']), menuItem(actions['insert-media'])),
			menuGroup(
				'preferences',
				menuSubmenu(
					'preferences',
					'menu.preferences',
					menuGroup(
						'preferences-actions',
						menuItem(actions['toggle-snap-mode'], { checked: isSnapMode }),
						menuItem(actions['toggle-tool-lock'], { checked: isToolLock }),
						menuItem(actions['toggle-grid'], { checked: isGridMode }),
						menuItem(actions['toggle-dark-mode'], { checked: isDarkMode }),
						menuItem(actions['toggle-focus-mode'], { checked: isFocusMode }),
						menuItem(actions['toggle-debug-mode'], { checked: isDebugMode })
					)
				),
				isMobile && menuCustom('LANGUAGE_MENU', { readonlyOk: true })
			),
		])

		if (overrides) {
			return overrides(app, menuSchema, {
				actions,
				noneSelected,
				oneSelected,
				twoSelected,
				threeSelected,
			})
		}

		return menuSchema
	}, [
		app,
		overrides,
		actions,
		oneSelected,
		twoSelected,
		threeSelected,
		emptyPage,
		isMobile,
		allowGroup,
		allowUngroup,
		showEditLink,
		hasClipboardWrite,
		showAutoSizeToggle,
		noneSelected,
		canUndo,
		canRedo,
		isDarkMode,
		isGridMode,
		isSnapMode,
		isToolLock,
		isFocusMode,
		exportBackground,
		isDebugMode,
		isZoomedTo100,
	])

	return <MenuSchemaContext.Provider value={menuSchema}>{children}</MenuSchemaContext.Provider>
}

/** @public */
export function useMenuSchema(): MenuSchema {
	const ctx = React.useContext(MenuSchemaContext)

	if (!ctx) {
		throw new Error('useMenuSchema must be used inside of a MenuSchemaProvider.')
	}

	return ctx
}

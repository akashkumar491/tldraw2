import { App, getEmbedInfo, TLBookmarkShapeDef, TLEmbedShapeDef, useApp } from '@tldraw/editor'
import React, { useMemo } from 'react'
import { track, useValue } from 'signia-react'
import {
	compactMenuItems,
	menuCustom,
	menuGroup,
	menuItem,
	MenuSchema,
	menuSubmenu,
	showMenuPaste,
	useAllowGroup,
	useAllowUngroup,
	useThreeStackableItems,
} from './menuHelpers'
import { useActions } from './useActions'
import { useHasLinkShapeSelected } from './useHasLinkShapeSelected'
import { useOnlyFlippableShape } from './useOnlyFlippableShape'
import { useShowAutoSizeToggle } from './useShowAutoSizeToggle'

/** @public */
export type ContextMenuSchemaContextType = MenuSchema

/** @public */
export const ContextMenuSchemaContext = React.createContext({} as ContextMenuSchemaContextType)

/** @public */
export type ContextMenuSchemaProviderProps = {
	overrides?: (
		app: App,
		schema: ContextMenuSchemaContextType,
		helpers: {
			actions: ReturnType<typeof useActions>
			oneSelected: boolean
			twoSelected: boolean
			threeSelected: boolean
			showAutoSizeToggle: boolean
			showUngroup: boolean
			onlyFlippableShapeSelected: boolean
		}
	) => ContextMenuSchemaContextType
	children: any
}

/** @public */
export const ContextMenuSchemaProvider = track(function ContextMenuSchemaProvider({
	overrides,
	children,
}: ContextMenuSchemaProviderProps) {
	const app = useApp()
	const actions = useActions()

	const showAutoSizeToggle = useShowAutoSizeToggle()

	const onlyFlippableShapeSelected = useOnlyFlippableShape()

	const selectedCount = app.selectedIds.length

	const oneSelected = selectedCount > 0
	const oneEmbedSelected = useValue(
		'oneEmbedSelected',
		() => {
			if (app.selectedIds.length !== 1) return false
			return app.selectedIds.some((selectedId) => {
				const shape = app.getShapeById(selectedId)
				return shape && TLEmbedShapeDef.is(shape) && shape.props.url
			})
		},
		[]
	)
	const oneEmbeddableBookmarkSelected = useValue(
		'oneEmbeddableBookmarkSelected',
		() => {
			if (app.selectedIds.length !== 1) return false
			return app.selectedIds.some((selectedId) => {
				const shape = app.getShapeById(selectedId)
				return shape && TLBookmarkShapeDef.is(shape) && getEmbedInfo(shape.props.url)
			})
		},
		[]
	)

	const twoSelected = selectedCount > 1
	const threeSelected = selectedCount > 2
	const threeStackableItems = useThreeStackableItems()
	const atLeastOneShapeOnPage = useValue('atLeastOneShapeOnPage', () => app.shapeIds.size > 0, [])
	const isTransparentBg = useValue('isTransparentBg', () => app.instanceState.exportBackground, [])
	const allowGroup = useAllowGroup()
	const allowUngroup = useAllowUngroup()
	const hasClipboardWrite = Boolean(window.navigator.clipboard?.write)
	const showEditLink = useHasLinkShapeSelected()

	const contextMenuSchema = useMemo<MenuSchema>(() => {
		let contextMenuSchema: ContextMenuSchemaContextType = compactMenuItems([
			menuGroup(
				'selection',
				oneEmbedSelected && menuItem(actions['open-embed-link']),
				oneEmbedSelected && menuItem(actions['convert-to-bookmark']),
				oneEmbeddableBookmarkSelected && menuItem(actions['convert-to-embed']),
				showAutoSizeToggle && menuItem(actions['toggle-auto-size']),
				showEditLink && menuItem(actions['edit-link']),
				oneSelected && menuItem(actions['duplicate']),
				allowGroup && menuItem(actions['group']),
				allowUngroup && menuItem(actions['ungroup'])
			),
			menuGroup(
				'modify',
				(twoSelected || onlyFlippableShapeSelected) &&
					menuSubmenu(
						'arrange',
						'context-menu.arrange',
						twoSelected &&
							menuGroup(
								'align',
								menuItem(actions['align-left']),
								menuItem(actions['align-center-horizontal']),
								menuItem(actions['align-right']),
								menuItem(actions['align-top']),
								menuItem(actions['align-center-vertical']),
								menuItem(actions['align-bottom'])
							),
						threeSelected &&
							menuGroup(
								'distribute',
								menuItem(actions['distribute-horizontal']),
								menuItem(actions['distribute-vertical'])
							),
						twoSelected &&
							menuGroup(
								'stretch',
								menuItem(actions['stretch-horizontal']),
								menuItem(actions['stretch-vertical'])
							),
						onlyFlippableShapeSelected &&
							menuGroup(
								'flip',
								menuItem(actions['flip-horizontal']),
								menuItem(actions['flip-vertical'])
							),
						twoSelected &&
							menuGroup(
								'order',
								menuItem(actions['pack'], { disabled: !twoSelected }),
								threeStackableItems && menuItem(actions['stack-vertical']),
								threeStackableItems && menuItem(actions['stack-horizontal'])
							)
					),
				oneSelected &&
					menuSubmenu(
						'reorder',
						'context-menu.reorder',
						menuGroup(
							'reorder',
							menuItem(actions['bring-to-front']),
							menuItem(actions['bring-forward']),
							menuItem(actions['send-backward']),
							menuItem(actions['send-to-back'])
						)
					),
				oneSelected && menuCustom('MOVE_TO_PAGE_MENU', { readonlyOk: false })
			),
			menuGroup(
				'clipboard-group',
				oneSelected && menuItem(actions['cut']),
				oneSelected && menuItem(actions['copy']),
				showMenuPaste && menuCustom('MENU_PASTE', { readonlyOk: false })
			),
			atLeastOneShapeOnPage &&
				menuGroup(
					'conversions',
					menuSubmenu(
						'copy-as',
						'context-menu.copy-as',
						menuGroup(
							'copy-as-group',
							menuItem(actions['copy-as-svg']),
							hasClipboardWrite && menuItem(actions['copy-as-png']),
							menuItem(actions['copy-as-json'])
						),
						menuGroup(
							'export-bg',
							menuItem(actions['toggle-transparent'], { checked: !isTransparentBg })
						)
					),
					menuSubmenu(
						'export-as',
						'context-menu.export-as',
						menuGroup(
							'export-as-group',
							menuItem(actions['export-as-svg']),
							menuItem(actions['export-as-png']),
							menuItem(actions['export-as-json'])
						),
						menuGroup(
							'export-bg,',
							menuItem(actions['toggle-transparent'], { checked: !isTransparentBg })
						)
					)
				),
			atLeastOneShapeOnPage &&
				menuGroup(
					'set-selection-group',
					menuItem(actions['select-all']),
					oneSelected && menuItem(actions['select-none'])
				),
			oneSelected && menuGroup('delete-group', menuItem(actions['delete'])),
		])

		if (overrides) {
			contextMenuSchema = overrides(app, contextMenuSchema, {
				actions,
				oneSelected,
				twoSelected,
				threeSelected,
				showAutoSizeToggle,
				showUngroup: allowUngroup,
				onlyFlippableShapeSelected,
			})
		}

		return contextMenuSchema
	}, [
		app,
		overrides,
		actions,
		oneSelected,
		twoSelected,
		threeSelected,
		showAutoSizeToggle,
		onlyFlippableShapeSelected,
		atLeastOneShapeOnPage,
		threeStackableItems,
		allowGroup,
		allowUngroup,
		hasClipboardWrite,
		showEditLink,
		oneEmbedSelected,
		oneEmbeddableBookmarkSelected,
		isTransparentBg,
	])

	return (
		<ContextMenuSchemaContext.Provider value={contextMenuSchema}>
			{children}
		</ContextMenuSchemaContext.Provider>
	)
})

/** @public */
export function useContextMenuSchema(): MenuSchema {
	const ctx = React.useContext(ContextMenuSchemaContext)

	if (!ctx) {
		throw new Error('useContextMenuSchema must be used inside of a ContextMenuSchemaProvider.')
	}

	return ctx
}

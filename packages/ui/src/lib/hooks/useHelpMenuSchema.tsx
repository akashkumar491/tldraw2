import { Editor, useEditor } from '@tldraw/editor'
import { compact } from '@tldraw/utils'
import React, { useMemo } from 'react'
import { track } from 'signia-react'
import { TLUiLanguage } from '../..'
import { KeyboardShortcutsDialog } from '../components/KeyboardShortcutsDialog'
import { TLUiMenuSchema, menuCustom, menuGroup, menuItem } from './menuHelpers'
import { useActions } from './useActions'
import { useDialogs } from './useDialogsProvider'
import { useLanguages } from './useTranslation/useLanguages'

/** @public */
export type TLUiHelpMenuSchemaContextType = TLUiMenuSchema

/** @internal */
export const HelpMenuSchemaContext = React.createContext({} as TLUiHelpMenuSchemaContextType)

/** @internal */
export type HelpMenuSchemaProviderProps = {
	overrides?: (
		editor: Editor,
		schema: TLUiHelpMenuSchemaContextType,
		helpers: {
			actions: ReturnType<typeof useActions>
			languages: readonly TLUiLanguage[]
			currentLanguage: string
			oneSelected: boolean
			twoSelected: boolean
			threeSelected: boolean
		}
	) => TLUiHelpMenuSchemaContextType
	children: any
}

/** @internal */
export const HelpMenuSchemaProvider = track(function HelpMenuSchemaProvider({
	overrides,
	children,
}: HelpMenuSchemaProviderProps) {
	const editor = useEditor()
	const actions = useActions()

	const selectedCount = editor.selectedIds.length

	const oneSelected = selectedCount > 0
	const twoSelected = selectedCount > 1
	const threeSelected = selectedCount > 2

	const { languages, currentLanguage } = useLanguages()
	const { addDialog } = useDialogs()

	const helpTLUiMenuSchema = useMemo<TLUiMenuSchema>(() => {
		const helpTLUiMenuSchema = compact([
			menuGroup(
				'top',
				menuCustom('LANGUAGE_MENU', { readonlyOk: true }),
				menuItem({
					id: 'keyboard-shortcuts',
					label: 'help-menu.keyboard-shortcuts',
					readonlyOk: true,
					onSelect() {
						addDialog({ component: KeyboardShortcutsDialog })
					},
				})
			),
		])

		if (overrides) {
			return overrides(editor, helpTLUiMenuSchema, {
				actions,
				currentLanguage,
				languages,
				oneSelected,
				twoSelected,
				threeSelected,
			})
		}

		return helpTLUiMenuSchema
	}, [
		editor,
		overrides,
		languages,
		actions,
		oneSelected,
		twoSelected,
		threeSelected,
		currentLanguage,
		addDialog,
	])

	return (
		<HelpMenuSchemaContext.Provider value={helpTLUiMenuSchema}>
			{children}
		</HelpMenuSchemaContext.Provider>
	)
})

/** @public */
export function useHelpMenuSchema(): TLUiMenuSchema {
	const ctx = React.useContext(HelpMenuSchemaContext)

	if (!ctx) {
		throw new Error('useHelpMenuSchema must be used inside of a helpTLUiMenuSchemaProvider.')
	}

	return ctx
}

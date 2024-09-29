import { addOpenMenu, deleteOpenMenu, Editor, uniqueId } from '@tldraw/editor'
import { ComponentType, createContext, ReactNode, useCallback, useContext, useState } from 'react'
import { useUiEvents } from './events'

/** @public */
export interface TLUiDialogProps {
	onClose(): void
}

/** @public */
export interface TLUiDialog {
	id: string
	onClose?(): void
	component: ComponentType<TLUiDialogProps>
}

/** @public */
export interface TLUiDialogsContextType {
	addDialog(dialog: Omit<TLUiDialog, 'id'> & { id?: string }): string
	removeDialog(id: string): string
	updateDialog(id: string, newDialogData: Partial<TLUiDialog>): string
	clearDialogs(): void
	dialogs: TLUiDialog[]
}

/** @internal */
export const DialogsContext = createContext<TLUiDialogsContextType | null>(null)

/** @public */
export interface DialogsProviderProps {
	context?: string
	overrides?(editor: Editor): TLUiDialogsContextType
	children: ReactNode
}

/** @public */
export function DialogsProvider({ context, children }: DialogsProviderProps) {
	const trackEvent = useUiEvents()

	const [dialogs, setDialogs] = useState<TLUiDialog[]>([])

	const addDialog = useCallback(
		(dialog: Omit<TLUiDialog, 'id'> & { id?: string }) => {
			const id = dialog.id ?? uniqueId()
			setDialogs((d) => {
				return [...d.filter((m) => m.id !== dialog.id), { ...dialog, id }]
			})

			trackEvent('open-menu', { source: 'dialog', id })
			addOpenMenu(id, context)

			return id
		},
		[trackEvent, context]
	)

	const updateDialog = useCallback(
		(id: string, newDialogData: Partial<TLUiDialog>) => {
			setDialogs((d) =>
				d.map((m) => {
					if (m.id === id) {
						return {
							...m,
							...newDialogData,
						}
					}
					return m
				})
			)

			trackEvent('open-menu', { source: 'dialog', id })
			addOpenMenu(id, context)

			return id
		},
		[trackEvent, context]
	)

	const removeDialog = useCallback(
		(id: string) => {
			setDialogs((d) =>
				d.filter((m) => {
					if (m.id === id) {
						m.onClose?.()
						return false
					}
					return true
				})
			)

			trackEvent('close-menu', { source: 'dialog', id })
			deleteOpenMenu(id, context)

			return id
		},
		[trackEvent, context]
	)

	const clearDialogs = useCallback(() => {
		setDialogs((d) => {
			if (d.length === 0) return d
			d.forEach((m) => {
				m.onClose?.()
				trackEvent('close-menu', { source: 'dialog', id: m.id })
				deleteOpenMenu(m.id, context)
			})
			return []
		})
	}, [trackEvent, context])

	return (
		<DialogsContext.Provider
			value={{ dialogs, addDialog, removeDialog, clearDialogs, updateDialog }}
		>
			{children}
		</DialogsContext.Provider>
	)
}

/** @public */
export function useDialogs() {
	const ctx = useContext(DialogsContext)

	if (!ctx) {
		throw new Error('useDialogs must be used within a DialogsProvider')
	}

	return ctx
}

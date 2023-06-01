import { App, TL_GEO_TYPES, featureFlags, useApp } from '@tldraw/editor'
import * as React from 'react'
import { useValue } from 'signia-react'
import { EmbedDialog } from '../components/EmbedDialog'
import { TLUiIconType } from '../icon-types'
import { useDialogs } from './useDialogsProvider'
import { TLUiEventSource, useEvents } from './useEventsProvider'
import { useInsertMedia } from './useInsertMedia'
import { TLTranslationKey } from './useTranslation/TLTranslationKey'

/** @public */
export interface ToolItem {
	id: string
	label: TLTranslationKey
	shortcutsLabel?: TLTranslationKey
	icon: TLUiIconType
	onSelect: (source: TLUiEventSource) => void
	kbd?: string
	readonlyOk: boolean
	meta?: {
		[key: string]: any
	}
}

/** @public */
export type ToolsContextType = Record<string, ToolItem>

/** @public */
export const ToolsContext = React.createContext({} as ToolsContextType)

/** @public */
export type ToolsProviderProps = {
	overrides?: (
		app: App,
		tools: ToolsContextType,
		helpers: { insertMedia: () => void }
	) => ToolsContextType
	children: any
}

/** @public */
export function ToolsProvider({ overrides, children }: ToolsProviderProps) {
	const app = useApp()
	const trackEvent = useEvents()

	const { addDialog } = useDialogs()
	const insertMedia = useInsertMedia()

	const highlighterEnabled = useValue(featureFlags.highlighterTool)

	const tools = React.useMemo<ToolsContextType>(() => {
		const toolsArray: ToolItem[] = [
			{
				id: 'select',
				label: 'tool.select',
				icon: 'tool-pointer',
				kbd: 'v',
				readonlyOk: true,
				onSelect(source) {
					app.setSelectedTool('select')
					trackEvent('select-tool', { source, id: 'select' })
				},
			},
			{
				id: 'hand',
				label: 'tool.hand',
				icon: 'tool-hand',
				kbd: 'h',
				readonlyOk: true,
				onSelect(source) {
					app.setSelectedTool('hand')
					trackEvent('select-tool', { source, id: 'hand' })
				},
			},
			{
				id: 'eraser',
				label: 'tool.eraser',
				icon: 'tool-eraser',
				kbd: 'e',
				readonlyOk: false,
				onSelect(source) {
					app.setSelectedTool('eraser')
					trackEvent('select-tool', { source, id: 'eraser' })
				},
			},
			{
				id: 'draw',
				label: 'tool.draw',
				readonlyOk: false,
				icon: 'tool-pencil',
				kbd: 'd,b,x',
				onSelect(source) {
					app.setSelectedTool('draw')
					trackEvent('select-tool', { source, id: 'draw' })
				},
			},
			...[...TL_GEO_TYPES].map((id) => ({
				id,
				label: `tool.${id}` as TLTranslationKey,
				readonlyOk: false,
				meta: {
					geo: id,
				},
				kbd: id === 'rectangle' ? 'r' : id === 'ellipse' ? 'o' : undefined,
				icon: ('geo-' + id) as TLUiIconType,
				onSelect(source: TLUiEventSource) {
					app.batch(() => {
						app.updateInstanceState(
							{ propsForNextShape: { ...app.instanceState.propsForNextShape, geo: id } },
							true
						)
						app.setSelectedTool('geo')
						trackEvent('select-tool', { source, id: `geo-${id}` })
					})
				},
			})),
			{
				id: 'arrow',
				label: 'tool.arrow',
				readonlyOk: false,
				icon: 'tool-arrow',
				kbd: 'a',
				onSelect(source) {
					app.setSelectedTool('arrow')
					trackEvent('select-tool', { source, id: 'arrow' })
				},
			},
			{
				id: 'line',
				label: 'tool.line',
				readonlyOk: false,
				icon: 'tool-line',
				kbd: 'l',
				onSelect(source) {
					app.setSelectedTool('line')
					trackEvent('select-tool', { source, id: 'line' })
				},
			},
			{
				id: 'frame',
				label: 'tool.frame',
				readonlyOk: false,
				icon: 'tool-frame',
				kbd: 'f',
				onSelect(source) {
					app.setSelectedTool('frame')
					trackEvent('select-tool', { source, id: 'frame' })
				},
			},
			{
				id: 'text',
				label: 'tool.text',
				readonlyOk: false,
				icon: 'tool-text',
				kbd: 't',
				onSelect(source) {
					app.setSelectedTool('text')
					trackEvent('select-tool', { source, id: 'text' })
				},
			},
			{
				id: 'asset',
				label: 'tool.asset',
				readonlyOk: false,
				icon: 'tool-media',
				kbd: '$u',
				onSelect(source) {
					insertMedia()
					trackEvent('select-tool', { source, id: 'media' })
				},
			},
			{
				id: 'note',
				label: 'tool.note',
				readonlyOk: false,
				icon: 'tool-note',
				kbd: 'n',
				onSelect(source) {
					app.setSelectedTool('note')
					trackEvent('select-tool', { source, id: 'note' })
				},
			},
			{
				id: 'laser',
				label: 'tool.laser',
				readonlyOk: true,
				icon: 'tool-laser',
				kbd: 'k',
				onSelect(source) {
					app.setSelectedTool('laser')
					trackEvent('select-tool', { source, id: 'laser' })
				},
			},
			{
				id: 'embed',
				label: 'tool.embed',
				readonlyOk: false,
				icon: 'tool-embed',
				onSelect(source) {
					addDialog({ component: EmbedDialog })
					trackEvent('select-tool', { source, id: 'embed' })
				},
			},
		]

		if (highlighterEnabled) {
			toolsArray.push({
				id: 'highlight',
				label: 'tool.highlight',
				readonlyOk: true,
				icon: 'tool-highlight',
				// TODO: pick a better shortcut
				kbd: 'i',
				onSelect(source) {
					app.setSelectedTool('highlight')
					trackEvent('select-tool', { source, id: 'highlight' })
				},
			})
		}

		const tools = makeTools(toolsArray)

		if (overrides) {
			return overrides(app, tools, { insertMedia })
		}

		return tools
	}, [highlighterEnabled, overrides, app, trackEvent, insertMedia, addDialog])

	return <ToolsContext.Provider value={tools}>{children}</ToolsContext.Provider>
}

function makeTools(tools: ToolItem[]) {
	return Object.fromEntries(tools.map((t) => [t.id, t]))
}

/** @public */
export function useTools() {
	const ctx = React.useContext(ToolsContext)

	if (!ctx) {
		throw new Error('useTools must be used within a ToolProvider')
	}

	return ctx
}

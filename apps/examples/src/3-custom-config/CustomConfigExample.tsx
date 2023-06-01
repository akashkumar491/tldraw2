import { MenuGroup, Tldraw, menuItem, toolbarItem } from '@tldraw/tldraw'
import '@tldraw/tldraw/editor.css'
import '@tldraw/tldraw/ui.css'
import { CardTool } from './CardTool'
import { CardUtil } from './CardUtil'

const shapes = { card: { util: CardUtil } }
const tools = [CardTool]

export default function CustomConfigExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw
				autoFocus
				tools={tools}
				shapes={shapes}
				overrides={{
					// In order for our custom tool to show up in the UI...
					// We need to add it to the tools list. This "toolItem"
					// has information about its icon, label, keyboard shortcut,
					// and what to do when it's selected.
					tools(app, tools) {
						tools.card = {
							id: 'card',
							icon: 'color',
							label: 'Card' as any,
							kbd: 'c',
							readonlyOk: false,
							onSelect: () => {
								app.setSelectedTool('card')
							},
						}
						return tools
					},
					toolbar(_app, toolbar, { tools }) {
						// The toolbar is an array of items. We can add it to the
						// end of the array or splice it in, then return the array.
						toolbar.splice(4, 0, toolbarItem(tools.card))
						return toolbar
					},
					keyboardShortcutsMenu(_app, keyboardShortcutsMenu, { tools }) {
						// Same for the keyboard shortcuts menu, but this menu contains
						// both items and groups. We want to find the "Tools" group and
						// add it to that before returning the array.
						const toolsGroup = keyboardShortcutsMenu.find(
							(group) => group.id === 'shortcuts-dialog.tools'
						) as MenuGroup
						toolsGroup.children.push(menuItem(tools.card))
						return keyboardShortcutsMenu
					},
				}}
			/>
		</div>
	)
}

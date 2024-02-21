import {
	DefaultKeyboardShortcutsDialog,
	DefaultKeyboardShortcutsDialogContent,
	TLComponents,
	TLUiOverrides,
	TldrawUiMenuItem,
	toolbarItem,
	useTools,
} from '@tldraw/tldraw'

// There's a guide at the bottom of this file!

export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		// Create a tool item in the ui's context.
		tools.PlayingCard = {
			id: 'PlayingCard',
			icon: 'color',
			label: 'PlayingCard',
			kbd: 'c',
			onSelect: () => {
				editor.setCurrentTool('PlayingCard')
			},
		}
		return tools
	},
	toolbar(_app, toolbar, { tools }) {
		// Add the tool item from the context to the toolbar.
		toolbar.splice(4, 0, toolbarItem(tools.PlayingCard))
		return toolbar
	},
}

export const components: TLComponents = {
	KeyboardShortcutsDialog: (props) => {
		const tools = useTools()
		return (
			<DefaultKeyboardShortcutsDialog {...props}>
				{/* Ideally, we'd interleave this into the tools group */}
				<TldrawUiMenuItem {...tools['PlayingCard']} />
				<DefaultKeyboardShortcutsDialogContent />
			</DefaultKeyboardShortcutsDialog>
		)
	},
}

/* 

This file contains overrides for the Tldraw UI. These overrides are used to add your custom tools
to the toolbar and the keyboard shortcuts menu.

We do this by providing a custom toolbar override to the Tldraw component. This override is a 
function that takes the current editor, the default toolbar items, and the default tools. 
It returns the new toolbar items. We use the toolbarItem helper to create a new toolbar item
for our custom tool. We then splice it into the toolbar items array at the 4th index. This puts 
it after the eraser tool. We'll pass our overrides object into the Tldraw component's `overrides` 
prop.


*/

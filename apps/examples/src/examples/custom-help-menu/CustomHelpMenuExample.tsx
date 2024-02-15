import {
	DefaultHelpMenu,
	DefaultHelpMenuContent,
	TLComponents,
	Tldraw,
	TldrawUiMenuGroup,
	TldrawUiMenuItem,
} from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

function CustomHelpMenu() {
	return (
		<DefaultHelpMenu>
			<TldrawUiMenuGroup id="example">
				<TldrawUiMenuItem
					id="like"
					label="Like my posts"
					icon="external-link"
					readonlyOk
					onSelect={() => {
						window.open('https://x.com/tldraw', '_blank')
					}}
				/>
			</TldrawUiMenuGroup>
			<DefaultHelpMenuContent />
		</DefaultHelpMenu>
	)
}

const components: TLComponents = {
	HelpMenu: CustomHelpMenu,
}

export default function CustomHelpMenuExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw components={components} />
		</div>
	)
}

import {
	DefaultDebugMenu,
	DefaultDebugMenuContent,
	TLComponents,
	Tldraw,
	TldrawUiMenuGroup,
	TldrawUiMenuItem,
} from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

function CustomDebugMenu() {
	return (
		<DefaultDebugMenu>
			<DefaultDebugMenuContent />
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
		</DefaultDebugMenu>
	)
}

const components: TLComponents = {
	DebugMenu: CustomDebugMenu,
}

export default function CustomDebugMenuExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw components={components} />
		</div>
	)
}

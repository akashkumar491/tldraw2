import {
	DefaultMainMenuContent,
	TLComponents,
	Tldraw,
	TldrawUiMenuGroup,
	TldrawUiMenuItem,
} from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

function CustomMainMenuContent() {
	return (
		<>
			<DefaultMainMenuContent />
			<TldrawUiMenuGroup id="custom stuff">
				<TldrawUiMenuItem
					id="about"
					label="Like my posts"
					icon="external-link"
					readonlyOk
					onSelect={() => {
						window.open('https://x.com/tldraw', '_blank')
					}}
				/>
			</TldrawUiMenuGroup>
		</>
	)
}

const components: TLComponents = {
	MainMenuContent: CustomMainMenuContent,
}

export default function CustomMainMenuExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw components={components} />
		</div>
	)
}

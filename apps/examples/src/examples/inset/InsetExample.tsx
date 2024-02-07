import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

export default function InsetExample() {
	return (
		<div style={{ position: 'absolute', inset: 200 }}>
			<div className="tldraw__editor">
				<Tldraw />
			</div>
		</div>
	)
}

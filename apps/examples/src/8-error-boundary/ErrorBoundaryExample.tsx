import { createShapeId, Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/editor.css'
import '@tldraw/tldraw/ui.css'
import { ErrorUtil } from './ErrorUtil'

const shapes = {
	error: {
		util: ErrorUtil, // a custom shape that will always error
	},
}

export default function ErrorBoundaryExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw
				shapes={shapes}
				components={{
					ErrorFallback: null, // disable app-level error boundaries
					ShapeErrorFallback: ({ error }) => <div>Shape error! {String(error)}</div>, // use a custom error fallback for shapes
				}}
				onMount={(app) => {
					// When the app starts, create our error shape so we can see.
					app.createShapes([
						{
							type: 'error',
							id: createShapeId(),
							x: 0,
							y: 0,
							props: { message: 'Something has gone wrong' },
						},
					])

					// Center the camera on the error shape
					app.zoomToFit()
					app.resetZoom()
				}}
			/>
		</div>
	)
}

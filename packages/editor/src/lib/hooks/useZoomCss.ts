import { debounce } from '@tldraw/utils'
import * as React from 'react'
import { EffectScheduler } from 'signia'
import { useApp } from './useApp'
import { useContainer } from './useContainer'

export function useZoomCss() {
	const app = useApp()
	const container = useContainer()

	React.useEffect(() => {
		const setScale = (s: number) => container.style.setProperty('--tl-zoom', s.toString())
		const setScaleDebounced = debounce(setScale, 100)

		const scheduler = new EffectScheduler('useZoomCss', () => {
			const numShapes = app.shapeIds.size
			if (numShapes < 300) {
				setScale(app.zoomLevel)
			} else {
				setScaleDebounced(app.zoomLevel)
			}
		})

		scheduler.attach()
		scheduler.execute()

		return () => {
			scheduler.detach()
		}
	}, [app, container])
}

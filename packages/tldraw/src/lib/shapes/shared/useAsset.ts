import { TLAssetId, useEditor, useValue } from '@tldraw/editor'
import { useEffect, useState } from 'react'

/** @internal */
export function useAsset(assetId: TLAssetId | null, width: number) {
	const editor = useEditor()
	const [url, setUrl] = useState<string | null>(null)
	const asset = assetId ? editor.getAsset(assetId) : null

	const shapeScale = asset && 'w' in asset.props ? width / asset.props.w : 1
	// We debounce the zoom level to reduce the number of times we fetch a new image and,
	// more importantly, to not cause zooming in and out to feel janky.
	const screenScale = useValue('zoom level', () => editor.getZoomLevel() * shapeScale, [
		editor,
		shapeScale,
	])

	useEffect(() => {
		let isCancelled = false
		const timer = editor.timers.setTimeout(async () => {
			const resolvedUrl = await editor.resolveAssetUrl(assetId, {
				screenScale,
			})
			if (!isCancelled) setUrl(resolvedUrl)
		})

		return () => {
			clearTimeout(timer)
			isCancelled = true
		}
	}, [assetId, screenScale, editor])

	return { asset, url }
}

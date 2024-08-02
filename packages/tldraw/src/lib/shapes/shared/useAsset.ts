import { TLAssetId, TLShapeId, useEditor, useValue } from '@tldraw/editor'
import { useEffect, useRef, useState } from 'react'

/**
 * This is a handy helper hook that resolves an asset to a URL for a given shape. It takes care of fetching the asset.
 * This is used in particular for high-resolution images when you want lower and higher resolution depending
 * on the context.
 *
 * @public
 */
export function useAsset(shapeId: TLShapeId, assetId: TLAssetId | null, width: number) {
	const editor = useEditor()
	const [url, setUrl] = useState<string | null>(null)
	const [isPlaceholder, setIsPlaceholder] = useState(false)
	const asset = assetId ? editor.getAsset(assetId) : null
	const culledShapes = editor.getCulledShapes()
	const isCulled = culledShapes.has(shapeId)
	const didAlreadyResolve = useRef(false)

	useEffect(() => {
		if (url) didAlreadyResolve.current = true
	}, [url])

	const shapeScale = asset && 'w' in asset.props ? width / asset.props.w : 1
	// We debounce the zoom level to reduce the number of times we fetch a new image and,
	// more importantly, to not cause zooming in and out to feel janky.
	const screenScale = useValue('zoom level', () => editor.getZoomLevel() * shapeScale, [
		editor,
		shapeScale,
	])

	useEffect(() => {
		if (url) didAlreadyResolve.current = true
	}, [url])

	useEffect(() => {
		if (isCulled) return

		if (assetId && !asset?.props.src) {
			const preview = editor.getTemporaryAssetPreview(assetId)

			if (preview) {
				setUrl(preview)
				setIsPlaceholder(true)
				return
			}
		}

		let isCancelled = false

		async function resolve() {
			const resolvedUrl = await editor.resolveAssetUrl(assetId, {
				screenScale,
			})

			if (!isCancelled) {
				setUrl(resolvedUrl)
				setIsPlaceholder(false)
			}
		}

		// If we already resolved the URL, debounce fetching potentially multiple image variations.
		const timer = editor.timers.setTimeout(resolve, didAlreadyResolve.current ? 500 : 0)

		return () => {
			clearTimeout(timer)
			isCancelled = true
		}
	}, [assetId, asset?.props.src, isCulled, screenScale, editor])

	return { asset, url, isPlaceholder }
}

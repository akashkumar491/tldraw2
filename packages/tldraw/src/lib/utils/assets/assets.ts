import downscale from 'downscale'
import { clampToBrowserMaxCanvasSize } from '../../shapes/shared/getBrowserCanvasMaxSize'
import { isAnimated } from './is-gif-animated'

type BoxWidthHeight = {
	w: number
	h: number
}

/**
 * Contains the size within the given box size
 *
 * @param originalSize - The size of the asset
 * @param containBoxSize - The container size
 * @returns Adjusted size
 * @public
 */
export function containBoxSize(
	originalSize: BoxWidthHeight,
	containBoxSize: BoxWidthHeight
): BoxWidthHeight {
	const overByXScale = originalSize.w / containBoxSize.w
	const overByYScale = originalSize.h / containBoxSize.h

	if (overByXScale <= 1 && overByYScale <= 1) {
		return originalSize
	} else if (overByXScale > overByYScale) {
		return {
			w: originalSize.w / overByXScale,
			h: originalSize.h / overByXScale,
		}
	} else {
		return {
			w: originalSize.w / overByYScale,
			h: originalSize.h / overByYScale,
		}
	}
}

/**
 * Get the size of an image from its source.
 *
 * @example
 * ```ts
 * const size = await getImageSize('https://example.com/image.jpg')
 * const dataUrl = await getResizedImageDataUrl('https://example.com/image.jpg', size.w, size.h, { type: "image/jpeg", quality: 0.92 })
 * ```
 *
 * @param dataURLForImage - The image file as a string.
 * @param width - The desired width.
 * @param height - The desired height.
 * @param opts - Options for the image.
 * @public
 */
export async function getResizedImageDataUrl(
	dataURLForImage: string,
	width: number,
	height: number,
	opts = {} as { type?: string; quality?: number }
): Promise<string> {
	const { type = 'image/jpeg', quality = 0.92 } = opts
	const [desiredWidth, desiredHeight] = await clampToBrowserMaxCanvasSize(width * 2, height * 2)

	return await downscale(dataURLForImage, desiredWidth, desiredHeight, {
		// downscale expects the type without the `image/` prefix
		imageType: type.replace('image/', ''),
		quality,
	})
}

/** @public */
export const DEFAULT_ACCEPTED_IMG_TYPE = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
/** @public */
export const DEFAULT_ACCEPTED_VID_TYPE = ['video/mp4', 'video/quicktime']

/** @public */
export async function isGifAnimated(file: File): Promise<boolean> {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onerror = () => reject(reader.error)
		reader.onload = () => {
			resolve(reader.result ? isAnimated(reader.result as ArrayBuffer) : false)
		}
		reader.readAsArrayBuffer(file)
	})
}

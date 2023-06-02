import { useEffect, useMemo, useState } from 'react'
import { HASH_PATERN_ZOOM_NAMES, MAX_ZOOM } from '../constants'
import { debugFlags } from '../utils/debug-flags'
import { useEditor } from './useEditor'

const TILE_PATTERN_SIZE = 8

const generateImage = (dpr: number, currentZoom: number, darkMode: boolean) => {
	return new Promise<Blob>((resolve, reject) => {
		const size = TILE_PATTERN_SIZE * currentZoom * dpr

		const canvasEl = document.createElement('canvas')
		canvasEl.width = size
		canvasEl.height = size

		const ctx = canvasEl.getContext('2d')
		if (!ctx) return

		ctx.fillStyle = darkMode ? '#212529' : '#f8f9fa'
		ctx.fillRect(0, 0, size, size)

		// This essentially generates an inverse of the pattern we're drawing.
		ctx.globalCompositeOperation = 'destination-out'

		ctx.lineCap = 'round'
		ctx.lineWidth = 1.25 * currentZoom * dpr

		const t = 8 / 12
		const s = (v: number) => v * currentZoom * dpr

		ctx.beginPath()
		ctx.moveTo(s(t * 1), s(t * 3))
		ctx.lineTo(s(t * 3), s(t * 1))

		ctx.moveTo(s(t * 5), s(t * 7))
		ctx.lineTo(s(t * 7), s(t * 5))

		ctx.moveTo(s(t * 9), s(t * 11))
		ctx.lineTo(s(t * 11), s(t * 9))
		ctx.stroke()

		canvasEl.toBlob((blob) => {
			if (!blob || debugFlags.throwToBlob.value) {
				reject()
			} else {
				resolve(blob)
			}
		})
	})
}

const canvasBlob = (size: [number, number], fn: (ctx: CanvasRenderingContext2D) => void) => {
	const canvas = document.createElement('canvas')
	canvas.width = size[0]
	canvas.height = size[1]
	const ctx = canvas.getContext('2d')
	if (!ctx) return ''
	fn(ctx)
	return canvas.toDataURL()
}
type PatternDef = { zoom: number; url: string; darkMode: boolean }

const getDefaultPatterns = () => {
	const defaultPatterns: PatternDef[] = []
	for (let i = 1; i <= Math.ceil(MAX_ZOOM); i++) {
		const whitePixelBlob = canvasBlob([1, 1], (ctx) => {
			// Hard coded '--palette-black-semi'
			ctx.fillStyle = '#e8e8e8'
			ctx.fillRect(0, 0, 1, 1)
		})
		const blackPixelBlob = canvasBlob([1, 1], (ctx) => {
			// Hard coded '--palette-black-semi'
			ctx.fillStyle = '#2c3036'
			ctx.fillRect(0, 0, 1, 1)
		})
		defaultPatterns.push({
			zoom: i,
			url: whitePixelBlob,
			darkMode: false,
		})
		defaultPatterns.push({
			zoom: i,
			url: blackPixelBlob,
			darkMode: true,
		})
	}
	return defaultPatterns
}

export const usePattern = () => {
	const editor = useEditor()
	const dpr = editor.devicePixelRatio
	const [isReady, setIsReady] = useState(false)
	const defaultPatterns = useMemo(() => getDefaultPatterns(), [])
	const [backgroundUrls, setBackgroundUrls] = useState<PatternDef[]>(defaultPatterns)

	useEffect(() => {
		const promises: Promise<{ zoom: number; url: string; darkMode: boolean }>[] = []

		for (let i = 1; i <= Math.ceil(MAX_ZOOM); i++) {
			promises.push(
				generateImage(dpr, i, false).then((blob) => ({
					zoom: i,
					url: URL.createObjectURL(blob),
					darkMode: false,
				}))
			)
			promises.push(
				generateImage(dpr, i, true).then((blob) => ({
					zoom: i,
					url: URL.createObjectURL(blob),
					darkMode: true,
				}))
			)
		}

		let isCancelled = false
		Promise.all(promises).then((urls) => {
			if (isCancelled) return
			setBackgroundUrls(urls)
			setIsReady(true)
		})

		return () => {
			isCancelled = true
			setIsReady(false)
		}
	}, [dpr])

	const context = (
		<>
			{backgroundUrls.map((item) => {
				const key = item.zoom + (item.darkMode ? '_dark' : '_light')
				return (
					<pattern
						key={key}
						id={HASH_PATERN_ZOOM_NAMES[key]}
						width={TILE_PATTERN_SIZE}
						height={TILE_PATTERN_SIZE}
						patternUnits="userSpaceOnUse"
					>
						<image href={item.url} width={TILE_PATTERN_SIZE} height={TILE_PATTERN_SIZE} />
					</pattern>
				)
			})}
		</>
	)

	return { context, isReady }
}

const t = 8 / 12
export function exportPatternSvgDefs(backgroundColor: string) {
	const divEl = document.createElement('div')
	divEl.innerHTML = `
		<svg>
			<defs>
				<mask id="hash_pattern_mask">
					<rect x="0" y="0" width="8" height="8" fill="white" />
					<g
						strokeLinecap="round"
						stroke="black"
					>
						<line x1="${t * 1}" y1="${t * 3}" x2="${t * 3}" y2="${t * 1}" />
						<line x1="${t * 5}" y1="${t * 7}" x2="${t * 7}" y2="${t * 5}" />
						<line x1="${t * 9}" y1="${t * 11}" x2="${t * 11}" y2="${t * 9}" />
					</g>
				</mask>
				<pattern
					id="hash_pattern"
					width="8"
					height="8"
					patternUnits="userSpaceOnUse"
				>
					<rect x="0" y="0" width="8" height="8" fill="${backgroundColor}" mask="url(#hash_pattern_mask)" />
				</pattern>
			</defs>
		</svg>
	`
	return divEl.querySelectorAll('defs > *')!
}

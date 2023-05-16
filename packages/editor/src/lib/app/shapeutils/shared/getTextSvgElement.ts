import { Box2d } from '@tldraw/primitives'
import { Box2dModel, TLAlignType } from '@tldraw/tlschema'
import { correctSpacesToNbsp } from '../../../utils/string'
import { App } from '../../App'

/** Get an SVG element for a text shape. */
export function getTextSvgElement(
	app: App,
	opts: {
		spans: { text: string; box: Box2dModel }[]
		fontSize: number
		fontFamily: string
		textAlign: TLAlignType
		fontWeight: string
		fontStyle: string
		lineHeight: number
		width: number
		height: number
		stroke?: string
		strokeWidth?: number
		fill?: string
		padding?: number
		offsetX?: number
		offsetY?: number
	}
) {
	const { padding = 0 } = opts

	// Create the text element
	const textElm = document.createElementNS('http://www.w3.org/2000/svg', 'text')
	textElm.setAttribute('font-size', opts.fontSize + 'px')
	textElm.setAttribute('font-family', opts.fontFamily)
	textElm.setAttribute('font-style', opts.fontStyle)
	textElm.setAttribute('font-weight', opts.fontWeight)
	textElm.setAttribute('line-height', opts.lineHeight * opts.fontSize + 'px')
	textElm.setAttribute('dominant-baseline', 'mathematical')
	textElm.setAttribute('alignment-baseline', 'mathematical')

	if (opts.spans.length === 0) return textElm

	const bounds = Box2d.From(opts.spans[0].box)
	for (const { box } of opts.spans) {
		bounds.union(box)
	}

	const offsetX = padding + (opts.offsetX ?? 0)
	const offsetY = (Math.ceil(opts.height) - bounds.height + opts.fontSize) / 2 + (opts.offsetY ?? 0)

	// Create text span elements for each work
	let currentLineTop = null
	for (const { text, box } of opts.spans) {
		// if we broke a line, add a line break span. This helps tools like
		// figma import our exported svg correctly
		const didBreakLine = currentLineTop !== null && box.y > currentLineTop
		if (didBreakLine) {
			const lineBreakTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
			lineBreakTspan.setAttribute('alignment-baseline', 'mathematical')
			lineBreakTspan.setAttribute('x', offsetX + 'px')
			lineBreakTspan.setAttribute('y', box.y + offsetY + 'px')
			lineBreakTspan.textContent = '\n'
			textElm.appendChild(lineBreakTspan)
		}

		const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
		tspan.setAttribute('alignment-baseline', 'mathematical')
		tspan.setAttribute('x', box.x + offsetX + 'px')
		tspan.setAttribute('y', box.y + offsetY + 'px')
		const cleanText = correctSpacesToNbsp(text)
		tspan.textContent = cleanText
		textElm.appendChild(tspan)

		currentLineTop = box.y
	}

	if (opts.stroke && opts.strokeWidth) {
		textElm.setAttribute('stroke', opts.stroke)
		textElm.setAttribute('stroke-width', opts.strokeWidth + 'px')
	}

	if (opts.fill) {
		textElm.setAttribute('fill', opts.fill)
	}

	return textElm
}

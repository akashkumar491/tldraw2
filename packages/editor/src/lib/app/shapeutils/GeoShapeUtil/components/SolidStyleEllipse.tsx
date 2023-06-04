import { TLGeoShape } from '@tldraw/tlschema'
import * as React from 'react'
import { getShapeFillSvg, getSvgWithShapeFill, ShapeFill } from '../../shared/ShapeFill'
import { TLExportColors } from '../../shared/TLExportColors'

export const SolidStyleEllipse = React.memo(function SolidStyleEllipse({
	w,
	h,
	strokeWidth: sw,
	fill,
	color,
}: Pick<TLGeoShape['props'], 'w' | 'h' | 'fill' | 'color'> & { strokeWidth: number }) {
	const cx = w / 2
	const cy = h / 2
	const rx = Math.max(0, cx)
	const ry = Math.max(0, cy)

	const d = `M${cx - rx},${cy}a${rx},${ry},0,1,1,${rx * 2},0a${rx},${ry},0,1,1,-${rx * 2},0`

	return (
		<>
			<ShapeFill d={d} color={color} fill={fill} />
			<path d={d} stroke={`var(--palette-${color})`} strokeWidth={sw} fill="none" />
		</>
	)
})

export function SolidStyleEllipseSvg({
	w,
	h,
	strokeWidth: sw,
	fill,
	color,
	colors,
}: Pick<TLGeoShape['props'], 'w' | 'h' | 'fill' | 'color'> & {
	strokeWidth: number
	colors: TLExportColors
}) {
	const cx = w / 2
	const cy = h / 2
	const rx = Math.max(0, cx)
	const ry = Math.max(0, cy)

	const d = `M${cx - rx},${cy}a${rx},${ry},0,1,1,${rx * 2},0a${rx},${ry},0,1,1,-${rx * 2},0`

	const strokeElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	strokeElement.setAttribute('d', d)
	strokeElement.setAttribute('stroke-width', sw.toString())
	strokeElement.setAttribute('width', w.toString())
	strokeElement.setAttribute('height', h.toString())
	strokeElement.setAttribute('fill', 'none')
	strokeElement.setAttribute('stroke', colors.fill[color])

	// Get the fill element, if any
	const fillElement = getShapeFillSvg({
		d,
		fill,
		color,
		colors,
	})

	return getSvgWithShapeFill(strokeElement, fillElement)
}

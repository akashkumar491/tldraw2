import { Vec2d, VecLike } from '@tldraw/primitives'
import { TLGeoShape } from '@tldraw/tlschema'
import * as React from 'react'
import { ShapeFill, getShapeFillSvg, getSvgWithShapeFill } from '../../shared/ShapeFill'
import { TLExportColors } from '../../shared/TLExportColors'
import { getPerfectDashProps } from '../../shared/getPerfectDashProps'

export const DashStylePolygon = React.memo(function DashStylePolygon({
	dash,
	fill,
	color,
	strokeWidth,
	outline,
	lines,
}: Pick<TLGeoShape['props'], 'dash' | 'fill' | 'color'> & {
	strokeWidth: number
	outline: VecLike[]
	lines?: VecLike[][]
}) {
	const innerPath = 'M' + outline[0] + 'L' + outline.slice(1) + 'Z'

	return (
		<>
			<ShapeFill d={innerPath} fill={fill} color={color} />
			{lines &&
				lines.map((l, i) => (
					<path
						key={`line_bg_${i}`}
						className={'tl-hitarea-stroke'}
						fill="none"
						d={`M${l[0].x},${l[0].y}L${l[1].x},${l[1].y}`}
					/>
				))}
			<g
				strokeWidth={strokeWidth}
				stroke={`var(--palette-${color})`}
				fill="none"
				pointerEvents="all"
			>
				{Array.from(Array(outline.length)).map((_, i) => {
					const A = outline[i]
					const B = outline[(i + 1) % outline.length]

					const dist = Vec2d.Dist(A, B)

					const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(dist, strokeWidth, {
						style: dash,
						start: 'outset',
						end: 'outset',
					})

					return (
						<line
							key={i}
							x1={A.x}
							y1={A.y}
							x2={B.x}
							y2={B.y}
							strokeDasharray={strokeDasharray}
							strokeDashoffset={strokeDashoffset}
						/>
					)
				})}
				{lines &&
					lines.map(([A, B], i) => {
						const dist = Vec2d.Dist(A, B)

						const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(dist, strokeWidth, {
							style: dash,
							start: 'skip',
							end: 'outset',
							snap: dash === 'dotted' ? 4 : undefined,
						})

						return (
							<path
								key={`line_fg_${i}`}
								d={`M${A.x},${A.y}L${B.x},${B.y}`}
								stroke={`var(--palette-${color})`}
								strokeWidth={strokeWidth}
								fill="none"
								strokeDasharray={strokeDasharray}
								strokeDashoffset={strokeDashoffset}
							/>
						)
					})}
			</g>
		</>
	)
})

export function DashStylePolygonSvg({
	dash,
	fill,
	color,
	colors,
	strokeWidth,
	outline,
	lines,
}: Pick<TLGeoShape['props'], 'dash' | 'fill' | 'color'> & {
	outline: VecLike[]
	strokeWidth: number
	colors: TLExportColors
	lines?: VecLike[][]
}) {
	const strokeElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
	strokeElement.setAttribute('stroke-width', strokeWidth.toString())
	strokeElement.setAttribute('stroke', colors.fill[color])
	strokeElement.setAttribute('fill', 'none')

	Array.from(Array(outline.length)).forEach((_, i) => {
		const A = outline[i]
		const B = outline[(i + 1) % outline.length]

		const dist = Vec2d.Dist(A, B)
		const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(dist, strokeWidth, {
			style: dash,
		})

		const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
		line.setAttribute('x1', A.x.toString())
		line.setAttribute('y1', A.y.toString())
		line.setAttribute('x2', B.x.toString())
		line.setAttribute('y2', B.y.toString())
		line.setAttribute('stroke-dasharray', strokeDasharray.toString())
		line.setAttribute('stroke-dashoffset', strokeDashoffset.toString())

		strokeElement.appendChild(line)
	})

	if (lines) {
		for (const [A, B] of lines) {
			const dist = Vec2d.Dist(A, B)
			const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(dist, strokeWidth, {
				style: dash,
				start: 'skip',
				end: 'skip',
				snap: dash === 'dotted' ? 4 : 2,
			})

			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
			line.setAttribute('x1', A.x.toString())
			line.setAttribute('y1', A.y.toString())
			line.setAttribute('x2', B.x.toString())
			line.setAttribute('y2', B.y.toString())
			line.setAttribute('stroke-dasharray', strokeDasharray.toString())
			line.setAttribute('stroke-dashoffset', strokeDashoffset.toString())

			strokeElement.appendChild(line)
		}
	}

	// Get the fill element, if any
	const fillElement = getShapeFillSvg({
		d: 'M' + outline[0] + 'L' + outline.slice(1) + 'Z',
		fill,
		color,
		colors,
	})

	return getSvgWithShapeFill(strokeElement, fillElement)
}

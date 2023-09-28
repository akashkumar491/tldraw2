import { TLArrowShape } from '@tldraw/tlschema'
import { Box2d } from '../../../../primitives/Box2d'
import { Matrix2d } from '../../../../primitives/Matrix2d'
import { Vec2d, VecLike } from '../../../../primitives/Vec2d'
import { intersectCirclePolygon, intersectCirclePolyline } from '../../../../primitives/intersect'
import {
	PI,
	PI2,
	getArcLength,
	getPointOnCircle,
	isSafeFloat,
	lerpAngles,
	shortAngleDist,
	toPrecision,
} from '../../../../primitives/utils'
import type { Editor } from '../../../Editor'
import { TLArcInfo, TLArrowInfo } from './arrow-types'
import {
	BOUND_ARROW_OFFSET,
	MIN_ARROW_LENGTH,
	STROKE_SIZES,
	WAY_TOO_BIG_ARROW_BEND_FACTOR,
	getArrowTerminalsInArrowSpace,
	getBoundShapeInfoForTerminal,
} from './shared'
import { getStraightArrowInfo } from './straight-arrow'

export function getCurvedArrowInfo(
	editor: Editor,
	shape: TLArrowShape,
	extraBend = 0
): TLArrowInfo {
	const { arrowheadEnd, arrowheadStart } = shape.props
	const bend = shape.props.bend + extraBend

	if (Math.abs(bend) > Math.abs(shape.props.bend * WAY_TOO_BIG_ARROW_BEND_FACTOR)) {
		return getStraightArrowInfo(editor, shape)
	}

	const terminalsInArrowSpace = getArrowTerminalsInArrowSpace(editor, shape)

	const med = Vec2d.Med(terminalsInArrowSpace.start, terminalsInArrowSpace.end) // point between start and end
	const u = Vec2d.Sub(terminalsInArrowSpace.end, terminalsInArrowSpace.start).uni() // unit vector between start and end
	const middle = Vec2d.Add(med, u.per().mul(-bend)) // middle handle

	const startShapeInfo = getBoundShapeInfoForTerminal(editor, shape.props.start)
	const endShapeInfo = getBoundShapeInfoForTerminal(editor, shape.props.end)

	// The positions of the body of the arrow, which may be different
	// than the arrow's start / end points if the arrow is bound to shapes
	const a = terminalsInArrowSpace.start.clone()
	const b = terminalsInArrowSpace.end.clone()
	const c = middle.clone()

	const handleArc = getArcInfo(a, b, c)

	if (
		handleArc.length === 0 ||
		handleArc.size === 0 ||
		!isSafeFloat(handleArc.length) ||
		!isSafeFloat(handleArc.size)
	) {
		return getStraightArrowInfo(editor, shape)
	}

	const tempA = a.clone()
	const tempB = b.clone()
	const tempC = c.clone()

	const arrowPageTransform = editor.getShapePageTransform(shape)!

	if (startShapeInfo && !startShapeInfo.isExact) {
		// Points in page space
		const startInPageSpace = Matrix2d.applyToPoint(arrowPageTransform, tempA)
		const endInPageSpace = Matrix2d.applyToPoint(arrowPageTransform, tempB)
		const centerInPageSpace = Matrix2d.applyToPoint(arrowPageTransform, handleArc.center)

		// Points in local space of the start shape
		const inverseTransform = Matrix2d.Inverse(startShapeInfo.transform)
		const startInStartShapeLocalSpace = Matrix2d.applyToPoint(inverseTransform, startInPageSpace)
		const endInStartShapeLocalSpace = Matrix2d.applyToPoint(inverseTransform, endInPageSpace)
		const centerInStartShapeLocalSpace = Matrix2d.applyToPoint(inverseTransform, centerInPageSpace)

		const { isClosed } = startShapeInfo
		const fn = isClosed ? intersectCirclePolygon : intersectCirclePolyline

		let point: VecLike | undefined

		let intersections = fn(
			centerInStartShapeLocalSpace,
			handleArc.radius,
			editor.getShapeGeometry(startShapeInfo.shape).vertices
		)

		if (intersections) {
			// Filter out any intersections that aren't in the arc
			intersections = intersections.filter(
				(pt) =>
					+Vec2d.Clockwise(startInStartShapeLocalSpace, pt, endInStartShapeLocalSpace) ===
					handleArc.sweepFlag
			)

			const comparisonAngle = lerpAngles(
				Vec2d.Angle(handleArc.center, tempA),
				Vec2d.Angle(handleArc.center, tempC),
				0.5
			)

			intersections.sort(
				(p0, p1) =>
					Math.abs(shortAngleDist(comparisonAngle, centerInStartShapeLocalSpace.angle(p0))) -
					Math.abs(shortAngleDist(comparisonAngle, centerInStartShapeLocalSpace.angle(p1)))
			)

			point = intersections[0] ?? (isClosed ? undefined : startInStartShapeLocalSpace)
		} else {
			point = isClosed ? undefined : startInStartShapeLocalSpace
		}

		if (point) {
			tempA.setTo(
				editor.getPointInShapeSpace(shape, Matrix2d.applyToPoint(startShapeInfo.transform, point))
			)

			startShapeInfo.didIntersect = true

			if (arrowheadStart !== 'none') {
				const offset =
					(BOUND_ARROW_OFFSET +
						STROKE_SIZES[shape.props.size] / 2 +
						('size' in startShapeInfo.shape.props
							? STROKE_SIZES[startShapeInfo.shape.props.size] / 2
							: 0)) *
					(handleArc.sweepFlag ? 1 : -1)

				tempA.setTo(
					getPointOnCircle(
						handleArc.center.x,
						handleArc.center.y,
						handleArc.radius,
						lerpAngles(
							Vec2d.Angle(handleArc.center, tempA),
							Vec2d.Angle(handleArc.center, tempC),
							offset / getArcLength(handleArc.center, handleArc.radius, tempA, tempC)
						)
					)
				)
			}
		}
	}

	if (endShapeInfo && !endShapeInfo.isExact) {
		// get points in shape's coordinates?
		const startInPageSpace = Matrix2d.applyToPoint(arrowPageTransform, tempA)
		const endInPageSpace = Matrix2d.applyToPoint(arrowPageTransform, tempB)
		const centerInPageSpace = Matrix2d.applyToPoint(arrowPageTransform, handleArc.center)

		const inverseTransform = Matrix2d.Inverse(endShapeInfo.transform)

		const startInEndShapeLocalSpace = Matrix2d.applyToPoint(inverseTransform, startInPageSpace)
		const endInEndShapeLocalSpace = Matrix2d.applyToPoint(inverseTransform, endInPageSpace)
		const centerInEndShapeLocalSpace = Matrix2d.applyToPoint(inverseTransform, centerInPageSpace)

		const isClosed = endShapeInfo.isClosed
		const fn = isClosed ? intersectCirclePolygon : intersectCirclePolyline

		const angleToMiddle = Vec2d.Angle(handleArc.center, middle)
		const angleToEnd = Vec2d.Angle(handleArc.center, terminalsInArrowSpace.end)
		const comparisonAngle = lerpAngles(angleToMiddle, angleToEnd, 0.5)

		let point: VecLike | undefined

		let intersections = fn(
			centerInEndShapeLocalSpace,
			handleArc.radius,
			editor.getShapeGeometry(endShapeInfo.shape).vertices
		)

		if (intersections) {
			intersections = intersections.filter(
				(pt) =>
					+Vec2d.Clockwise(startInEndShapeLocalSpace, pt, endInEndShapeLocalSpace) ===
					handleArc.sweepFlag
			)

			intersections.sort(
				(p0, p1) =>
					Math.abs(shortAngleDist(comparisonAngle, centerInEndShapeLocalSpace.angle(p0))) -
					Math.abs(shortAngleDist(comparisonAngle, centerInEndShapeLocalSpace.angle(p1)))
			)

			point = intersections[0] ?? (isClosed ? undefined : endInEndShapeLocalSpace)
		} else {
			point = isClosed ? undefined : endInEndShapeLocalSpace
		}

		if (point) {
			// Set b to target local point -> page point -> shape local point
			tempB.setTo(
				editor.getPointInShapeSpace(shape, Matrix2d.applyToPoint(endShapeInfo.transform, point))
			)

			endShapeInfo.didIntersect = true

			if (arrowheadEnd !== 'none') {
				const offset =
					(BOUND_ARROW_OFFSET +
						STROKE_SIZES[shape.props.size] / 2 +
						('size' in endShapeInfo.shape.props
							? STROKE_SIZES[endShapeInfo.shape.props.size] / 2
							: 0)) *
					(handleArc.sweepFlag ? -1 : 1)

				tempB.setTo(
					getPointOnCircle(
						handleArc.center.x,
						handleArc.center.y,
						handleArc.radius,
						lerpAngles(
							Vec2d.Angle(handleArc.center, tempB),
							Vec2d.Angle(handleArc.center, tempC),
							offset / getArcLength(handleArc.center, handleArc.radius, tempB, tempC)
						)
					)
				)
			}
		}
	}

	if (
		startShapeInfo &&
		endShapeInfo &&
		startShapeInfo.shape !== endShapeInfo.shape &&
		!startShapeInfo.isExact &&
		!endShapeInfo.isExact
	) {
		// If we missed an intersection, then try
		const startAngle = Vec2d.Angle(handleArc.center, tempA)
		const endAngle = Vec2d.Angle(handleArc.center, tempB)
		const length = Math.abs(getArcLength(handleArc.center, handleArc.radius, tempA, tempB))

		if (startShapeInfo && !startShapeInfo.didIntersect) {
			tempA.setTo(
				getPointOnCircle(
					handleArc.center.x,
					handleArc.center.y,
					handleArc.radius,
					lerpAngles(startAngle, endAngle, MIN_ARROW_LENGTH / length)
				)
			)
		}

		if (endShapeInfo && !endShapeInfo.didIntersect) {
			tempB.setTo(
				getPointOnCircle(
					handleArc.center.x,
					handleArc.center.y,
					handleArc.radius,
					lerpAngles(endAngle, startAngle, MIN_ARROW_LENGTH / length)
				)
			)
		}
	}

	let dist = shortAngleDist(
		Vec2d.Angle(handleArc.center, tempA),
		Vec2d.Angle(handleArc.center, tempB)
	)
	if (handleArc.largeArcFlag) dist = PI2 - dist
	const length = dist * handleArc.radius
	const tinyLittleArrow = Math.abs(length) < MIN_ARROW_LENGTH

	if (tinyLittleArrow) {
		// If the length is too short, then place the start handle offset behind the end handle.
		tempB.setTo(
			getPointOnCircle(
				handleArc.center.x,
				handleArc.center.y,
				handleArc.radius,
				lerpAngles(
					Vec2d.Angle(handleArc.center, tempA),
					Vec2d.Angle(handleArc.center, tempB),
					MIN_ARROW_LENGTH / length
				)
			)
		)
	}

	let midAngle = lerpAngles(
		Vec2d.Angle(handleArc.center, tempA),
		Vec2d.Angle(handleArc.center, tempB),
		0.5
	)

	let midPoint = getPointOnCircle(
		handleArc.center.x,
		handleArc.center.y,
		handleArc.radius,
		midAngle
	)

	if (+Vec2d.Clockwise(tempA, midPoint, tempB) !== handleArc.sweepFlag) {
		midAngle += PI
		midPoint = getPointOnCircle(handleArc.center.x, handleArc.center.y, handleArc.radius, midAngle)
	}

	tempC.setTo(midPoint)

	// Uh oh, a flip has occurred!
	if (
		!tinyLittleArrow &&
		Math.abs(toPrecision(getArcInfo(tempA, tempB, midPoint).length)) >
			Math.abs(toPrecision(handleArc.length))
	) {
		tempB.setTo(
			getPointOnCircle(
				handleArc.center.x,
				handleArc.center.y,
				handleArc.radius,
				lerpAngles(Vec2d.Angle(handleArc.center, tempA), Vec2d.Angle(handleArc.center, b), 0.5)
			)
		)
		tempC.setTo(
			getPointOnCircle(
				handleArc.center.x,
				handleArc.center.y,
				handleArc.radius,
				lerpAngles(Vec2d.Angle(handleArc.center, tempA), Vec2d.Angle(handleArc.center, tempB), 0.5)
			)
		)
	}

	a.setTo(tempA)
	b.setTo(tempB)
	c.setTo(tempC)
	const bodyArc = getArcInfo(a, b, c)

	return {
		isStraight: false,
		start: {
			point: a,
			handle: terminalsInArrowSpace.start,
			arrowhead: shape.props.arrowheadStart,
		},
		end: {
			point: b,
			handle: terminalsInArrowSpace.end,
			arrowhead: shape.props.arrowheadEnd,
		},
		middle: c,
		handleArc,
		bodyArc,
		isValid: bodyArc.length !== 0 && isFinite(bodyArc.center.x) && isFinite(bodyArc.center.y),
	}
}

/**
 * Get a solid path for a curved arrow's handles.
 *
 * @param info - The arrow info.
 * @public
 */
export function getCurvedArrowHandlePath(info: TLArrowInfo & { isStraight: false }) {
	const {
		start,
		end,
		handleArc: { radius, largeArcFlag, sweepFlag },
	} = info
	return `M${start.handle.x},${start.handle.y} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.handle.x},${end.handle.y}`
}

/**
 * Get a solid path for a curved arrow's body.
 *
 * @param info - The arrow info.
 * @public
 */
export function getSolidCurvedArrowPath(info: TLArrowInfo & { isStraight: false }) {
	const {
		start,
		end,
		bodyArc: { radius, largeArcFlag, sweepFlag },
	} = info
	return `M${start.point.x},${start.point.y} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.point.x},${end.point.y}`
}

/**
 * Get a point along an arc.
 *
 * @param center - The arc's center.
 * @param radius - The arc's radius.
 * @param startAngle - The start point of the arc.
 * @param size - The size of the arc.
 * @param t - The point along the arc to get.
 */
export function getPointOnArc(
	center: VecLike,
	radius: number,
	startAngle: number,
	size: number,
	t: number
) {
	const angle = startAngle + size * t
	return new Vec2d(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle))
}

/**
 * Get a bounding box for an arc.
 *
 * @param center - The arc's center.
 * @param radius - The arc's radius.
 * @param start - The start point of the arc.
 * @param size - The size of the arc.
 */
export function getArcBoundingBox(center: VecLike, radius: number, start: VecLike, size: number) {
	let minX = Infinity
	let minY = Infinity
	let maxX = -Infinity
	let maxY = -Infinity

	const startAngle = Vec2d.Angle(center, start)

	// Test 20 points along the arc
	for (let i = 0; i < 20; i++) {
		const angle = startAngle + size * (i / 19)
		const x = center.x + radius * Math.cos(angle)
		const y = center.y + radius * Math.sin(angle)

		minX = Math.min(x, minX)
		minY = Math.min(y, minY)
		maxX = Math.max(x, maxX)
		maxY = Math.max(y, maxY)
	}

	return new Box2d(minX, minY, maxX - minX, maxY - minY)
}

/**
 * Get info about an arc formed by three points.
 *
 * @param a - The start of the arc
 * @param b - The end of the arc
 * @param c - A point on the arc
 */
export function getArcInfo(a: VecLike, b: VecLike, c: VecLike): TLArcInfo {
	// find a circle from the three points
	const u = -2 * (a.x * (b.y - c.y) - a.y * (b.x - c.x) + b.x * c.y - c.x * b.y)

	const center = {
		x:
			((a.x * a.x + a.y * a.y) * (c.y - b.y) +
				(b.x * b.x + b.y * b.y) * (a.y - c.y) +
				(c.x * c.x + c.y * c.y) * (b.y - a.y)) /
			u,
		y:
			((a.x * a.x + a.y * a.y) * (b.x - c.x) +
				(b.x * b.x + b.y * b.y) * (c.x - a.x) +
				(c.x * c.x + c.y * c.y) * (a.x - b.x)) /
			u,
	}

	const radius = Vec2d.Dist(center, a)

	// Whether to draw the arc clockwise or counter-clockwise (are the points clockwise?)
	const sweepFlag = +Vec2d.Clockwise(a, c, b)

	// The base angle of the arc in radians
	const ab = Math.hypot(a.y - b.y, a.x - b.x)
	const bc = Math.hypot(b.y - c.y, b.x - c.x)
	const ca = Math.hypot(c.y - a.y, c.x - a.x)

	const theta = Math.acos((bc * bc + ca * ca - ab * ab) / (2 * bc * ca)) * 2

	// Whether to draw the long arc or short arc
	const largeArcFlag = +(PI > theta)

	// The size of the arc to draw in radians
	const size = (PI2 - theta) * (sweepFlag ? 1 : -1)

	// The length of the arc to draw in distance units
	const length = size * radius

	return {
		center,
		radius,
		size,
		length,
		largeArcFlag,
		sweepFlag,
	}
}

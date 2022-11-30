import { SVGContainer, TLBounds, Utils } from '@tldraw/core'
import {
  intersectBoundsBounds,
  intersectBoundsPolyline,
  intersectLineSegmentBounds,
  intersectLineSegmentLineSegment,
} from '@tldraw/intersect'
import { Vec } from '@tldraw/vec'
import * as React from 'react'
import { GHOSTED_OPACITY } from '~constants'
import { TDShapeUtil } from '~state/shapes/TDShapeUtil'
import { defaultStyle, getShapeStyle } from '~state/shapes/shared'
import { DashStyle, HighlightShape, TDMeta, TDShapeType, TransformInfo } from '~types'
import { getDrawStrokePathTDSnapshot, getSolidStrokePathTDSnapshot } from './highlightHelpers'

type T = HighlightShape
type E = SVGSVGElement

export class HighlightUtil extends TDShapeUtil<T, E> {
  type = TDShapeType.Highlight as const

  pointsBoundsCache = new WeakMap<T['points'], TLBounds>([])

  shapeBoundsCache = new Map<string, TLBounds>()

  rotatedCache = new WeakMap<T, number[][]>([])

  pointCache: Record<string, number[]> = {}

  canClone = true

  getShape = (props: Partial<T>): T => {
    return Utils.deepMerge<T>(
      {
        id: 'id',
        type: TDShapeType.Highlight,
        name: 'Highlight',
        parentId: 'page',
        childIndex: 1,
        point: [0, 0],
        rotation: 0,
        style: defaultStyle,
        points: [],
        isComplete: false,
      },
      props
    )
  }

  Component = TDShapeUtil.Component<T, E, TDMeta>(({ shape, meta, isGhost, events }, ref) => {
    const { points, style, isComplete } = shape

    const pathTDSnapshot = React.useMemo(() => {
      return style.dash === DashStyle.Draw
        ? getDrawStrokePathTDSnapshot(shape)
        : getSolidStrokePathTDSnapshot(shape)
    }, [points, style.size, style.dash, isComplete])

    const styles = getShapeStyle(style, meta.isDarkMode)
    const { stroke, strokeWidth, opacity: highlightOpacity } = styles

    // For very short lines, draw a point instead of a line
    const bounds = this.getBounds(shape)

    const verySmall = bounds.width <= strokeWidth / 2 && bounds.height <= strokeWidth / 2

    if (verySmall) {
      return (
        <SVGContainer ref={ref} id={shape.id + '_svg'} {...events}>
          <g opacity={isGhost ? GHOSTED_OPACITY : 1}>
            <circle
              r={strokeWidth * 2}
              fill={stroke}
              stroke={stroke}
              pointerEvents="all"
              opacity={highlightOpacity}
            />
          </g>
        </SVGContainer>
      )
    }

    if (shape.style.dash === DashStyle.Draw) {
      return (
        <SVGContainer ref={ref} id={shape.id + '_svg'} {...events}>
          <g opacity={isGhost ? GHOSTED_OPACITY : 1}>
            <path className={'tl-stroke-hitarea'} d={pathTDSnapshot} />
            <path
              d={pathTDSnapshot}
              fill={stroke}
              stroke={stroke}
              opacity={highlightOpacity}
              strokeWidth={strokeWidth * 3}
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="none"
            />
          </g>
        </SVGContainer>
      )
    }

    return (
      <SVGContainer ref={ref} id={shape.id + '_svg'} {...events}>
        <g opacity={isGhost ? GHOSTED_OPACITY : 1}>
          <path className="tl-stroke-hitarea" d={pathTDSnapshot} />
          <path
            d={pathTDSnapshot}
            fill="none"
            stroke="red"
            strokeWidth={Math.min(4, strokeWidth * 2)}
            strokeLinejoin="round"
            strokeLinecap="round"
            pointerEvents="none"
          />
          <path
            d={pathTDSnapshot}
            fill="none"
            stroke={stroke}
            opacity={highlightOpacity}
            strokeWidth={strokeWidth * 4}
            strokeLinejoin="round"
            strokeLinecap="round"
            pointerEvents="none"
          />
        </g>
      </SVGContainer>
    )
  })

  Indicator = TDShapeUtil.Indicator<T>(({ shape }) => {
    const { points } = shape

    const pathTDSnapshot = React.useMemo(() => {
      return getSolidStrokePathTDSnapshot(shape)
    }, [points])

    const bounds = this.getBounds(shape)

    const verySmall = bounds.width < 4 && bounds.height < 4

    if (verySmall) {
      return <circle x={bounds.width / 2} y={bounds.height / 2} r={1} />
    }

    return <path d={pathTDSnapshot} />
  })

  transform = (
    shape: T,
    bounds: TLBounds,
    { initialShape, scaleX, scaleY }: TransformInfo<T>
  ): Partial<T> => {
    const initialShapeBounds = Utils.getFromCache(this.boundsCache, initialShape, () =>
      Utils.getBoundsFromPoints(initialShape.points)
    )

    const points = initialShape.points.map(([x, y, r]) => {
      return [
        bounds.width *
          (scaleX < 0 // * sin?
            ? 1 - x / initialShapeBounds.width
            : x / initialShapeBounds.width),
        bounds.height *
          (scaleY < 0 // * cos?
            ? 1 - y / initialShapeBounds.height
            : y / initialShapeBounds.height),
        r,
      ]
    })

    const newBounds = Utils.getBoundsFromPoints(shape.points)

    const point = Vec.sub([bounds.minX, bounds.minY], [newBounds.minX, newBounds.minY])

    return {
      points,
      point,
    }
  }

  getBounds = (shape: T) => {
    // The goal here is to avoid recalculating the bounds from the
    // points array, which is expensive. However, we still need a
    // new bounds if the point has changed, but we will reuse the
    // previous bounds-from-points result if we can.

    const pointsHaveChanged = !this.pointsBoundsCache.has(shape.points)
    const pointHasChanged = !(this.pointCache[shape.id] === shape.point)

    if (pointsHaveChanged) {
      // If the points have changed, then bust the points cache
      const bounds = Utils.getBoundsFromPoints(shape.points)
      this.pointsBoundsCache.set(shape.points, bounds)
      this.shapeBoundsCache.set(shape.id, Utils.translateBounds(bounds, shape.point))
      this.pointCache[shape.id] = shape.point
    } else if (pointHasChanged && !pointsHaveChanged) {
      // If the point have has changed, then bust the point cache
      this.pointCache[shape.id] = shape.point
      this.shapeBoundsCache.set(
        shape.id,
        Utils.translateBounds(this.pointsBoundsCache.get(shape.points)!, shape.point)
      )
    }

    return this.shapeBoundsCache.get(shape.id)!
  }

  shouldRender = (prev: T, next: T) => {
    return (
      next.points !== prev.points ||
      next.style !== prev.style ||
      next.isComplete !== prev.isComplete
    )
  }

  hitTestPoint = (shape: T, point: number[]) => {
    const ptA = Vec.sub(point, shape.point)
    return Utils.pointInPolyline(ptA, shape.points)
  }

  hitTestLineSegment = (shape: T, A: number[], B: number[]): boolean => {
    const { points, point } = shape
    const ptA = Vec.sub(A, point)
    const ptB = Vec.sub(B, point)
    const bounds = this.getBounds(shape)

    if (bounds.width < 8 && bounds.height < 8) {
      return Vec.distanceToLineSegment(A, B, Utils.getBoundsCenter(bounds)) < 5 // divide by zoom
    }

    if (intersectLineSegmentBounds(ptA, ptB, bounds)) {
      for (let i = 1; i < points.length; i++) {
        if (intersectLineSegmentLineSegment(points[i - 1], points[i], ptA, ptB).didIntersect) {
          return true
        }
      }
    }

    return false
  }

  hitTestBounds = (shape: T, bounds: TLBounds) => {
    // Test axis-aligned shape
    if (!shape.rotation) {
      const shapeBounds = this.getBounds(shape)

      return (
        Utils.boundsContain(bounds, shapeBounds) ||
        ((Utils.boundsContain(shapeBounds, bounds) ||
          intersectBoundsBounds(shapeBounds, bounds).length > 0) &&
          intersectBoundsPolyline(Utils.translateBounds(bounds, Vec.neg(shape.point)), shape.points)
            .length > 0)
      )
    }

    // Test rotated shape
    const rBounds = this.getRotatedBounds(shape)

    const rotatedBounds = Utils.getFromCache(this.rotatedCache, shape, () => {
      const c = Utils.getBoundsCenter(Utils.getBoundsFromPoints(shape.points))
      return shape.points.map((pt) => Vec.rotWith(pt, c, shape.rotation || 0))
    })

    return (
      Utils.boundsContain(bounds, rBounds) ||
      intersectBoundsPolyline(Utils.translateBounds(bounds, Vec.neg(shape.point)), rotatedBounds)
        .length > 0
    )
  }
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* refresh-reset */

import * as React from 'react'
import { TLShape, Utils, TLBounds, ShapeUtil, HTMLContainer } from '@tldraw/core'
import { appState } from './state'

// Define a custom shape

export interface LabelShape extends TLShape {
  type: 'label'
  text: string
}

// Create a "shape utility" class that interprets that shape

export const Label = new ShapeUtil<LabelShape, HTMLDivElement, { isDarkMode: boolean }>(() => ({
  type: 'label',

  defaultProps: {
    id: 'example1',
    type: 'label',
    parentId: 'page1',
    childIndex: 0,
    name: 'Example Shape',
    point: [0, 0],
    rotation: 0,
    text: 'Hello world!',
  },

  Component({ shape, events, meta, onShapeChange, isSelected }, ref) {
    const color = meta.isDarkMode ? 'white' : 'black'

    const bounds = this.getBounds(shape)

    const rInput = React.useRef<HTMLDivElement>(null)

    function updateShapeSize() {
      const elm = rInput.current!

      appState.changeShapeText(shape.id, elm.innerText)

      onShapeChange?.({
        id: shape.id,
        text: elm.innerText,
      })
    }

    React.useLayoutEffect(() => {
      const elm = rInput.current!
      elm.innerText = shape.text
      updateShapeSize()
      const observer = new MutationObserver(updateShapeSize)

      observer.observe(elm, {
        attributes: true,
        characterData: true,
        subtree: true,
      })
    }, [])

    return (
      <HTMLContainer>
        <div
          {...events}
          style={{
            width: bounds.width,
            height: bounds.height,
            pointerEvents: 'all',
            display: 'flex',
            fontSize: 20,
            fontFamily: 'sans-serif',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${color}`,
            color,
          }}
        >
          <div ref={ref} onPointerDown={(e) => isSelected && e.stopPropagation()}>
            <div
              ref={rInput}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textAlign: 'center',
                outline: 'none',
                userSelect: isSelected ? 'all' : 'none',
              }}
              contentEditable={isSelected}
            />
          </div>
        </div>
      </HTMLContainer>
    )
  },
  Indicator({ shape }) {
    const bounds = this?.getBounds(shape)

    return (
      <rect
        fill="none"
        stroke="blue"
        strokeWidth={1}
        width={bounds.width}
        height={bounds.height}
        pointerEvents="none"
      />
    )
  },
  getBounds(shape) {
    const bounds = Utils.getFromCache(this.boundsCache, shape, () => {
      const ref = this.getRef(shape)
      const width = ref.current?.offsetWidth || 0
      const height = ref.current?.offsetHeight || 0

      return {
        minX: 0,
        maxX: width,
        minY: 0,
        maxY: height,
        width,
        height,
      } as TLBounds
    })

    return Utils.translateBounds(bounds, shape.point)
  },
}))

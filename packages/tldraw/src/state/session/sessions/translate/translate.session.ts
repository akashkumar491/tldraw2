/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TLPageState, Utils, TLBounds, TLSnapLine } from '@tldraw/core'
import { Vec } from '@tldraw/vec'
import {
  TLDrawShape,
  TLDrawBinding,
  Session,
  Data,
  TLDrawCommand,
  TLDrawStatus,
  ArrowShape,
  GroupShape,
  SessionType,
  ArrowBinding,
} from '~types'
import { TLDR } from '~state/tldr'
import type { Patch } from 'rko'

interface BoundsWithCenter extends TLBounds {
  midX: number
  midY: number
}

type CloneInfo =
  | {
      state: 'empty'
    }
  | {
      state: 'ready'
      clones: TLDrawShape[]
      clonedBindings: ArrowBinding[]
    }

type SnapInfo =
  | {
      state: 'empty'
    }
  | {
      state: 'ready'
      bounds: BoundsWithCenter[]
    }

export class TranslateSession implements Session {
  type = SessionType.Translate
  status = TLDrawStatus.Translating
  delta = [0, 0]
  prev = [0, 0]
  prevPoint = [0, 0]
  speed = 1
  origin: number[]
  snapshot: TranslateSnapshot
  isCloning = false
  isCreate: boolean
  cloneInfo: CloneInfo = {
    state: 'empty',
  }
  snapInfo: SnapInfo = {
    state: 'empty',
  }
  snapLines: TLSnapLine[] = []

  constructor(data: Data, point: number[], isCreate = false) {
    this.origin = point
    this.snapshot = getTranslateSnapshot(data)
    this.isCreate = isCreate
  }

  start = (data: Data) => {
    const { bindingsToDelete } = this.snapshot

    this.createSnapInfo(data)

    if (bindingsToDelete.length === 0) return data

    const nextBindings: Patch<Record<string, TLDrawBinding>> = {}

    bindingsToDelete.forEach((binding) => (nextBindings[binding.id] = undefined))

    return {
      document: {
        pages: {
          [data.appState.currentPageId]: {
            bindings: nextBindings,
          },
        },
      },
    }
  }

  update = (data: Data, point: number[], shiftKey: boolean, altKey: boolean, metaKey: boolean) => {
    const { selectedIds, initialParentChildren, initialShapes, bindingsToDelete } = this.snapshot

    const { currentPageId } = data.appState

    const nextBindings: Patch<Record<string, TLDrawBinding>> = {}

    const nextShapes: Patch<Record<string, TLDrawShape>> = {}

    const nextPageState: Patch<TLPageState> = {}

    let delta = Vec.sub(point, this.origin)

    if (shiftKey) {
      if (Math.abs(delta[0]) < Math.abs(delta[1])) {
        delta[0] = 0
      } else {
        delta[1] = 0
      }
    }

    const speed = Vec.dist(point, this.prevPoint)

    this.prevPoint = point

    this.speed = this.speed + (speed - this.speed) / 2

    this.snapLines = []

    if (!metaKey && this.speed < 4 && this.snapInfo.state === 'ready') {
      const snappedDelta = this.findSnapPoints(delta)

      if (snappedDelta) {
        delta = snappedDelta
      }
    }

    const trueDelta = Vec.sub(delta, this.prev)

    this.prev = delta

    // If cloning...
    if (!this.isCreate && altKey) {
      // Not Cloning -> Cloning
      if (!this.isCloning) {
        if (this.cloneInfo.state === 'empty') {
          this.createCloneInfo(data)
        }

        if (this.cloneInfo.state === 'empty') throw Error

        const { clones, clonedBindings } = this.cloneInfo

        this.isCloning = true

        // Put back any bindings we deleted
        bindingsToDelete.forEach((binding) => (nextBindings[binding.id] = binding))

        // Move original shapes back to start
        initialShapes.forEach((shape) => (nextShapes[shape.id] = { point: shape.point }))

        // Add the clones to the page
        clones.forEach((clone) => {
          nextShapes[clone.id] = { ...clone, point: Vec.round(Vec.add(clone.point, delta)) }

          // Add clones to non-selected parents
          if (
            clone.parentId !== data.appState.currentPageId &&
            !selectedIds.includes(clone.parentId)
          ) {
            const children =
              nextShapes[clone.parentId]?.children || initialParentChildren[clone.parentId]

            if (!children.includes(clone.id)) {
              nextShapes[clone.parentId] = {
                ...nextShapes[clone.parentId],
                children: [...children, clone.id],
              }
            }
          }
        })

        // Add the cloned bindings
        for (const binding of clonedBindings) {
          nextBindings[binding.id] = binding
        }

        // Set the selected ids to the clones
        nextPageState.selectedIds = clones.map((clone) => clone.id)
      }

      if (this.cloneInfo.state === 'empty') throw Error

      const { clones } = this.cloneInfo

      // Either way, move the clones
      clones.forEach((clone) => {
        const current = (nextShapes[clone.id] ||
          TLDR.getShape(data, clone.id, data.appState.currentPageId)) as TLDrawShape

        if (!current.point) throw Error('No point on that clone!')

        nextShapes[clone.id] = {
          ...nextShapes[clone.id],
          point: Vec.round(Vec.add(current.point, trueDelta)),
        }
      })
    } else {
      // If not cloning...

      // Cloning -> Not Cloning
      if (this.isCloning) {
        if (this.cloneInfo.state === 'empty') throw Error

        const { clones, clonedBindings } = this.cloneInfo

        this.isCloning = false

        // Delete the bindings

        bindingsToDelete.forEach((binding) => (nextBindings[binding.id] = undefined))

        // Delete the clones
        clones.forEach((clone) => {
          nextShapes[clone.id] = undefined
          if (clone.parentId !== currentPageId) {
            nextShapes[clone.parentId] = {
              ...nextShapes[clone.parentId],
              children: initialParentChildren[clone.parentId],
            }
          }
        })

        // Move the original shapes back to the cursor position
        initialShapes.forEach((shape) => {
          nextShapes[shape.id] = {
            point: Vec.round(Vec.add(shape.point, delta)),
          }
        })

        // Delete the cloned bindings
        for (const binding of clonedBindings) {
          nextBindings[binding.id] = undefined
        }

        // Set selected ids
        nextPageState.selectedIds = initialShapes.map((shape) => shape.id)
      }

      // Move the shapes by the delta
      initialShapes.forEach((shape) => {
        const current = (nextShapes[shape.id] ||
          TLDR.getShape(data, shape.id, data.appState.currentPageId)) as TLDrawShape

        if (!current.point) throw Error('No point on that clone!')

        nextShapes[shape.id] = {
          ...nextShapes[shape.id],
          point: Vec.round(Vec.add(current.point, trueDelta)),
        }
      })
    }

    return {
      appState: {
        snapLines: this.snapLines,
      },
      document: {
        pages: {
          [data.appState.currentPageId]: {
            shapes: nextShapes,
            bindings: nextBindings,
          },
        },
        pageStates: {
          [data.appState.currentPageId]: nextPageState,
        },
      },
    }
  }

  cancel = (data: Data) => {
    const { initialShapes, bindingsToDelete } = this.snapshot

    const nextBindings: Record<string, Partial<TLDrawBinding> | undefined> = {}
    const nextShapes: Record<string, Partial<TLDrawShape> | undefined> = {}
    const nextPageState: Partial<TLPageState> = {
      editingId: undefined,
      hoveredId: undefined,
    }

    // Put back any deleted bindings
    bindingsToDelete.forEach((binding) => (nextBindings[binding.id] = binding))

    if (this.isCreate) {
      initialShapes.forEach(({ id }) => (nextShapes[id] = undefined))
      nextPageState.selectedIds = []
    } else {
      // Put initial shapes back to where they started
      initialShapes.forEach(({ id, point }) => (nextShapes[id] = { ...nextShapes[id], point }))
      nextPageState.selectedIds = this.snapshot.selectedIds
    }

    if (this.cloneInfo.state === 'ready') {
      const { clones, clonedBindings } = this.cloneInfo
      // Delete clones
      clones.forEach((clone) => (nextShapes[clone.id] = undefined))

      // Delete cloned bindings
      clonedBindings.forEach((binding) => (nextBindings[binding.id] = undefined))
    }

    return {
      appState: {
        snapLines: [],
      },
      document: {
        pages: {
          [data.appState.currentPageId]: {
            shapes: nextShapes,
            bindings: nextBindings,
          },
        },
        pageStates: {
          [data.appState.currentPageId]: nextPageState,
        },
      },
    }
  }

  complete(data: Data): TLDrawCommand {
    const pageId = data.appState.currentPageId

    const { initialShapes, initialParentChildren, bindingsToDelete } = this.snapshot

    const beforeBindings: Patch<Record<string, TLDrawBinding>> = {}
    const beforeShapes: Patch<Record<string, TLDrawShape>> = {}

    const afterBindings: Patch<Record<string, TLDrawBinding>> = {}
    const afterShapes: Patch<Record<string, TLDrawShape>> = {}

    if (this.isCloning) {
      if (this.cloneInfo.state === 'empty') {
        this.createCloneInfo(data)
      }

      if (this.cloneInfo.state !== 'ready') throw Error
      const { clones, clonedBindings } = this.cloneInfo

      // Update the clones
      clones.forEach((clone) => {
        beforeShapes[clone.id] = undefined

        afterShapes[clone.id] = TLDR.getShape(data, clone.id, pageId)

        if (clone.parentId !== pageId) {
          beforeShapes[clone.parentId] = {
            ...beforeShapes[clone.parentId],
            children: initialParentChildren[clone.parentId],
          }

          afterShapes[clone.parentId] = {
            ...afterShapes[clone.parentId],
            children: TLDR.getShape<GroupShape>(data, clone.parentId, pageId).children,
          }
        }
      })

      // Update the cloned bindings
      clonedBindings.forEach((binding) => {
        beforeBindings[binding.id] = undefined
        afterBindings[binding.id] = TLDR.getBinding(data, binding.id, pageId)
      })
    } else {
      // If we aren't cloning, then update the initial shapes
      initialShapes.forEach((shape) => {
        beforeShapes[shape.id] = this.isCreate
          ? undefined
          : {
              ...beforeShapes[shape.id],
              point: shape.point,
            }

        afterShapes[shape.id] = {
          ...afterShapes[shape.id],
          ...(this.isCreate
            ? TLDR.getShape(data, shape.id, pageId)
            : { point: TLDR.getShape(data, shape.id, pageId).point }),
        }
      })
    }

    // Update the deleted bindings and any associated shapes
    bindingsToDelete.forEach((binding) => {
      beforeBindings[binding.id] = binding

      for (const id of [binding.toId, binding.fromId]) {
        // Let's also look at the bound shape...
        const shape = TLDR.getShape(data, id, pageId)

        // If the bound shape has a handle that references the deleted binding, delete that reference
        if (!shape.handles) continue

        Object.values(shape.handles)
          .filter((handle) => handle.bindingId === binding.id)
          .forEach((handle) => {
            beforeShapes[id] = { ...beforeShapes[id], handles: {} }

            afterShapes[id] = { ...afterShapes[id], handles: {} }

            // There should be before and after shapes

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            beforeShapes[id]!.handles![handle.id as keyof ArrowShape['handles']] = {
              bindingId: binding.id,
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            afterShapes[id]!.handles![handle.id as keyof ArrowShape['handles']] = {
              bindingId: undefined,
            }
          })
      }
    })

    return {
      id: 'translate',
      before: {
        appState: {
          snapLines: [],
        },
        document: {
          pages: {
            [data.appState.currentPageId]: {
              shapes: beforeShapes,
              bindings: beforeBindings,
            },
          },
          pageStates: {
            [data.appState.currentPageId]: {
              selectedIds: this.isCreate ? [] : [...this.snapshot.selectedIds],
            },
          },
        },
      },
      after: {
        appState: {
          snapLines: [],
        },
        document: {
          pages: {
            [data.appState.currentPageId]: {
              shapes: afterShapes,
              bindings: afterBindings,
            },
          },
          pageStates: {
            [data.appState.currentPageId]: {
              selectedIds: [...TLDR.getSelectedIds(data, data.appState.currentPageId)],
            },
          },
        },
      },
    }
  }

  private findSnapPoints = (delta: number[]) => {
    if (this.snapInfo.state !== 'ready') return

    const bounds = Utils.translateBounds(this.snapshot.commonBounds, delta)

    const initialCenter = Utils.getBoundsCenter(bounds)

    const A: BoundsWithCenter = {
      ...bounds,
      midX: initialCenter[0],
      midY: initialCenter[1],
    }

    const offset = [0, 0]

    this.snapInfo.bounds.forEach((B) => {
      for (const x of [B.midX, B.minX, B.maxX]) {
        if (offset[0]) {
          continue
        } else if (Math.abs(A.midX - x) < 6) {
          offset[0] = A.midX - x
          this.snapLines.push({
            from: [x, A.midY],
            to: [x, A.midY > B.midY ? B.minY : B.maxY],
          })
        } else if (Math.abs(A.minX - x) < 6) {
          offset[0] = A.midX - (x + A.width / 2)
          this.snapLines.push({
            from: [x - 1, A.midY > B.midY ? A.maxY : A.minY],
            to: [x - 1, A.midY > B.midY ? B.minY : B.maxY],
          })
        } else if (Math.abs(A.maxX - x) < 6) {
          offset[0] = A.midX - (x - A.width / 2)
          this.snapLines.push({
            from: [x, A.midY > B.midY ? A.maxY : A.minY],
            to: [x, A.midY > B.midY ? B.minY : B.maxY],
          })
        }
      }

      if (offset[0]) {
        A.minX -= offset[0]
        A.midX -= offset[0]
        A.maxX -= offset[0]
      }

      for (const y of [B.midY, B.minY, B.maxY]) {
        if (offset[1]) {
          continue
        } else if (Math.abs(A.midY - y) < 6) {
          offset[1] = A.midY - y
          this.snapLines.push({
            from: [A.midX, y],
            to: [A.midX > B.midX ? B.minX : B.maxX, y],
          })
        } else if (Math.abs(A.minY - y) < 6) {
          offset[1] = A.midY - (y + A.height / 2)
          this.snapLines.push({
            from: [A.midX > B.midX ? A.maxX : A.minX, y - 1],
            to: [A.midX > B.midX ? B.minX : B.maxX, y - 1],
          })
        } else if (Math.abs(A.maxY - y) < 6) {
          offset[1] = A.midY - (y - A.height / 2)
          this.snapLines.push({
            from: [A.midX > B.midX ? A.maxX : A.minX, y],
            to: [A.midX > B.midX ? B.minX : B.maxX, y],
          })
        }

        if (offset[1]) {
          A.minY -= offset[1]
          A.midY -= offset[1]
          A.maxY -= offset[1]
        }
      }
    })

    return Vec.sub(delta, offset)
  }

  private createSnapInfo = async (data: Data) => {
    const { selectedIds } = this.snapshot
    const { currentPageId } = data.appState
    const page = data.document.pages[currentPageId]

    this.snapInfo = {
      state: 'ready',
      bounds: Object.values(page.shapes)
        .filter((shape) => !selectedIds.includes(shape.id))
        .map((shape) => {
          const bounds = TLDR.getBounds(shape)
          return {
            ...bounds,
            midX: bounds.minX + bounds.width / 2,
            midY: bounds.minY + bounds.height / 2,
          }
        }),
    }
  }

  private createCloneInfo = (data: Data) => {
    // Create clones when as they're needed.
    // Consider doing this work in a worker.

    const { currentPageId } = data.appState
    const page = data.document.pages[currentPageId]
    const { selectedIds, shapesToMove, initialParentChildren } = this.snapshot

    const cloneMap: Record<string, string> = {}
    const clonedBindingsMap: Record<string, string> = {}
    const clonedBindings: TLDrawBinding[] = []

    // Create clones of selected shapes
    const clones: TLDrawShape[] = []

    shapesToMove.forEach((shape) => {
      const newId = Utils.uniqueId()

      initialParentChildren[newId] = initialParentChildren[shape.id]

      cloneMap[shape.id] = newId

      const clone = {
        ...Utils.deepClone(shape),
        id: newId,
        parentId: shape.parentId,
        childIndex: TLDR.getChildIndexAbove(data, shape.id, currentPageId),
      }

      clones.push(clone)
    })

    clones.forEach((clone) => {
      if (clone.children !== undefined) {
        clone.children = clone.children.map((childId) => cloneMap[childId])
      }
    })

    clones.forEach((clone) => {
      if (selectedIds.includes(clone.parentId)) {
        clone.parentId = cloneMap[clone.parentId]
      }
    })

    // Potentially confusing name here: these are the ids of the
    // original shapes that were cloned, not their clones' ids.
    const clonedShapeIds = new Set(Object.keys(cloneMap))

    // Create cloned bindings for shapes where both to and from shapes are selected
    // (if the user clones, then we will create a new binding for the clones)
    Object.values(page.bindings)
      .filter((binding) => clonedShapeIds.has(binding.fromId) || clonedShapeIds.has(binding.toId))
      .forEach((binding) => {
        if (clonedShapeIds.has(binding.fromId)) {
          if (clonedShapeIds.has(binding.toId)) {
            const cloneId = Utils.uniqueId()

            const cloneBinding = {
              ...Utils.deepClone(binding),
              id: cloneId,
              fromId: cloneMap[binding.fromId] || binding.fromId,
              toId: cloneMap[binding.toId] || binding.toId,
            }

            clonedBindingsMap[binding.id] = cloneId
            clonedBindings.push(cloneBinding)
          }
        }
      })

    // Assign new binding ids to clones (or delete them!)
    clones.forEach((clone) => {
      if (clone.handles) {
        if (clone.handles) {
          for (const id in clone.handles) {
            const handle = clone.handles[id as keyof ArrowShape['handles']]
            handle.bindingId = handle.bindingId ? clonedBindingsMap[handle.bindingId] : undefined
          }
        }
      }
    })

    clones.forEach((clone) => {
      if (page.shapes[clone.id]) {
        throw Error("uh oh, we didn't clone correctly")
      }
    })

    this.cloneInfo = {
      state: 'ready',
      clones,
      clonedBindings,
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getTranslateSnapshot(data: Data) {
  const { currentPageId } = data.appState
  const selectedIds = TLDR.getSelectedIds(data, currentPageId)
  const page = TLDR.getPage(data, currentPageId)

  const selectedShapes = selectedIds.flatMap((id) => TLDR.getShape(data, id, currentPageId))

  const hasUnlockedShapes = selectedShapes.length > 0

  const shapesToMove: TLDrawShape[] = selectedShapes
    .filter((shape) => !selectedIds.includes(shape.parentId))
    .flatMap((shape) => {
      return shape.children
        ? [shape, ...shape.children!.map((childId) => TLDR.getShape(data, childId, currentPageId))]
        : [shape]
    })

  const idsToMove = new Set(shapesToMove.map((shape) => shape.id))

  const bindingsToDelete: ArrowBinding[] = []

  Object.values(page.bindings)
    .filter((binding) => idsToMove.has(binding.fromId) || idsToMove.has(binding.toId))
    .forEach((binding) => {
      if (idsToMove.has(binding.fromId)) {
        if (!idsToMove.has(binding.toId)) {
          bindingsToDelete.push(binding)
        }
      }
    })

  const initialParentChildren: Record<string, string[]> = {}

  Array.from(new Set(shapesToMove.map((s) => s.parentId)).values())
    .filter((id) => id !== page.id)
    .forEach((id) => {
      const shape = TLDR.getShape(data, id, currentPageId)
      initialParentChildren[id] = shape.children!
    })

  const commonBounds = Utils.getCommonBounds(shapesToMove.map(TLDR.getBounds))

  return {
    selectedIds,
    hasUnlockedShapes,
    initialParentChildren,
    shapesToMove,
    bindingsToDelete,
    commonBounds,
    initialShapes: shapesToMove.map(({ id, point, parentId }) => ({
      id,
      point,
      parentId,
    })),
  }
}

export type TranslateSnapshot = ReturnType<typeof getTranslateSnapshot>

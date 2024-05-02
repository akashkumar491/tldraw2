import { Computed, RESET_VALUE, computed, isUninitialized } from '@tldraw/state'
import { TLBinding, TLShapeId } from '@tldraw/tlschema'
import { objectMapValues } from '@tldraw/utils'
import { Editor } from '../Editor'

type TLBindingsIndex = Record<TLShapeId, undefined | TLBinding[]>

export const bindingsIndex = (editor: Editor): Computed<TLBindingsIndex> => {
	const { store } = editor
	const bindingsHistory = store.query.filterHistory('binding')
	const bindingsQuery = store.query.records('binding')
	function fromScratch() {
		const allBindings = bindingsQuery.get() as TLBinding[]

		const shape2Binding: TLBindingsIndex = {}

		for (const binding of allBindings) {
			const { fromId, toId } = binding
			const bindingsForFromShape = (shape2Binding[fromId] ??= [])
			bindingsForFromShape.push(binding)
			const bindingsForToShape = (shape2Binding[toId] ??= [])
			bindingsForToShape.push(binding)
		}

		return shape2Binding
	}

	return computed<TLBindingsIndex>('arrowBindingsIndex', (_lastValue, lastComputedEpoch) => {
		if (isUninitialized(_lastValue)) {
			return fromScratch()
		}

		const lastValue = _lastValue

		const diff = bindingsHistory.getDiffSince(lastComputedEpoch)

		if (diff === RESET_VALUE) {
			return fromScratch()
		}

		let nextValue: TLBindingsIndex | undefined = undefined

		function removingBinding(binding: TLBinding) {
			nextValue ??= { ...lastValue }
			nextValue[binding.fromId] = nextValue[binding.fromId]?.filter((b) => b.id !== binding.id)
			if (!nextValue[binding.fromId]?.length) {
				delete nextValue[binding.fromId]
			}
			nextValue[binding.toId] = nextValue[binding.toId]?.filter((b) => b.id !== binding.id)
			if (!nextValue[binding.toId]?.length) {
				delete nextValue[binding.toId]
			}
		}

		function ensureNewArray(shapeId: TLShapeId) {
			nextValue ??= { ...lastValue }
			if (!nextValue[shapeId]) {
				nextValue[shapeId] = []
			} else if (nextValue[shapeId] === lastValue[shapeId]) {
				nextValue[shapeId] = nextValue[shapeId]!.slice(0)
			}
		}

		function addBinding(binding: TLBinding) {
			ensureNewArray(binding.fromId)
			ensureNewArray(binding.toId)
			nextValue![binding.fromId]!.push(binding)
			nextValue![binding.toId]!.push(binding)
		}

		for (const changes of diff) {
			for (const newBinding of objectMapValues(changes.added)) {
				addBinding(newBinding)
			}

			for (const [prev, next] of objectMapValues(changes.updated)) {
				removingBinding(prev)
				addBinding(next)
			}

			for (const prev of objectMapValues(changes.removed)) {
				removingBinding(prev)
			}
		}

		// TODO: add diff entries if we need them
		return nextValue ?? lastValue
	})
}

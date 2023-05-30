import { act, render, screen } from '@testing-library/react'
import { InstanceRecordType, TLBaseShape, TLOpacityType } from '@tldraw/tlschema'
import { TldrawEditor } from '../TldrawEditor'
import { App } from '../app/App'
import { TLBoxUtil } from '../app/shapeutils/TLBoxUtil'
import { TLBoxTool } from '../app/statechart/TLBoxTool/TLBoxTool'
import { Canvas } from '../components/Canvas'
import { HTMLContainer } from '../components/HTMLContainer'
import { createTldrawEditorStore } from '../config/createTldrawEditorStore'

let originalFetch: typeof window.fetch
beforeEach(() => {
	window.fetch = jest.fn().mockImplementation((...args: Parameters<typeof fetch>) => {
		if (args[0] === '/icons/icon/icon-names.json') {
			return Promise.resolve({ json: () => Promise.resolve([]) } as Response)
		}
		return originalFetch(...args)
	})
})

afterEach(() => {
	jest.restoreAllMocks()
	window.fetch = originalFetch
})

describe('<TldrawEditor />', () => {
	it('Renders without crashing', async () => {
		await act(async () => (
			<TldrawEditor autoFocus>
				<div data-testid="canvas-1" />
			</TldrawEditor>
		))
	})

	it('Creates its own store', async () => {
		let store: any
		render(
			await act(async () => (
				<TldrawEditor onMount={(app) => (store = app.store)} autoFocus>
					<div data-testid="canvas-1" />
				</TldrawEditor>
			))
		)
		await screen.findByTestId('canvas-1')
		expect(store).toBeTruthy()
	})

	it('Renders with an external store', async () => {
		const store = createTldrawEditorStore()
		render(
			await act(async () => (
				<TldrawEditor
					store={store}
					onMount={(app) => {
						expect(app.store).toBe(store)
					}}
					autoFocus
				>
					<div data-testid="canvas-1" />
				</TldrawEditor>
			))
		)
		await screen.findByTestId('canvas-1')
	})

	it('Accepts fresh versions of store and calls `onMount` for each one', async () => {
		const initialStore = createTldrawEditorStore({
			instanceId: InstanceRecordType.createCustomId('test'),
		})
		const onMount = jest.fn()
		const rendered = render(
			<TldrawEditor store={initialStore} onMount={onMount} autoFocus>
				<div data-testid="canvas-1" />
			</TldrawEditor>
		)
		await screen.findByTestId('canvas-1')
		const initialApp = onMount.mock.lastCall[0]
		jest.spyOn(initialApp, 'dispose')
		expect(initialApp.store).toBe(initialStore)
		// re-render with the same store:
		rendered.rerender(
			<TldrawEditor store={initialStore} onMount={onMount} autoFocus>
				<div data-testid="canvas-2" />
			</TldrawEditor>
		)
		await screen.findByTestId('canvas-2')
		// not called again:
		expect(onMount).toHaveBeenCalledTimes(1)
		// re-render with a new store:
		const newStore = createTldrawEditorStore({
			instanceId: InstanceRecordType.createCustomId('test'),
		})
		rendered.rerender(
			<TldrawEditor store={newStore} onMount={onMount} autoFocus>
				<div data-testid="canvas-3" />
			</TldrawEditor>
		)
		await screen.findByTestId('canvas-3')
		expect(initialApp.dispose).toHaveBeenCalledTimes(1)
		expect(onMount).toHaveBeenCalledTimes(2)
		expect(onMount.mock.lastCall[0].store).toBe(newStore)
	})

	it('Renders the canvas and shapes', async () => {
		let app = {} as App
		render(
			await act(async () => (
				<TldrawEditor
					autoFocus
					onMount={(editorApp) => {
						app = editorApp
					}}
				>
					<Canvas />
					<div data-testid="canvas-1" />
				</TldrawEditor>
			))
		)
		await screen.findByTestId('canvas-1')

		expect(app).toBeTruthy()
		await act(async () => {
			app.updateInstanceState({ screenBounds: { x: 0, y: 0, w: 1080, h: 720 } }, true, true)
		})

		const id = app.createShapeId()

		await act(async () => {
			app.createShapes([
				{
					id,
					type: 'geo',
					props: { w: 100, h: 100 },
				},
			])
		})

		// Does the shape exist?
		expect(app.getShapeById(id)).toMatchObject({
			id,
			type: 'geo',
			x: 0,
			y: 0,
			props: { geo: 'rectangle', w: 100, h: 100, opacity: '1' },
		})

		// Is the shape's component rendering?
		expect(document.querySelectorAll('.tl-shape')).toHaveLength(1)

		expect(document.querySelectorAll('.tl-shape-indicator')).toHaveLength(0)

		// Select the shape
		await act(async () => app.select(id))

		// Is the shape's component rendering?
		expect(document.querySelectorAll('.tl-shape-indicator')).toHaveLength(1)

		// Select the eraser tool...
		await act(async () => app.setSelectedTool('eraser'))

		// Is the editor's current tool correct?
		expect(app.currentToolId).toBe('eraser')
	})
})

describe('Custom shapes', () => {
	type CardShape = TLBaseShape<
		'card',
		{
			w: number
			h: number
			opacity: TLOpacityType
		}
	>

	class CardUtil extends TLBoxUtil<CardShape> {
		static override type = 'card' as const

		override isAspectRatioLocked = (_shape: CardShape) => false
		override canResize = (_shape: CardShape) => true
		override canBind = (_shape: CardShape) => true

		override defaultProps(): CardShape['props'] {
			return {
				opacity: '1',
				w: 300,
				h: 300,
			}
		}

		render(shape: CardShape) {
			const bounds = this.bounds(shape)

			return (
				<HTMLContainer
					id={shape.id}
					data-testid="card-shape"
					style={{
						border: '1px solid black',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						pointerEvents: 'all',
					}}
				>
					{bounds.w.toFixed()}x{bounds.h.toFixed()}
				</HTMLContainer>
			)
		}

		indicator(shape: CardShape) {
			return <rect data-testid="card-indicator" width={shape.props.w} height={shape.props.h} />
		}
	}

	class CardTool extends TLBoxTool {
		static override id = 'card'
		static override initial = 'idle'
		override shapeType = 'card'
	}

	const tools = [CardTool]
	const shapes = { card: { util: CardUtil } }

	it('Uses custom shapes', async () => {
		let app = {} as App
		render(
			await act(async () => (
				<TldrawEditor
					shapes={shapes}
					tools={tools}
					autoFocus
					onMount={(editorApp) => {
						app = editorApp
					}}
				>
					<Canvas />
					<div data-testid="canvas-1" />
				</TldrawEditor>
			))
		)
		await screen.findByTestId('canvas-1')

		expect(app).toBeTruthy()
		await act(async () => {
			app.updateInstanceState({ screenBounds: { x: 0, y: 0, w: 1080, h: 720 } }, true, true)
		})

		expect(app.shapeUtils.card).toBeTruthy()

		const id = app.createShapeId()

		await act(async () => {
			app.createShapes([
				{
					id,
					type: 'card',
					props: { w: 100, h: 100 },
				},
			])
		})

		// Does the shape exist?
		expect(app.getShapeById(id)).toMatchObject({
			id,
			type: 'card',
			x: 0,
			y: 0,
			props: { w: 100, h: 100, opacity: '1' },
		})

		// Is the shape's component rendering?
		expect(await screen.findByTestId('card-shape')).toBeTruthy()

		// Select the shape
		await act(async () => app.select(id))

		// Is the shape's component rendering?
		expect(await screen.findByTestId('card-indicator')).toBeTruthy()

		// Select the tool...
		await act(async () => app.setSelectedTool('card'))

		// Is the editor's current tool correct?
		expect(app.currentToolId).toBe('card')
	})
})

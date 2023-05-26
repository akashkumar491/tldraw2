import {
	App,
	DebugFlag,
	debugFlags,
	featureFlags,
	hardResetApp,
	TLShapePartial,
	uniqueId,
	useApp,
} from '@tldraw/editor'
import * as React from 'react'
import { track, useValue } from 'signia-react'
import { useDialogs } from '../hooks/useDialogsProvider'
import { useToasts } from '../hooks/useToastsProvider'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { Button } from './primitives/Button'
import * as Dialog from './primitives/Dialog'
import * as DropdownMenu from './primitives/DropdownMenu'

let t = 0

function createNShapes(app: App, n: number) {
	const shapesToCreate: TLShapePartial[] = Array(n)
	const cols = Math.floor(Math.sqrt(n))

	for (let i = 0; i < n; i++) {
		t++
		shapesToCreate[i] = {
			id: app.createShapeId('box' + t),
			type: 'geo',
			x: (i % cols) * 132,
			y: Math.floor(i / cols) * 132,
		}
	}

	app.batch(() => {
		app.createShapes(shapesToCreate).setSelectedIds(shapesToCreate.map((s) => s.id))
	})
}

/** @public */
export const DebugPanel = React.memo(function DebugPanel({
	renderDebugMenuItems,
}: {
	renderDebugMenuItems: (() => React.ReactNode) | null
}) {
	const msg = useTranslation()
	return (
		<div className="tlui-debug-panel">
			<CurrentState />
			<ShapeCount />
			<DropdownMenu.Root id="debug">
				<DropdownMenu.Trigger>
					<Button icon="dots-horizontal" title={msg('debug-panel.more')} />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content side="top" align="end" alignOffset={0}>
					<DebugMenuContent renderDebugMenuItems={renderDebugMenuItems} />
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	)
})

const CurrentState = track(function CurrentState() {
	const app = useApp()
	return <div className="tlui-debug-panel__current-state">{app.root.path.value}</div>
})

const ShapeCount = function ShapeCount() {
	const app = useApp()
	const count = useValue('rendering shapes count', () => app.renderingShapes.length, [app])

	return <div>{count} Shapes</div>
}

const DebugMenuContent = track(function DebugMenuContent({
	renderDebugMenuItems,
}: {
	renderDebugMenuItems: (() => React.ReactNode) | null
}) {
	const app = useApp()
	const { addToast } = useToasts()
	const { addDialog } = useDialogs()

	const [error, setError] = React.useState<boolean>(false)

	return (
		<>
			<DropdownMenu.Group>
				<DropdownMenu.Item
					onClick={() => {
						addToast({
							id: uniqueId(),
							title: 'Something happened',
							description: 'Hey, attend to this thing over here. It might be important!',
							// icon?: string
							// title?: string
							// description?: string
							// actions?: TLToastAction[]
						})
					}}
				>
					<span>Show toast</span>
				</DropdownMenu.Item>

				<DropdownMenu.Item
					onClick={() => {
						addDialog({
							component: ({ onClose }) => (
								<ExampleDialog
									displayDontShowAgain
									onCancel={() => {
										onClose()
									}}
									onContinue={() => {
										onClose()
									}}
								/>
							),
							onClose: () => {
								void null
							},
						})
					}}
				>
					<span>Show dialog</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item onClick={() => createNShapes(app, 100)}>
					<span>Create 100 shapes</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item
					onClick={() => {
						function countDescendants({ children }: HTMLElement) {
							let count = 0
							if (!children.length) return 0
							for (const el of [...(children as any)]) {
								count++
								count += countDescendants(el)
							}
							return count
						}

						const { selectedShapes } = app

						const shapes = selectedShapes.length === 0 ? app.renderingShapes : selectedShapes

						const elms = shapes.map(
							(shape) => (document.getElementById(shape.id) as HTMLElement)!.parentElement!
						)

						let descendants = elms.length

						for (const elm of elms) {
							descendants += countDescendants(elm)
						}

						window.alert(`Shapes ${shapes.length}, DOM nodes:${descendants}`)
					}}
				>
					<span>Count shapes and nodes</span>
				</DropdownMenu.Item>

				{(() => {
					if (error) throw Error('oh no!')
				})()}
				<DropdownMenu.Item
					onClick={() => {
						setError(true)
					}}
				>
					<span>Throw error</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item
					onClick={() => {
						hardResetApp()
					}}
				>
					<span>Hard reset</span>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Group>
				<Toggle label="Read-only" value={app.isReadOnly} onChange={(r) => app.setReadOnly(r)} />
				<DebugFlagToggle flag={debugFlags.debugSvg} />
				<DebugFlagToggle
					flag={debugFlags.debugCursors}
					onChange={(enabled) => {
						if (enabled) {
							const MAX_COLUMNS = 5
							const partials = CURSOR_NAMES.map((name, i) => {
								return {
									id: app.createShapeId(),
									type: 'geo',
									x: (i % MAX_COLUMNS) * 175,
									y: Math.floor(i / MAX_COLUMNS) * 175,
									props: {
										text: name,
										w: 150,
										h: 150,
										fill: 'semi',
									},
								}
							})

							app.createShapes(partials)
						}
					}}
				/>
			</DropdownMenu.Group>
			<DropdownMenu.Group>
				{Object.values(featureFlags).map((flag) => {
					return <DebugFlagToggle key={flag.name} flag={flag} />
				})}
			</DropdownMenu.Group>
			{renderDebugMenuItems?.()}
		</>
	)
})

function Toggle({
	label,
	value,
	onChange,
}: {
	label: string
	value: boolean
	onChange: (newValue: boolean) => void
}) {
	return (
		<DropdownMenu.CheckboxItem title={label} checked={value} onSelect={() => onChange(!value)}>
			{label}
		</DropdownMenu.CheckboxItem>
	)
}

const DebugFlagToggle = track(function DebugFlagToggle({
	flag,
	onChange,
}: {
	flag: DebugFlag<boolean>
	onChange?: (newValue: boolean) => void
}) {
	return (
		<Toggle
			label={flag.name
				.replace(/([a-z0-9])([A-Z])/g, (m) => `${m[0]} ${m[1].toLowerCase()}`)
				.replace(/^[a-z]/, (m) => m.toUpperCase())}
			value={flag.value}
			onChange={(newValue) => {
				flag.set(newValue)
				onChange?.(newValue)
			}}
		/>
	)
})

const CURSOR_NAMES = [
	'none',
	'default',
	'pointer',
	'cross',
	'move',
	'grab',
	'grabbing',
	'text',
	'resize-edge',
	'resize-corner',
	'ew-resize',
	'ns-resize',
	'nesw-resize',
	'nwse-resize',
	'rotate',
	'nwse-rotate',
	'nesw-rotate',
	'senw-rotate',
	'swne-rotate',
	'zoom-in',
	'zoom-out',
]

function ExampleDialog({
	title = 'title',
	body = 'hello hello hello',
	cancel = 'Cancel',
	confirm = 'Continue',
	displayDontShowAgain = false,
	onCancel,
	onContinue,
}: {
	title?: string
	body?: string
	cancel?: string
	confirm?: string
	displayDontShowAgain?: boolean
	onCancel: () => void
	onContinue: () => void
}) {
	const [dontShowAgain, setDontShowAgain] = React.useState(false)

	return (
		<>
			<Dialog.Header>
				<Dialog.Title>{title}</Dialog.Title>
				<Dialog.CloseButton />
			</Dialog.Header>
			<Dialog.Body style={{ maxWidth: 350 }}>{body}</Dialog.Body>
			<Dialog.Footer className="tlui-dialog__footer__actions">
				{displayDontShowAgain && (
					<Button
						onClick={() => setDontShowAgain(!dontShowAgain)}
						iconLeft={dontShowAgain ? 'checkbox-checked' : 'checkbox-empty'}
						style={{ marginRight: 'auto' }}
					>
						{`Don't show again`}
					</Button>
				)}
				<Button onClick={onCancel}>{cancel}</Button>
				<Button type="primary" onClick={async () => onContinue()}>
					{confirm}
				</Button>
			</Dialog.Footer>
		</>
	)
}

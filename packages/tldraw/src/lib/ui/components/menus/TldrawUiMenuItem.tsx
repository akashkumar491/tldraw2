import { ContextMenuItem } from '@radix-ui/react-context-menu'
import { preventDefault } from '@tldraw/editor'
import { useState } from 'react'
import { unwrapLabel } from '../../context/actions'
import { TLUiEventSource } from '../../context/events'
import { useReadonly } from '../../hooks/useReadonly'
import { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { Spinner } from '../Spinner'
import { Button } from '../primitives/Button'
import { DropdownMenuItem } from '../primitives/DropdownMenu'
import { Kbd } from '../primitives/Kbd'
import { kbdStr } from '../primitives/shared'
import { useTldrawUiMenuContext } from './TldrawUiMenuContext'

/** @public */
export type TLUiMenuItemProps<
	TranslationKey extends string = string,
	IconType extends string = string,
> = {
	id: string
	/**
	 * The icon to display on the item.
	 */
	icon?: IconType
	/**
	 * The keyboard shortcut to display on the item.
	 */
	kbd?: string
	/**
	 * The title to display on the item.
	 */
	title?: string
	/**
	 * The label to display on the item. If it's a string, it will be translated. If it's an object, the keys will be used as the language keys and the values will be translated.
	 */
	label?: TranslationKey | { [key: string]: TranslationKey }
	/**
	 * If the editor is in readonly mode and the item is not marked as readonlyok, it will not be rendered.
	 */
	readonlyOk?: boolean
	/**
	 * The function to call when the item is clicked.
	 */
	onSelect: (source: TLUiEventSource) => Promise<void> | void
	/**
	 * Whether this item should be disabled.
	 */
	disabled?: boolean
	/**
	 * Prevent the menu from closing when the item is clicked
	 */
	noClose?: boolean
	/**
	 * Whether to show a spinner on the item.
	 */
	spinner?: boolean
}

/** @public */
export function TldrawUiMenuItem<
	TranslationKey extends string = string,
	IconType extends string = string,
>({
	disabled = false,
	spinner = false,
	readonlyOk = false,
	id,
	kbd,
	label,
	icon,
	onSelect,
	noClose,
}: TLUiMenuItemProps<TranslationKey, IconType>) {
	const { type: menuType, sourceId } = useTldrawUiMenuContext()

	const msg = useTranslation()

	const [disableClicks, setDisableClicks] = useState(false)

	const isReadonlyMode = useReadonly()
	if (isReadonlyMode && !readonlyOk) return null

	const labelToUse = unwrapLabel(label, menuType)
	const kbdTouse = kbd ? kbdStr(kbd) : undefined

	const labelStr = labelToUse ? msg(labelToUse as TLUiTranslationKey) : undefined
	const titleStr = labelStr && kbdTouse ? `${labelStr} ${kbdTouse}` : labelStr

	switch (menuType) {
		case 'menu': {
			return (
				<DropdownMenuItem
					type="menu"
					data-testid={`${sourceId}.${id}`}
					kbd={kbd}
					label={labelStr}
					disabled={disabled}
					title={titleStr}
					onClick={(e) => {
						if (noClose) {
							preventDefault(e)
						}
						if (disableClicks) {
							setDisableClicks(false)
						} else {
							onSelect(sourceId)
						}
					}}
				/>
			)
		}
		case 'context-menu': {
			// Hide disabled context menu items
			if (disabled) return null

			return (
				<ContextMenuItem
					dir="ltr"
					title={titleStr}
					draggable={false}
					className="tlui-button tlui-button__menu"
					data-testid={`${sourceId}.${id}`}
					onSelect={(e) => {
						if (noClose) preventDefault(e)
						if (disableClicks) {
							setDisableClicks(false)
						} else {
							onSelect(sourceId)
						}
					}}
				>
					<span className="tlui-button__label" draggable={false}>
						{labelStr}
					</span>
					{kbd && <Kbd>{kbd}</Kbd>}
					{spinner && <Spinner />}
				</ContextMenuItem>
			)
		}
		case 'panel': {
			return (
				<Button
					data-testid={`${sourceId}.${id}`}
					icon={icon}
					type="menu"
					label={labelStr}
					title={titleStr}
					onClick={() => onSelect(sourceId)}
					smallIcon
					disabled={disabled}
				/>
			)
		}
		case 'small-icons':
		case 'icons': {
			return (
				<Button
					data-testid={`${sourceId}.${id}`}
					icon={icon}
					type="icon"
					title={titleStr}
					onClick={() => onSelect(sourceId)}
					disabled={disabled}
					smallIcon={menuType === 'small-icons'}
				/>
			)
		}
		case 'keyboard-shortcuts': {
			if (!kbd) return null

			return (
				<div className="tlui-shortcuts-dialog__key-pair" data-testid={`${sourceId}.${id}`}>
					<div className="tlui-shortcuts-dialog__key-pair__key">{labelStr}</div>
					<div className="tlui-shortcuts-dialog__key-pair__value">
						<Kbd>{kbd!}</Kbd>
					</div>
				</div>
			)
		}
		case 'helper-buttons': {
			return (
				<Button type="low" label={labelStr} iconLeft={icon} onClick={() => onSelect(sourceId)} />
			)
		}
		default: {
			return null
		}
	}
}

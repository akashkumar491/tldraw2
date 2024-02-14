import { PopoverContent } from '@radix-ui/react-popover'
import { useEditor, useValue } from '@tldraw/editor'
import { memo } from 'react'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useReadonly } from '../../hooks/useReadonly'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiMenuContextProvider } from '../menus/TldrawUiMenuContext'
import { Button } from '../primitives/Button'
import { Popover, PopoverTrigger } from '../primitives/Popover'
import { DefaultActionsMenuContent } from './DefaultActionsMenuContent'

/** @public */
export type TLUiActionsMenuProps = {
	children?: any
}

/** @public */
export const DefaultActionsMenu = memo(function DefaultActionsMenu({
	children,
}: TLUiActionsMenuProps) {
	const msg = useTranslation()
	const breakpoint = useBreakpoint()

	const isReadonlyMode = useReadonly()

	const editor = useEditor()
	const isInAcceptableReadonlyState = useValue(
		'should display quick actions when in readonly',
		() => editor.isInAny('hand', 'zoom'),
		[editor]
	)

	// Get the actions menu content, either the default component or the user's
	// override. If there's no menu content, then the user has set it to null,
	// so skip rendering the menu.

	const content = children ?? <DefaultActionsMenuContent />
	if (isReadonlyMode && !isInAcceptableReadonlyState) return

	return (
		<Popover id="actions-menu">
			<PopoverTrigger>
				<Button
					className="tlui-menu__trigger"
					data-testid="main.action-menu"
					icon="dots-vertical"
					title={msg('actions-menu.title')}
					type="icon" // needs to be here because the trigger also passes down type="button"
					smallIcon
				/>
			</PopoverTrigger>
			<PopoverContent side={breakpoint >= 6 ? 'bottom' : 'top'} dir="ltr" sideOffset={6}>
				<div className="tlui-actions-menu tlui-buttons__grid">
					<TldrawUiMenuContextProvider type="actions" sourceId="actions-menu">
						{content}
					</TldrawUiMenuContextProvider>
				</div>
			</PopoverContent>
		</Popover>
	)
})

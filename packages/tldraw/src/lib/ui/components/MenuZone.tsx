import { memo } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useTldrawUiComponents } from '../hooks/useTldrawUiComponents'

export const MenuZone = memo(function MenuZone() {
	const breakpoint = useBreakpoint()

	const { MainMenu, QuickActions, ActionsMenu, PageMenu } = useTldrawUiComponents()

	if (!MainMenu && !PageMenu && breakpoint < 6) return null

	return (
		<div className="tlui-menu-zone">
			<div className="tlui-buttons__horizontal">
				{MainMenu && <MainMenu />}
				{PageMenu && <PageMenu />}
				{breakpoint < 6 ? null : (
					<>
						{QuickActions && <QuickActions />}
						{ActionsMenu && <ActionsMenu />}
					</>
				)}
			</div>
		</div>
	)
})

import { PORTRAIT_BREAKPOINT } from '../../constants'
import { useBreakpoint } from '../../context/breakpoints'
import { kbd } from '../../kbd-utils'

/** @public */
export interface TLUiKbdProps {
	children: string
}

/** @public */
export function TldrawUiKbd({ children }: TLUiKbdProps) {
	const breakpoint = useBreakpoint()
	if (breakpoint < PORTRAIT_BREAKPOINT.MOBILE) return null
	return (
		<kbd className="tlui-kbd">
			{kbd(children).map((k, i) => (
				<span key={i}>{k}</span>
			))}
		</kbd>
	)
}

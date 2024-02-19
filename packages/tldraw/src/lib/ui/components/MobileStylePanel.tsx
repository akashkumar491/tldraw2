import {
	DefaultColorStyle,
	TLDefaultColorStyle,
	getDefaultColorTheme,
	useEditor,
	useValue,
} from '@tldraw/editor'
import { useCallback } from 'react'
import { useTldrawUiComponents } from '../context/components'
import { useRelevantStyles } from '../hooks/useRevelantStyles'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from './primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from './primitives/Button/TldrawUiButtonIcon'
import {
	TldrawUiPopover,
	TldrawUiPopoverContent,
	TldrawUiPopoverTrigger,
} from './primitives/TldrawUiPopover'

export function MobileStylePanel() {
	const editor = useEditor()
	const msg = useTranslation()

	const relevantStyles = useRelevantStyles()
	const color = relevantStyles?.styles.get(DefaultColorStyle)
	const theme = getDefaultColorTheme({ isDarkMode: editor.user.getIsDarkMode() })
	const currentColor = (
		color?.type === 'shared' ? theme[color.value as TLDefaultColorStyle] : theme.black
	).solid

	const disableStylePanel = useValue(
		'isHandOrEraserToolActive',
		() => editor.isInAny('hand', 'zoom', 'eraser', 'laser'),
		[editor]
	)

	const handleStylesOpenChange = useCallback(
		(isOpen: boolean) => {
			if (!isOpen) {
				editor.updateInstanceState({ isChangingStyle: false })
			}
		},
		[editor]
	)

	const { StylePanel } = useTldrawUiComponents()
	if (!StylePanel) return null

	return (
		<TldrawUiPopover id="mobile style menu" onOpenChange={handleStylesOpenChange}>
			<TldrawUiPopoverTrigger>
				<TldrawUiButton
					type="tool"
					data-testid="mobile-styles.button"
					style={{
						color: disableStylePanel ? 'var(--color-muted-1)' : currentColor,
					}}
					title={msg('style-panel.title')}
					disabled={disableStylePanel}
				>
					<TldrawUiButtonIcon
						icon={disableStylePanel ? 'blob' : color?.type === 'mixed' ? 'mixed' : 'blob'}
					/>
				</TldrawUiButton>
			</TldrawUiPopoverTrigger>
			<TldrawUiPopoverContent side="top" align="end">
				<_StylePanel />
			</TldrawUiPopoverContent>
		</TldrawUiPopover>
	)
}

function _StylePanel() {
	const { StylePanel } = useTldrawUiComponents()
	const relevantStyles = useRelevantStyles()

	if (!StylePanel) return null
	return <StylePanel relevantStyles={relevantStyles} isMobile />
}

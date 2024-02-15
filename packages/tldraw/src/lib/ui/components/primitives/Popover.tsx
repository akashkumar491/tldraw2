import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useContainer } from '@tldraw/editor'
import React from 'react'
import { useMenuIsOpen } from '../../hooks/useMenuIsOpen'
import { Button, TLUiButtonProps } from './Button'

/** @public */
export type TLUiPopoverProps = {
	id: string
	open?: boolean
	children: React.ReactNode
	onOpenChange?: (isOpen: boolean) => void
}

/** @public */
export function Popover({ id, children, onOpenChange, open }: TLUiPopoverProps) {
	const [isOpen, handleOpenChange] = useMenuIsOpen(id, onOpenChange)

	return (
		<PopoverPrimitive.Root
			onOpenChange={handleOpenChange}
			open={open || isOpen /* allow debugging */}
		>
			<div className="tlui-popover">{children}</div>
		</PopoverPrimitive.Root>
	)
}

/** @public */
export interface TLUiPopoverTriggerProps extends TLUiButtonProps {
	children?: React.ReactNode
}

/** @public */
export function PopoverTrigger({ children, ...rest }: TLUiPopoverTriggerProps) {
	return (
		<PopoverPrimitive.Trigger asChild dir="ltr">
			<Button {...rest}>{children}</Button>
		</PopoverPrimitive.Trigger>
	)
}

/** @public */
export type TLUiPopoverContentProps = {
	children: React.ReactNode
	side: 'top' | 'bottom' | 'left' | 'right'
	align?: 'start' | 'center' | 'end'
	alignOffset?: number
	sideOffset?: number
}

/** @public */
export function PopoverContent({
	side,
	children,
	align = 'center',
	sideOffset = 8,
	alignOffset = 0,
}: TLUiPopoverContentProps) {
	const container = useContainer()
	return (
		<PopoverPrimitive.Portal container={container}>
			<PopoverPrimitive.Content
				className="tlui-popover__content"
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
				dir="ltr"
			>
				{children}
				{/* <StyledArrow /> */}
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Portal>
	)
}

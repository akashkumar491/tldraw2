import { TLAlignType, TLFillType, TLFontType, TLShape, TLSizeType } from '@tldraw/tlschema'
import { TLVerticalAlignType } from '@tldraw/tlschema/src/style-types'
import React from 'react'
import { LABEL_FONT_SIZES, TEXT_PROPS } from '../../../constants'
import { stopEventPropagation } from '../../../utils/dom'
import { TextHelpers } from '../TLTextUtil/TextHelpers'
import { useEditableText } from './useEditableText'

export const TextLabel = React.memo(function TextLabel<
	T extends Extract<TLShape, { props: { text: string } }>
>({
	id,
	type,
	text,
	size,
	labelColor,
	font,
	align,
	verticalAlign = 'center',
	height,
	wrap,
}: {
	id: T['id']
	type: T['type']
	size: TLSizeType
	font: TLFontType
	fill?: TLFillType
	align: TLAlignType
	verticalAlign?: TLVerticalAlignType
	height: number | undefined
	wrap?: boolean
	text: string
	labelColor: string
}) {
	const {
		rInput,
		isEmpty,
		isEditing,
		isEditableFromHover,
		handleFocus,
		handleChange,
		handleKeyDown,
		handleBlur,
	} = useEditableText(id, type, text)

	const isInteractive = isEditing || isEditableFromHover

	let verticalOffset = 0
	if (height) {
		if (verticalAlign === 'top') {
			verticalOffset = -height / 2 + 20
		} else if (verticalAlign === 'bottom') {
			verticalOffset = height / 2 - 20
		}
	}

	return (
		<div
			className="tl-text-label"
			data-font={font}
			data-align={align}
			data-hastext={!isEmpty}
			data-isediting={isEditing}
			data-textwrap={!!wrap}
		>
			<div
				className="tl-text-label__inner"
				style={{
					fontSize: LABEL_FONT_SIZES[size],
					lineHeight: LABEL_FONT_SIZES[size] * TEXT_PROPS.lineHeight + 'px',
					minHeight: isEmpty ? LABEL_FONT_SIZES[size] * TEXT_PROPS.lineHeight + 32 : 0,
					minWidth: isEmpty ? 33 : 0,
					top: verticalOffset,
					color: labelColor,
				}}
			>
				<div className="tl-text tl-text-content" dir="ltr">
					{TextHelpers.normalizeTextForDom(text)}
				</div>
				{isInteractive ? (
					// Consider replacing with content-editable
					<textarea
						ref={rInput}
						className="tl-text tl-text-input"
						name="text"
						tabIndex={-1}
						autoComplete="false"
						autoCapitalize="false"
						autoCorrect="false"
						autoSave="false"
						autoFocus={isEditing}
						placeholder=""
						spellCheck="true"
						wrap="off"
						dir="auto"
						datatype="wysiwyg"
						defaultValue={text}
						onFocus={handleFocus}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						onContextMenu={stopEventPropagation}
					/>
				) : null}
			</div>
		</div>
	)
})

import { TLArrowShape, TLShapeId, VecLike, stopEventPropagation } from '@tldraw/editor'
import * as React from 'react'
import { TextHelpers } from '../../shared/TextHelpers'
import { ARROW_LABEL_FONT_SIZES, TEXT_PROPS } from '../../shared/default-shape-constants'
import { useEditableText } from '../../shared/useEditableText'

export const ArrowTextLabel = React.memo(function ArrowTextLabel({
	id,
	text,
	size,
	font,
	position,
	width,
	labelColor,
}: { id: TLShapeId; position: VecLike; width?: number; labelColor: string } & Pick<
	TLArrowShape['props'],
	'text' | 'size' | 'font'
>) {
	const {
		rInput,
		isEditing,
		handleFocus,
		handleBlur,
		handleKeyDown,
		handleChange,
		isEmpty,
		handleInputPointerDown,
		handleDoubleClick,
	} = useEditableText(id, 'arrow', text)

	const [initialText, setInitialText] = React.useState(text)
	React.useEffect(() => {
		if (!isEditing) {
			setInitialText(text)
		}
	}, [isEditing, text])

	const finalText = TextHelpers.normalizeTextForDom(text)
	const hasText = finalText.trim().length > 0

	if (!isEditing && !hasText) {
		return null
	}

	return (
		<div
			className="tl-arrow-label"
			data-font={font}
			data-align={'center'}
			data-hastext={!isEmpty}
			data-isediting={isEditing}
			style={{
				textAlign: 'center',
				fontSize: ARROW_LABEL_FONT_SIZES[size],
				lineHeight: ARROW_LABEL_FONT_SIZES[size] * TEXT_PROPS.lineHeight + 'px',
				transform: `translate(${position.x}px, ${position.y}px)`,
				color: labelColor,
			}}
		>
			<div className="tl-arrow-label__inner">
				<p style={{ width: width ? width : '9px' }}>
					{text ? TextHelpers.normalizeTextForDom(text) : ' '}
				</p>
				<textarea
					ref={rInput}
					// We need to add the initial value as the key here because we need this component to
					// 'reset' when this state changes and grab the latest defaultValue.
					key={initialText}
					className="tl-text tl-text-input"
					name="text"
					tabIndex={-1}
					readOnly={!isEditing}
					disabled={!isEditing}
					autoComplete="off"
					autoCapitalize="off"
					autoCorrect="off"
					autoSave="off"
					autoFocus
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
					onTouchEnd={stopEventPropagation}
					onContextMenu={stopEventPropagation}
					onPointerDown={handleInputPointerDown}
					onDoubleClick={handleDoubleClick}
				/>
			</div>
		</div>
	)
})

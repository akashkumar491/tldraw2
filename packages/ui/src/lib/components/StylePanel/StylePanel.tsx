import { App, TLNullableShapeProps, TLStyleItem, useEditor } from '@tldraw/editor'
import React, { useCallback } from 'react'

import { useValue } from 'signia-react'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { Button } from '../primitives/Button'
import { ButtonPicker } from '../primitives/ButtonPicker'
import { Slider } from '../primitives/Slider'
import { DoubleDropdownPicker } from './DoubleDropdownPicker'
import { DropdownPicker } from './DropdownPicker'

interface StylePanelProps {
	isMobile?: boolean
}

/** @public */
export const StylePanel = function StylePanel({ isMobile }: StylePanelProps) {
	const app = useEditor()

	const props = useValue('props', () => app.props, [app])

	const handlePointerOut = useCallback(() => {
		if (!isMobile) {
			app.isChangingStyle = false
		}
	}, [app, isMobile])

	if (!props) return null

	const { geo, arrowheadEnd, arrowheadStart, spline, font } = props

	const hideGeo = geo === undefined
	const hideArrowHeads = arrowheadEnd === undefined && arrowheadStart === undefined
	const hideSpline = spline === undefined
	const hideText = font === undefined

	return (
		<div className="tlui-style-panel" data-ismobile={isMobile} onPointerLeave={handlePointerOut}>
			<CommonStylePickerSet props={props} />
			{!hideText && <TextStylePickerSet props={props} />}
			{!(hideGeo && hideArrowHeads && hideSpline) && (
				<div className="tlui-style-panel__section" aria-label="style panel styles">
					<GeoStylePickerSet props={props} />
					<ArrowheadStylePickerSet props={props} />
					<SplineStylePickerSet props={props} />
				</div>
			)}
		</div>
	)
}

const { styles } = App

function useStyleChangeCallback() {
	const app = useEditor()

	return React.useCallback(
		(item: TLStyleItem, squashing: boolean) => {
			app.batch(() => {
				app.setProp(item.type, item.id, false, squashing)
				app.isChangingStyle = true
			})
		},
		[app]
	)
}

function CommonStylePickerSet({ props }: { props: TLNullableShapeProps }) {
	const app = useEditor()
	const msg = useTranslation()

	const handleValueChange = useStyleChangeCallback()

	const handleOpacityValueChange = React.useCallback(
		(value: number, ephemeral: boolean) => {
			const item = styles.opacity[value]
			app.setProp(item.type, item.id, ephemeral)
			app.isChangingStyle = true
		},
		[app]
	)

	const { color, fill, dash, size, opacity } = props

	if (
		color === undefined &&
		fill === undefined &&
		dash === undefined &&
		size === undefined &&
		opacity === undefined
	) {
		return null
	}

	const showPickers = fill || dash || size

	const opacityIndex = styles.opacity.findIndex((s) => s.id === opacity)

	return (
		<>
			<div className="tlui-style-panel__section__common" aria-label="style panel styles">
				{color === undefined ? null : (
					<ButtonPicker
						title={msg('style-panel.color')}
						styleType="color"
						data-testid="style.color"
						items={styles.color}
						value={color}
						onValueChange={handleValueChange}
					/>
				)}
				{opacity === undefined ? null : (
					<Slider
						data-testid="style.opacity"
						value={opacityIndex >= 0 ? opacityIndex : styles.opacity.length - 1}
						label={opacity ? `opacity-style.${opacity}` : 'style-panel.mixed'}
						onValueChange={handleOpacityValueChange}
						steps={styles.opacity.length - 1}
						title={msg('style-panel.opacity')}
					/>
				)}
			</div>
			{showPickers && (
				<div className="tlui-style-panel__section" aria-label="style panel styles">
					{fill === undefined ? null : (
						<ButtonPicker
							title={msg('style-panel.fill')}
							styleType="fill"
							data-testid="style.fill"
							items={styles.fill}
							value={fill}
							onValueChange={handleValueChange}
						/>
					)}
					{dash === undefined ? null : (
						<ButtonPicker
							title={msg('style-panel.dash')}
							styleType="dash"
							data-testid="style.dash"
							items={styles.dash}
							value={dash}
							onValueChange={handleValueChange}
						/>
					)}
					{size === undefined ? null : (
						<ButtonPicker
							title={msg('style-panel.size')}
							styleType="size"
							data-testid="style.size"
							items={styles.size}
							value={size}
							onValueChange={handleValueChange}
						/>
					)}
				</div>
			)}
		</>
	)
}

function TextStylePickerSet({ props }: { props: TLNullableShapeProps }) {
	const msg = useTranslation()
	const handleValueChange = useStyleChangeCallback()

	const { font, align, verticalAlign } = props
	if (font === undefined && align === undefined) {
		return null
	}

	return (
		<div className="tlui-style-panel__section" aria-label="style panel text">
			{font === undefined ? null : (
				<ButtonPicker
					title={msg('style-panel.font')}
					styleType="font"
					data-testid="font"
					items={styles.font}
					value={font}
					onValueChange={handleValueChange}
				/>
			)}

			{align === undefined ? null : (
				<div className="tlui-style-panel__row">
					<ButtonPicker
						title={msg('style-panel.align')}
						styleType="align"
						data-testid="align"
						items={styles.align}
						value={align}
						onValueChange={handleValueChange}
					/>
					{verticalAlign === undefined ? (
						<Button
							title={msg('style-panel.vertical-align')}
							data-testid="vertical-align"
							icon="vertical-align-center"
							disabled
						/>
					) : (
						<DropdownPicker
							id="geo-vertical-alignment"
							styleType="verticalAlign"
							data-testid="style-panel.geo-vertical-align"
							items={styles.verticalAlign}
							value={verticalAlign}
							onValueChange={handleValueChange}
						/>
					)}
				</div>
			)}
		</div>
	)
}

function GeoStylePickerSet({ props }: { props: TLNullableShapeProps }) {
	const handleValueChange = useStyleChangeCallback()

	const { geo } = props
	if (geo === undefined) {
		return null
	}

	return (
		<DropdownPicker
			id="geo"
			label={'style-panel.geo'}
			styleType="geo"
			data-testid="style-panel.geo"
			items={styles.geo}
			value={geo}
			onValueChange={handleValueChange}
		/>
	)
}

function SplineStylePickerSet({ props }: { props: TLNullableShapeProps }) {
	const handleValueChange = useStyleChangeCallback()

	const { spline } = props
	if (spline === undefined) {
		return null
	}

	return (
		<DropdownPicker
			id="spline"
			label={'style-panel.spline'}
			styleType="spline"
			data-testid="style.spline"
			items={styles.spline}
			value={spline}
			onValueChange={handleValueChange}
		/>
	)
}

function ArrowheadStylePickerSet({ props }: { props: TLNullableShapeProps }) {
	const handleValueChange = useStyleChangeCallback()

	const { arrowheadEnd, arrowheadStart } = props
	if (arrowheadEnd === undefined && arrowheadStart === undefined) {
		return null
	}

	return (
		<DoubleDropdownPicker
			label={'style-panel.arrowheads'}
			styleTypeA="arrowheadStart"
			data-testid="style.arrowheads"
			itemsA={styles.arrowheadStart}
			valueA={arrowheadStart}
			styleTypeB="arrowheadEnd"
			itemsB={styles.arrowheadEnd}
			valueB={arrowheadEnd}
			onValueChange={handleValueChange}
			labelA="style-panel.arrowhead-start"
			labelB="style-panel.arrowhead-end"
		/>
	)
}

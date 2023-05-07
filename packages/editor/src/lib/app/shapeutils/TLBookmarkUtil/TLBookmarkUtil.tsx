import { toDomPrecision } from '@tldraw/primitives'
import {
	bookmarkShapeMigrations,
	bookmarkShapeTypeValidator,
	TLAsset,
	TLAssetId,
	TLBookmarkAsset,
	TLBookmarkShape,
} from '@tldraw/tlschema'
import { debounce, getHashForString } from '@tldraw/utils'
import { HTMLContainer } from '../../../components/HTMLContainer'
import { defineShape } from '../../../config/TLShapeDefinition'
import {
	DEFAULT_BOOKMARK_HEIGHT,
	DEFAULT_BOOKMARK_WIDTH,
	ROTATING_SHADOWS,
} from '../../../constants'
import {
	rotateBoxShadow,
	stopEventPropagation,
	truncateStringWithEllipsis,
} from '../../../utils/dom'
import { HyperlinkButton } from '../shared/HyperlinkButton'
import { TLBoxUtil } from '../TLBoxUtil'
import { OnBeforeCreateHandler, OnBeforeUpdateHandler } from '../TLShapeUtil'

/** @public */
export class TLBookmarkUtil extends TLBoxUtil<TLBookmarkShape> {
	static type = 'bookmark'

	override canResize = () => false

	override hideSelectionBoundsBg = () => true
	override hideSelectionBoundsFg = () => true

	override defaultProps(): TLBookmarkShape['props'] {
		return {
			opacity: '1',
			url: '',
			w: DEFAULT_BOOKMARK_WIDTH,
			h: DEFAULT_BOOKMARK_HEIGHT,
			assetId: null,
		}
	}

	override render(shape: TLBookmarkShape) {
		const asset = (
			shape.props.assetId ? this.app.getAssetById(shape.props.assetId) : null
		) as TLBookmarkAsset

		const pageRotation = this.app.getPageRotation(shape)

		const address = this.getHumanReadableAddress(shape)

		return (
			<HTMLContainer>
				<div
					className="tl-bookmark__container tl-hitarea-stroke"
					style={{
						boxShadow: rotateBoxShadow(pageRotation, ROTATING_SHADOWS),
					}}
				>
					<div className="tl-bookmark__image_container">
						{asset?.props.image ? (
							<img
								className="tl-bookmark__image"
								draggable={false}
								src={asset?.props.image}
								alt={asset?.props.title || ''}
							/>
						) : (
							<div className="tl-bookmark__placeholder" />
						)}
						<HyperlinkButton url={shape.props.url} zoomLevel={this.app.zoomLevel} />
					</div>
					<div className="tl-bookmark__copy_container">
						{asset?.props.title && (
							<h2 className="tl-bookmark__heading">
								{truncateStringWithEllipsis(asset?.props.title || '', 54)}
							</h2>
						)}
						{asset?.props.description && (
							<p className="tl-bookmark__description">
								{truncateStringWithEllipsis(asset?.props.description || '', 128)}
							</p>
						)}
						<a
							className="tl-bookmark__link"
							href={shape.props.url || ''}
							target="_blank"
							rel="noopener noreferrer"
							onPointerDown={stopEventPropagation}
							onPointerUp={stopEventPropagation}
							onClick={stopEventPropagation}
						>
							{truncateStringWithEllipsis(address, 45)}
						</a>
					</div>
				</div>
			</HTMLContainer>
		)
	}

	override indicator(shape: TLBookmarkShape) {
		return (
			<rect
				width={toDomPrecision(shape.props.w)}
				height={toDomPrecision(shape.props.h)}
				rx="8"
				ry="8"
			/>
		)
	}

	override onBeforeCreate?: OnBeforeCreateHandler<TLBookmarkShape> = (shape) => {
		this.updateBookmarkAsset(shape)
	}

	override onBeforeUpdate?: OnBeforeUpdateHandler<TLBookmarkShape> = (prev, shape) => {
		if (prev.props.url !== shape.props.url) {
			this.updateBookmarkAsset(shape)
		}
	}

	getHumanReadableAddress(shape: TLBookmarkShape) {
		try {
			const url = new URL(shape.props.url)
			const path = url.pathname.replace(/\/*$/, '')
			return `${url.hostname}${path}`
		} catch (e) {
			return shape.props.url
		}
	}

	protected updateBookmarkAsset = debounce((shape: TLBookmarkShape) => {
		const { url } = shape.props
		const assetId: TLAssetId = TLAsset.createCustomId(getHashForString(url))
		const existing = this.app.getAssetById(assetId)

		if (existing) {
			// If there's an existing asset with the same URL, use
			// its asset id instead.
			if (shape.props.assetId !== existing.id) {
				this.app.updateShapes([
					{
						id: shape.id,
						type: shape.type,
						props: { assetId },
					},
				])
			}
		} else if (this.app.onCreateBookmarkFromUrl) {
			// Create a bookmark asset for the URL. First get its meta
			// data, then create the asset and update the shape.
			this.app.onCreateBookmarkFromUrl(url).then((meta) => {
				if (!meta) {
					this.app.updateShapes([
						{
							id: shape.id,
							type: shape.type,
							props: { assetId: undefined },
						},
					])
					return
				}

				this.app.batch(() => {
					this.app
						.createAssets([
							{
								id: assetId,
								typeName: 'asset',
								type: 'bookmark',
								props: {
									src: url,
									description: meta.description,
									image: meta.image,
									title: meta.title,
								},
							},
						])
						.updateShapes([
							{
								id: shape.id,
								type: shape.type,
								props: { assetId },
							},
						])
				})
			})
		}
	}, 500)
}

/** @public */
export const TLBookmarkShapeDef = defineShape<TLBookmarkShape, TLBookmarkUtil>({
	type: 'bookmark',
	getShapeUtil: () => TLBookmarkUtil,
	validator: bookmarkShapeTypeValidator,
	migrations: bookmarkShapeMigrations,
})

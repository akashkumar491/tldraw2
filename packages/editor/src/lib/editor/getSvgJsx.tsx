import {
	TLFrameShape,
	TLGroupShape,
	TLShape,
	TLShapeId,
	createShapeId,
	getDefaultColorTheme,
} from '@tldraw/tlschema'
import { Fragment, JSXElementConstructor, ReactElement } from 'react'
import { Mat } from '../primitives/Mat'
import { Editor } from './Editor'
import { SvgExportContext, SvgExportContextProvider, SvgExportDef } from './types/SvgExportContext'
import { TLSvgOptions } from './types/misc-types'

export async function getSvgJsx(
	editor: Editor,
	shapes: TLShapeId[] | TLShape[],
	opts: TLSvgOptions = {}
) {
	const ids =
		typeof shapes[0] === 'string' ? (shapes as TLShapeId[]) : (shapes as TLShape[]).map((s) => s.id)

	if (ids.length === 0) return
	if (!window.document) throw Error('No document')

	const {
		scale = 1,
		background = false,
		padding = editor.options.defaultSvgPadding,
		preserveAspectRatio = false,
	} = opts

	const isDarkMode = opts.darkMode ?? editor.user.getIsDarkMode()
	const theme = getDefaultColorTheme({ isDarkMode })

	// ---Figure out which shapes we need to include
	const shapeIdsToInclude = editor.getShapeAndDescendantIds(ids)
	const renderingShapes = editor
		.getUnorderedRenderingShapes(false)
		.filter(({ id }) => shapeIdsToInclude.has(id))

	// --- Common bounding box of all shapes
	let bbox = null
	if (opts.bounds) {
		bbox = opts.bounds
	} else {
		for (const { id } of renderingShapes) {
			const maskedPageBounds = editor.getShapeMaskedPageBounds(id)
			if (!maskedPageBounds) continue
			if (bbox) {
				bbox.union(maskedPageBounds)
			} else {
				bbox = maskedPageBounds.clone()
			}
		}
	}

	// no unmasked shapes to export
	if (!bbox) return

	const singleFrameShapeId =
		ids.length === 1 && editor.isShapeOfType<TLFrameShape>(editor.getShape(ids[0])!, 'frame')
			? ids[0]
			: null
	if (!singleFrameShapeId) {
		// Expand by an extra 32 pixels
		bbox.expandBy(padding)
		// bbox.expandBy(padding * 4)
	}

	// We want the svg image to be BIGGER THAN USUAL to account for image quality
	const w = bbox.width * scale
	const h = bbox.height * scale

	try {
		document.body.focus?.() // weird but necessary
	} catch (e) {
		// not implemented
	}

	const defChildren: ReactElement[] = []

	const exportDefPromisesById = new Map<string, Promise<void>>()
	const exportContext: SvgExportContext = {
		isDarkMode,
		addExportDef: (def: SvgExportDef) => {
			if (exportDefPromisesById.has(def.key)) return
			const promise = (async () => {
				const element = await def.getElement()
				if (!element) return

				defChildren.push(<Fragment key={defChildren.length}>{element}</Fragment>)
			})()
			exportDefPromisesById.set(def.key, promise)
		},
	}
	const renderingShapePromises = renderingShapes.map(
		async ({ id, opacity, index, backgroundIndex }) => {
			// Don't render the frame if we're only exporting a single frame
			if (id === singleFrameShapeId) return []

			const shape = editor.getShape(id)!

			if (editor.isShapeOfType<TLGroupShape>(shape, 'group')) return []

			const util = editor.getShapeUtil(shape)

			let toSvgResult = await util.toSvg?.(shape, exportContext)
			let toBackgroundSvgResult = await util.toBackgroundSvg?.(shape, exportContext)

			if (!toSvgResult && !toBackgroundSvgResult) {
				const bounds = editor.getShapePageBounds(shape)!
				toSvgResult = (
					<rect
						width={bounds.w}
						height={bounds.h}
						fill={theme.solid}
						stroke={theme.grey.pattern}
						strokeWidth={1}
					/>
				)
			}

			let pageTransform = editor.getShapePageTransform(shape)!.toCssString()
			if ('scale' in shape.props) {
				if (shape.props.scale !== 1) {
					pageTransform = `${pageTransform} scale(${shape.props.scale}, ${shape.props.scale})`
				}
			}

			if (toSvgResult) {
				toSvgResult = (
					<g key={shape.id} transform={pageTransform} opacity={opacity}>
						{toSvgResult}
					</g>
				)
			}
			if (toBackgroundSvgResult) {
				toBackgroundSvgResult = (
					<g key={`bg_${shape.id}`} transform={pageTransform} opacity={opacity}>
						{toBackgroundSvgResult}
					</g>
				)
			}

			// Create svg mask if shape has a frame as parent
			const pageMask = editor.getShapeMask(shape.id)
			if (pageMask) {
				// Create a clip path and add it to defs
				const pageMaskId = `mask_${shape.id.replace(':', '_')}`
				defChildren.push(
					<clipPath key={defChildren.length} id={pageMaskId}>
						{/* Create a polyline mask that does the clipping */}
						<path d={`M${pageMask.map(({ x, y }) => `${x},${y}`).join('L')}Z`} />
					</clipPath>
				)

				if (toSvgResult) {
					toSvgResult = (
						<g key={shape.id} clipPath={`url(#${pageMaskId})`}>
							{toSvgResult}
						</g>
					)
				}
				if (toBackgroundSvgResult) {
					toBackgroundSvgResult = (
						<g key={`bg_${shape.id}`} clipPath={`url(#${pageMaskId})`}>
							{toBackgroundSvgResult}
						</g>
					)
				}
			}

			const elements = []
			if (toSvgResult) {
				elements.push({ zIndex: index, element: toSvgResult })
			}
			if (toBackgroundSvgResult) {
				elements.push({ zIndex: backgroundIndex, element: toBackgroundSvgResult })
			}

			return elements
		}
	)

	const watermarkPromise = new Promise<
		{ zIndex: number; element: ReactElement<any, string | JSXElementConstructor<any>> }[]
	>((resolve) => {
		const id = createShapeId()
		const height = 32
		const width = 107
		const padding = 8
		const desiredHeight = bbox.height * 0.1
		const scaleFactor = desiredHeight / height
		const offsetX = width * scaleFactor + padding
		const offsetY = height * scaleFactor + padding
		const pageTransform = Mat.Identity()
			.translate(bbox.maxX - offsetX, bbox.maxY - offsetY)
			.scale(scaleFactor, scaleFactor)
			.toCssString()
		// const src = getWatermarkSrc({ forceLocal: true, isMobile: false })
		return resolve([
			{
				zIndex: 1000,
				element: (
					<g key={id} transform={pageTransform} opacity={1}>
						<svg
							width="107"
							height="32"
							viewBox="0 0 107 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M92.0365 18.249C91.3697 18.249 90.7885 17.7953 90.6266 17.1484L88.3831 8.18532C88.1535 7.26789 88.8474 6.37897 89.7931 6.37897H90.9965C91.6955 6.37897 92.2955 6.87657 92.4248 7.56352L93.1706 11.5252C93.2584 11.9911 93.9218 12.002 94.0248 11.5392L94.9197 7.51677C95.0676 6.85193 95.6574 6.37897 96.3385 6.37897H98.1662C98.8418 6.37897 99.4284 6.84455 99.5817 7.50256L100.513 11.499C100.62 11.96 101.282 11.9436 101.367 11.4778L102.074 7.57321C102.2 6.88174 102.802 6.37897 103.505 6.37897H104.7C105.645 6.37897 106.339 7.26789 106.11 8.18532L103.866 17.1484C103.704 17.7953 103.123 18.249 102.456 18.249H100.086C99.432 18.249 98.8588 17.8128 98.6846 17.1829L97.6448 13.4227C97.5264 12.9945 96.9182 12.997 96.8033 13.4263L95.8016 17.1711C95.6315 17.8068 95.0556 18.249 94.3975 18.249H92.0365Z"
								fill="black"
							/>
							<path
								d="M79.3673 18.4346C78.609 18.4346 77.9385 18.3109 77.3556 18.0636C76.778 17.8112 76.324 17.4299 75.9939 16.9199C75.6638 16.4099 75.4988 15.7607 75.4988 14.9725C75.4988 14.3233 75.6097 13.7695 75.8315 13.311C76.0533 12.8473 76.3627 12.4687 76.7599 12.175C77.1571 11.8813 77.6187 11.6572 78.1448 11.5027C78.6761 11.3481 79.2486 11.2477 79.8624 11.2013C80.5278 11.1498 81.0617 11.0879 81.464 11.0158C81.8715 10.9385 82.1655 10.8329 82.346 10.699C82.5265 10.5599 82.6168 10.377 82.6168 10.1503V10.1194C82.6168 9.81027 82.4982 9.57328 82.2609 9.40842C82.0236 9.24356 81.7193 9.16113 81.3479 9.16113C80.9405 9.16113 80.6078 9.25129 80.3499 9.43161C79.3704 10.1104 79.4422 10.243 77.9282 10.243C76.1274 10.243 76.6747 7.6058 78.4543 6.78095C79.2435 6.41001 80.2286 6.22455 81.4098 6.22455C82.2609 6.22455 83.0243 6.32501 83.7 6.52593C84.3757 6.7217 84.9508 6.99733 85.4253 7.35281C85.8999 7.70314 86.2609 8.11529 86.5085 8.58927C86.7612 9.05809 86.8876 9.56813 86.8876 10.1194V16.7956C86.8876 17.5984 86.2369 18.2491 85.4342 18.2491H83.6917C83.2519 18.2491 82.8953 17.8925 82.8953 17.4527C82.8953 17.2249 82.5367 17.116 82.3783 17.2796C81.9383 17.7341 81.3647 18.0831 80.7831 18.2491C80.355 18.3727 79.8831 18.4346 79.3673 18.4346ZM80.7599 15.7453C81.0849 15.7453 81.3892 15.6783 81.6729 15.5443C81.9617 15.4104 82.1964 15.2172 82.377 14.9648C82.6213 14.6231 82.6648 14.2001 82.6639 13.7771C82.6631 13.4328 82.2964 13.1946 81.9638 13.2835C81.6292 13.373 81.2873 13.437 80.9456 13.4887C80.6155 13.5403 80.3447 13.6253 80.1332 13.7438C79.9269 13.8571 79.7722 13.9988 79.669 14.1688C79.571 14.3336 79.522 14.5191 79.522 14.7252C79.522 15.0549 79.6381 15.3074 79.8702 15.4825C80.1023 15.6577 80.3989 15.7453 80.7599 15.7453Z"
								fill="black"
							/>
							<path
								d="M68.6156 18.2491C67.8129 18.2491 67.1622 17.5984 67.1622 16.7956V7.83255C67.1622 7.02983 67.8129 6.3791 68.6156 6.3791H70.5938C70.9889 6.3791 71.3092 6.69942 71.3092 7.09455C71.3092 7.32551 71.8521 7.44928 71.9983 7.27052C72.1463 7.08967 72.304 6.9342 72.462 6.80414C72.9366 6.41774 73.491 6.22455 74.1255 6.22455C75.4297 6.22455 75.6045 7.52553 75.6045 8.17838C75.6045 9.66905 75.1303 9.81027 73.6303 9.81027C73.2125 9.81027 72.836 9.90558 72.5007 10.0962C72.1706 10.2817 71.9101 10.5444 71.7193 10.8844C71.5284 11.2193 71.433 11.6134 71.433 12.0668V16.7956C71.433 17.5984 70.7823 18.2491 69.9796 18.2491H68.6156Z"
								fill="black"
							/>
							<path
								d="M57.4213 18.4036C56.5754 18.4036 55.7966 18.1821 55.0848 17.739C54.3781 17.296 53.8107 16.6236 53.3826 15.7221C52.9597 14.8205 52.7482 13.6845 52.7482 12.3141C52.7482 10.8818 52.97 9.71751 53.4136 8.82107C53.8623 7.92464 54.44 7.26777 55.1467 6.85047C55.8585 6.43317 56.6064 6.22451 57.3904 6.22451C58.23 6.22451 59.0588 6.50437 59.7119 7.00975C60.0092 7.23979 60.7947 7.00154 60.7947 6.62566V3.87585C60.7947 3.07314 61.4454 2.42241 62.2481 2.42241H63.612C64.4148 2.42241 65.0655 3.07314 65.0655 3.87585V16.7956C65.0655 17.5983 64.4148 18.2491 63.612 18.2491H61.6393C61.1899 18.2491 60.8256 17.8848 60.8256 17.4354C60.8256 17.1901 60.3421 17.0433 60.1747 17.2224C60.1234 17.2772 60.0719 17.331 60.021 17.3835C59.7167 17.6978 59.3453 17.9477 58.9068 18.1331C58.4736 18.3135 57.9784 18.4036 57.4213 18.4036ZM58.9997 15.127C59.3917 15.127 59.727 15.0137 60.0055 14.787C60.2892 14.5551 60.5058 14.2306 60.6554 13.8133C60.8101 13.3908 60.8875 12.8911 60.8875 12.3141C60.8875 11.7267 60.8101 11.2244 60.6554 10.8071C60.5058 10.3847 60.2892 10.0627 60.0055 9.84115C59.727 9.61447 59.3917 9.50113 58.9997 9.50113C58.6077 9.50113 58.2724 9.61447 57.9939 9.84115C57.7205 10.0627 57.509 10.3847 57.3594 10.8071C57.215 11.2244 57.1428 11.7267 57.1428 12.3141C57.1428 12.9014 57.215 13.4063 57.3594 13.8287C57.509 14.246 57.7205 14.568 57.9939 14.7947C58.2724 15.0162 58.6077 15.127 58.9997 15.127Z"
								fill="black"
							/>
							<path
								d="M49.4901 2.42241C50.2928 2.42241 50.9435 3.07314 50.9435 3.87585V16.7956C50.9435 17.5983 50.2928 18.2491 49.4901 18.2491H48.1261C47.3234 18.2491 46.6727 17.5983 46.6727 16.7956V3.87585C46.6727 3.07314 47.3234 2.42241 48.1261 2.42241H49.4901Z"
								fill="black"
							/>
							<path
								d="M38.3612 4.98874C38.3612 4.18602 39.012 3.53529 39.8147 3.53529H41.1786C41.9813 3.53529 42.6321 4.18602 42.6321 4.98874V5.84621C42.6321 6.14054 42.8707 6.37914 43.165 6.37914H43.5643C44.0995 6.37914 44.5333 6.81296 44.5333 7.34811V8.50132C44.5333 9.03647 44.0995 9.47029 43.5643 9.47029H43.165C42.8707 9.47029 42.6321 9.70889 42.6321 10.0032V14.4316C42.6321 14.5964 42.6604 14.7355 42.7172 14.8489C42.7739 14.9571 42.8616 15.0395 42.9802 15.0962C43.0989 15.1477 43.251 15.1734 43.4367 15.1734C43.8923 15.1734 44.3197 15.3384 44.4137 15.7842L44.7166 17.2201C44.8152 17.6879 44.5369 18.149 44.0711 18.2569C43.7204 18.3393 43.3026 18.3934 42.8177 18.4191C41.8377 18.4707 41.015 18.3702 40.3496 18.1178C39.6843 17.8602 39.1839 17.4557 38.8487 16.9045C38.5134 16.3532 38.3509 15.6629 38.3612 14.8334V10.0032C38.3612 9.70889 38.1175 9.47029 37.8231 9.47029C37.288 9.47029 36.8448 9.03647 36.8448 8.50132V7.34811C36.8448 6.81296 37.288 6.37914 37.8231 6.37914C38.1175 6.37914 38.3612 6.14054 38.3612 5.84621V4.98874Z"
								fill="black"
							/>
							<path
								d="M52.2803 29.4602C51.8071 29.4602 51.4235 29.0778 51.4235 28.6062V23.3865C51.4235 22.9148 51.8071 22.5325 52.2803 22.5325H52.4535C52.9267 22.5325 53.3104 22.9148 53.3104 23.3865V25.2703C53.3104 25.3051 53.3387 25.3333 53.3736 25.3333C53.3936 25.3333 53.4124 25.3239 53.4244 25.3079L55.2389 22.8767C55.4006 22.6601 55.6555 22.5325 55.9264 22.5325H55.9693C56.6775 22.5325 57.08 23.3404 56.6518 23.9028L55.7033 25.1488C55.4885 25.431 55.4708 25.8161 55.6588 26.1168L56.9328 28.1544C57.2885 28.7233 56.8781 29.4602 56.2056 29.4602H55.9814C55.6802 29.4602 55.4011 29.3026 55.2464 29.045L54.3634 27.5755C54.1578 27.2333 53.6708 27.2055 53.4273 27.5221C53.3515 27.6207 53.3104 27.7415 53.3104 27.8658V28.6062C53.3104 29.0778 52.9267 29.4602 52.4535 29.4602H52.2803Z"
								fill="black"
							/>
							<path
								d="M47.089 29.4602H45.2717C44.7985 29.4602 44.4148 29.0778 44.4148 28.6062V23.3865C44.4148 22.9148 44.7985 22.5325 45.2717 22.5325H47.0619C47.7768 22.5325 48.3945 22.6712 48.9148 22.9485C49.4374 23.2237 49.8402 23.6206 50.123 24.1392C50.408 24.6557 50.5506 25.2747 50.5506 25.9963C50.5506 26.718 50.4092 27.3381 50.1264 27.8568C49.8436 28.3732 49.4431 28.7701 48.925 29.0475C48.4069 29.3227 47.7949 29.4602 47.089 29.4602ZM46.3017 27.1465C46.3017 27.5425 46.6238 27.8636 47.0212 27.8636C47.3651 27.8636 47.658 27.8083 47.9001 27.6978C48.1445 27.5873 48.33 27.3968 48.4567 27.1262C48.5856 26.8555 48.6501 26.4789 48.6501 25.9963C48.6501 25.5137 48.5845 25.1371 48.4533 24.8665C48.3243 24.5959 48.1343 24.4053 47.8831 24.2948C47.6343 24.1843 47.3289 24.1291 46.9669 24.1291C46.5995 24.1291 46.3017 24.4259 46.3017 24.7921V27.1465Z"
								fill="black"
							/>
							<path
								d="M42.4006 24.6972C42.0594 24.6972 41.8037 24.3876 41.542 24.1695C41.3927 24.0433 41.1653 23.9801 40.8599 23.9801C40.6653 23.9801 40.5058 24.0038 40.3814 24.0512C40.2592 24.0963 40.1687 24.1583 40.1099 24.2372C40.051 24.3161 40.0205 24.4063 40.0182 24.5078C40.0137 24.5913 40.0284 24.6668 40.0623 24.7345C40.0985 24.7999 40.1551 24.8596 40.232 24.9137C40.309 24.9656 40.4074 25.013 40.5273 25.0558C40.6472 25.0987 40.7897 25.137 40.9549 25.1708L41.525 25.2926C41.9096 25.3738 42.2388 25.4809 42.5126 25.614C42.7863 25.747 43.0103 25.9037 43.1845 26.0842C43.3587 26.2623 43.4865 26.463 43.568 26.6863C43.6517 26.9095 43.6947 27.1531 43.697 27.4169C43.6947 27.8725 43.5804 28.2581 43.3542 28.5738C43.1279 28.8895 42.8044 29.1297 42.3836 29.2943C41.9651 29.459 41.4617 29.5413 40.8734 29.5413C40.2694 29.5413 39.7422 29.4522 39.292 29.274C38.844 29.0959 38.4956 28.8219 38.2467 28.452C38.1332 28.2807 38.0456 28.0875 37.9838 27.8722C37.8534 27.4174 38.2591 27.0245 38.7336 27.0245H39.0993C39.4166 27.0245 39.6507 27.2945 39.8248 27.559C39.9198 27.7033 40.0533 27.8127 40.2252 27.8871C40.3995 27.9615 40.6065 27.9988 40.8463 27.9988C41.0476 27.9988 41.2162 27.9739 41.3519 27.9243C41.4877 27.8747 41.5906 27.8059 41.6608 27.718C41.7309 27.63 41.7671 27.5297 41.7694 27.4169C41.7671 27.3109 41.732 27.2185 41.6642 27.1396C41.5985 27.0584 41.4899 26.9862 41.3384 26.9231C41.1868 26.8577 40.982 26.7968 40.7241 26.7404L40.0318 26.5916C39.4164 26.4585 38.9311 26.2364 38.5759 25.9252C38.223 25.6117 38.0476 25.1844 38.0499 24.6431C38.0476 24.2034 38.1653 23.8189 38.4029 23.4896C38.6427 23.1581 38.9741 22.8999 39.3972 22.715C39.8225 22.5301 40.3101 22.4376 40.8599 22.4376C41.4209 22.4376 41.9062 22.5312 42.3157 22.7184C42.7252 22.9056 43.0408 23.1694 43.2626 23.5099C43.3354 23.62 43.3966 23.7361 43.446 23.8583C43.6234 24.2974 43.2157 24.6972 42.7408 24.6972H42.4006Z"
								fill="black"
							/>
							<path
								d="M72.57 25.9833C72.57 26.7531 72.4198 27.4025 72.1195 27.9314C71.8191 28.4581 71.4138 28.8576 70.9035 29.13C70.3931 29.4001 69.8241 29.5351 69.1963 29.5351C68.564 29.5351 67.9927 29.399 67.4824 29.1266C66.9743 28.852 66.5701 28.4514 66.2698 27.9247C65.9717 27.3957 65.8227 26.7486 65.8227 25.9833C65.8227 25.2135 65.9717 24.5653 66.2698 24.0386C66.5701 23.5096 66.9743 23.1101 67.4824 22.84C67.9927 22.5677 68.564 22.4315 69.1963 22.4315C69.8241 22.4315 70.3931 22.5677 70.9035 22.84C71.4138 23.1101 71.8191 23.5096 72.1195 24.0386C72.4198 24.5653 72.57 25.2135 72.57 25.9833ZM70.6325 25.9833C70.6325 25.5692 70.5772 25.2203 70.4665 24.9367C70.3581 24.6508 70.1967 24.4347 69.9822 24.2884C69.7699 24.1399 69.5079 24.0656 69.1963 24.0656C68.8847 24.0656 68.6216 24.1399 68.4071 24.2884C68.1948 24.4347 68.0334 24.6508 67.9227 24.9367C67.8143 25.2203 67.7601 25.5692 67.7601 25.9833C67.7601 26.3975 67.8143 26.7475 67.9227 27.0333C68.0334 27.3169 68.1948 27.533 68.4071 27.6816C68.6216 27.8279 68.8847 27.901 69.1963 27.901C69.5079 27.901 69.7699 27.8279 69.9822 27.6816C70.1967 27.533 70.3581 27.3169 70.4665 27.0333C70.5772 26.7475 70.6325 26.3975 70.6325 25.9833Z"
								fill="black"
							/>
							<path
								d="M61.1348 29.4405C60.6625 29.4405 60.2796 29.0588 60.2796 28.588V23.3783C60.2796 22.9075 60.6625 22.5259 61.1348 22.5259H64.3984C64.8174 22.5259 65.1571 22.8645 65.1571 23.2822C65.1571 23.6998 64.8174 24.0384 64.3984 24.0384H62.759C62.4298 24.0384 62.1629 24.3045 62.1629 24.6327C62.1629 24.9608 62.4298 25.2269 62.759 25.2269H64.1003C64.5194 25.2269 64.8591 25.5655 64.8591 25.9832C64.8591 26.4008 64.5194 26.7394 64.1003 26.7394H63.0181C62.5457 26.7394 62.1629 27.1211 62.1629 27.5919V28.588C62.1629 29.0588 61.78 29.4405 61.3077 29.4405H61.1348Z"
								fill="black"
							/>
							<path
								d="M74.0859 29.535C73.7299 29.535 73.4413 29.2474 73.4413 28.8925V23.1684C73.4413 22.8135 73.7299 22.5259 74.0859 22.5259H76.4766C76.9985 22.5259 77.4551 22.6206 77.8465 22.8099C78.238 22.9993 78.5424 23.272 78.7599 23.6279C78.9773 23.9838 79.086 24.4105 79.086 24.9079C79.086 25.4098 78.9739 25.8331 78.7496 26.1776C78.5423 26.4992 78.2563 26.7472 77.8915 26.9217C77.8655 26.9341 77.839 26.9462 77.8122 26.9579C77.4116 27.1336 76.9435 27.2214 76.4079 27.2214H75.2396C74.8836 27.2214 74.595 26.9338 74.595 26.5789V24.9348C74.595 24.7269 74.7641 24.5583 74.9727 24.5583C75.1813 24.5583 75.3504 24.7269 75.3504 24.9348V25.1507C75.3504 25.4778 75.6164 25.743 75.9446 25.743H76.0233C76.2477 25.743 76.4388 25.7156 76.5967 25.6608C76.757 25.6038 76.8794 25.5137 76.9641 25.3904C77.0511 25.2672 77.0946 25.1064 77.0946 24.9079C77.0946 24.7071 77.0511 24.544 76.9641 24.4185C76.8794 24.2907 76.757 24.1972 76.5967 24.1378C76.4388 24.0762 76.2477 24.0454 76.0233 24.0454H75.995C75.639 24.0454 75.3504 24.3331 75.3504 24.6879V25.9759C75.3504 26.1416 75.4415 26.2941 75.5878 26.3729L75.8903 26.5361C76.2242 26.7162 76.0959 27.2214 75.7162 27.2214C75.5142 27.2214 75.3504 27.3847 75.3504 27.5861V28.8925C75.3504 29.2474 75.0618 29.535 74.7058 29.535H74.0859ZM77.1786 26.3179C77.4147 26.3179 77.6318 26.4465 77.7447 26.6531L77.8915 26.9217L78.8005 28.5852C79.0344 29.0133 78.7235 29.535 78.2344 29.535H77.6303C77.3933 29.535 77.1755 29.4055 77.063 29.1977L76.1123 27.4419C76.0388 27.3061 75.8964 27.2214 75.7416 27.2214C75.4204 27.2214 75.2174 26.8777 75.3732 26.5978L75.3995 26.5505C75.4794 26.407 75.6311 26.3179 75.7958 26.3179H77.1786Z"
								fill="black"
							/>
							<path
								d="M99.879 29.4819C99.4003 29.4819 99.0123 29.0951 99.0123 28.6179V23.3379C99.0123 22.8608 99.4003 22.4739 99.879 22.4739H102.061C102.596 22.4739 103.046 22.5458 103.41 22.6895C103.776 22.8332 104.052 23.0363 104.237 23.2986C104.425 23.561 104.519 23.8701 104.519 24.2259C104.519 24.4837 104.461 24.7187 104.347 24.9308C104.235 25.143 104.077 25.3209 103.873 25.4646C103.759 25.5439 103.634 25.6324 103.498 25.7046C103.452 25.7286 103.469 25.8663 103.519 25.8775C103.683 25.9145 103.838 25.9736 103.983 26.0566C104.23 26.1958 104.427 26.3885 104.574 26.6349C104.72 26.879 104.793 27.1664 104.793 27.4972C104.793 27.8805 104.693 28.2215 104.491 28.5203C104.292 28.8192 104.008 29.0541 103.64 29.2252C103.271 29.3963 102.832 29.4819 102.322 29.4819H99.879ZM100.921 27.2235C100.921 27.6317 101.253 27.9626 101.662 27.9626H101.814C102.134 27.9626 102.374 27.9033 102.534 27.7846C102.695 27.6637 102.775 27.4858 102.775 27.2508C102.775 27.0866 102.737 26.9474 102.661 26.8334C102.586 26.7193 102.478 26.6326 102.339 26.5733C102.201 26.514 102.036 26.4843 101.841 26.4843H101.662C101.253 26.4843 100.921 26.8153 100.921 27.2235ZM100.921 24.6366C100.921 25.007 101.222 25.3072 101.594 25.3072H101.704C101.871 25.3072 102.018 25.281 102.147 25.2285C102.275 25.1761 102.374 25.1008 102.445 25.0027C102.518 24.9023 102.555 24.7803 102.555 24.6366C102.555 24.4198 102.477 24.2544 102.322 24.1404C102.166 24.024 101.969 23.9659 101.731 23.9659H101.594C101.222 23.9659 100.921 24.2661 100.921 24.6366Z"
								fill="black"
							/>
							<path
								d="M93.8655 29.4819C93.3868 29.4819 92.9987 29.0951 92.9987 28.6179V23.3379C92.9987 22.8608 93.3868 22.4739 93.8655 22.4739H97.2967C97.7214 22.4739 98.0657 22.8171 98.0657 23.2404C98.0657 23.6638 97.7214 24.0069 97.2967 24.0069H95.5116C95.1779 24.0069 94.9074 24.2766 94.9074 24.6092C94.9074 24.9418 95.1779 25.2114 95.5116 25.2114H97.0358C97.4605 25.2114 97.8048 25.5546 97.8048 25.9779C97.8048 26.4012 97.4605 26.7444 97.0358 26.7444H95.5116C95.1779 26.7444 94.9074 27.014 94.9074 27.3466C94.9074 27.6793 95.1779 27.9489 95.5116 27.9489H97.283C97.7077 27.9489 98.052 28.2921 98.052 28.7154C98.052 29.1387 97.7077 29.4819 97.283 29.4819H93.8655Z"
								fill="black"
							/>
							<path
								d="M84.64 29.5776C84.3543 29.5776 84.1027 29.3901 84.0218 29.1169L82.3285 23.3938C82.2067 22.9822 82.5162 22.5697 82.9466 22.5697H83.6988C83.9996 22.5697 84.2604 22.7771 84.3272 23.0695L84.991 25.9768C85.047 26.2222 85.3955 26.2284 85.4602 25.9851L86.2418 23.0474C86.3168 22.7657 86.5725 22.5697 86.8648 22.5697H87.5472C87.84 22.5697 88.0961 22.7665 88.1705 23.0489L88.9368 25.9568C89.0008 26.1997 89.3484 26.1951 89.4058 25.9505L90.0836 23.0656C90.1518 22.7751 90.4118 22.5697 90.7111 22.5697H91.4665C91.897 22.5697 92.2064 22.9822 92.0847 23.3938L90.3913 29.1169C90.3105 29.3901 90.0589 29.5776 89.7732 29.5776H88.9024C88.6206 29.5776 88.3714 29.3951 88.2873 29.1269L87.4176 26.3552C87.3465 26.1286 87.0241 26.1304 86.9555 26.3578L86.1224 29.1201C86.0405 29.3917 85.7897 29.5776 85.5052 29.5776H84.64Z"
								fill="black"
							/>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M0 4.16C0 1.8625 1.8625 0 4.16 0H27.84C30.1375 0 32 1.8625 32 4.16V27.84C32 30.1375 30.1375 32 27.84 32H4.16C1.8625 32 0 30.1375 0 27.84V4.16ZM18.88 9.6C18.88 11.1906 17.5906 12.48 16 12.48C14.4094 12.48 13.12 11.1906 13.12 9.6C13.12 8.00942 14.4094 6.72 16 6.72C17.5906 6.72 18.88 8.00942 18.88 9.6ZM15.054 25.92C16.4086 25.9248 17.7129 24.0442 18.2008 22.994C18.8018 21.7002 19.1769 19.3745 18.574 17.9967C18.1517 17.0316 17.1842 16.32 15.9062 16.32C14.3674 16.32 13.12 17.5711 13.12 19.1145C13.12 20.4895 14.1346 21.5803 15.4222 21.7904C15.4882 21.8012 15.5358 21.8608 15.5263 21.927C15.4119 22.7208 15.0621 23.7613 14.4967 24.2926C13.8174 24.9311 14.0299 25.9163 15.054 25.92Z"
								fill="black"
							/>
						</svg>
					</g>
				),
			},
		])
	})
	renderingShapePromises.push(watermarkPromise)

	const unorderedShapeElements = await Promise.all(renderingShapePromises).then((results) =>
		results.flat()
	)
	await Promise.all(exportDefPromisesById.values())

	const svg = (
		<SvgExportContextProvider editor={editor} context={exportContext}>
			<svg
				preserveAspectRatio={preserveAspectRatio ? preserveAspectRatio : undefined}
				direction="ltr"
				width={w}
				height={h}
				viewBox={`${bbox.minX} ${bbox.minY} ${bbox.width} ${bbox.height}`}
				strokeLinecap="round"
				strokeLinejoin="round"
				style={{
					backgroundColor: background
						? singleFrameShapeId
							? theme.solid
							: theme.background
						: 'transparent',
				}}
			>
				<defs>{defChildren}</defs>
				{unorderedShapeElements.sort((a, b) => a.zIndex - b.zIndex).map(({ element }) => element)}
			</svg>
		</SvgExportContextProvider>
	)
	console.log(svg)
	return { jsx: svg, width: w, height: h }
}

import { CustomEmbedDefinition, EmbedDefinition, safeParseUrl } from '@tldraw/editor'

// Only allow multiplayer embeds. If we add additional routes later for example '/help' this won't match
const TLDRAW_APP_RE = /(^\/r\/[^/]+\/?$)/

/** @public */
export const DEFAULT_EMBED_DEFINITIONS = [
	{
		type: 'tldraw',
		title: 'tldraw',
		hostnames: ['beta.tldraw.com', 'tldraw.com', 'localhost:3000'],
		minWidth: 300,
		minHeight: 300,
		width: 720,
		height: 500,
		doesResize: true,
		overridePermissions: {
			'allow-top-navigation': true,
		},
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(TLDRAW_APP_RE)) {
				return url
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(TLDRAW_APP_RE)) {
				return url
			}
			return
		},
	},
	{
		type: 'figma',
		title: 'Figma',
		hostnames: ['figma.com'],
		width: 720,
		height: 500,
		doesResize: true,
		toEmbedUrl: (url) => {
			if (
				!!url.match(
					// eslint-disable-next-line no-useless-escape
					/https:\/\/([\w\.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/
				) &&
				!url.includes('figma.com/embed')
			) {
				return `https://www.figma.com/embed?embed_host=share&url=${url}`
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(/^\/embed\/?$/)) {
				const outUrl = urlObj.searchParams.get('url')
				if (outUrl) {
					return outUrl
				}
			}
			return
		},
	},
	{
		type: 'google_maps',
		title: 'Google Maps',
		hostnames: ['google.*'],
		width: 720,
		height: 500,
		doesResize: true,
		overridePermissions: {
			'allow-presentation': true,
		},
		toEmbedUrl: (url) => {
			if (url.includes('/maps/')) {
				const match = url.match(/@(.*),(.*),(.*)z/)
				let result: string
				if (match) {
					const [, lat, lng, z] = match
					const host = new URL(url).host.replace('www.', '')
					result = `https://${host}/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GC_API_KEY}&center=${lat},${lng}&zoom=${z}`
				} else {
					result = ''
				}

				return result
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (!urlObj) return

			const matches = urlObj.pathname.match(/^\/maps\/embed\/v1\/view\/?$/)
			if (matches && urlObj.searchParams.has('center') && urlObj.searchParams.get('zoom')) {
				const zoom = urlObj.searchParams.get('zoom')
				const [lat, lon] = urlObj.searchParams.get('center')!.split(',')
				return `https://www.google.com/maps/@${lat},${lon},${zoom}z`
			}
			return
		},
	},
	{
		type: 'val_town',
		title: 'Val Town',
		hostnames: ['val.town'],
		minWidth: 260,
		minHeight: 100,
		width: 720,
		height: 500,
		doesResize: true,
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			// e.g. extract "steveruizok/mathFact" from https://www.val.town/v/steveruizok/mathFact
			const matches = urlObj && urlObj.pathname.match(/\/v\/(.+)\/?/)
			if (matches) {
				return `https://www.val.town/embed/${matches[1]}`
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			// e.g. extract "steveruizok/mathFact" from https://www.val.town/v/steveruizok/mathFact
			const matches = urlObj && urlObj.pathname.match(/\/embed\/(.+)\/?/)
			if (matches) {
				return `https://www.val.town/v/${matches[1]}`
			}
			return
		},
	},
	{
		type: 'codesandbox',
		title: 'CodeSandbox',
		hostnames: ['codesandbox.io'],
		minWidth: 300,
		minHeight: 300,
		width: 720,
		height: 500,
		doesResize: true,
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			const matches = urlObj && urlObj.pathname.match(/\/s\/([^/]+)\/?/)
			if (matches) {
				return `https://codesandbox.io/embed/${matches[1]}`
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			const matches = urlObj && urlObj.pathname.match(/\/embed\/([^/]+)\/?/)
			if (matches) {
				return `https://codesandbox.io/s/${matches[1]}`
			}
			return
		},
	},
	{
		type: 'codepen',
		title: 'Codepen',
		hostnames: ['codepen.io'],
		minWidth: 300,
		minHeight: 300,
		width: 520,
		height: 400,
		doesResize: true,
		toEmbedUrl: (url) => {
			const CODEPEN_URL_REGEXP = /https:\/\/codepen.io\/([^/]+)\/pen\/([^/]+)/
			const matches = url.match(CODEPEN_URL_REGEXP)
			if (matches) {
				const [_, user, id] = matches
				return `https://codepen.io/${user}/embed/${id}`
			}
			return
		},
		fromEmbedUrl: (url) => {
			const CODEPEN_EMBED_REGEXP = /https:\/\/codepen.io\/([^/]+)\/embed\/([^/]+)/
			const matches = url.match(CODEPEN_EMBED_REGEXP)
			if (matches) {
				const [_, user, id] = matches
				return `https://codepen.io/${user}/pen/${id}`
			}
			return
		},
	},
	{
		type: 'scratch',
		title: 'Scratch',
		hostnames: ['scratch.mit.edu'],
		width: 520,
		height: 400,
		doesResize: false,
		toEmbedUrl: (url) => {
			const SCRATCH_URL_REGEXP = /https?:\/\/scratch.mit.edu\/projects\/([^/]+)/
			const matches = url.match(SCRATCH_URL_REGEXP)
			if (matches) {
				const [_, id] = matches
				return `https://scratch.mit.edu/projects/embed/${id}`
			}
			return
		},
		fromEmbedUrl: (url) => {
			const SCRATCH_EMBED_REGEXP = /https:\/\/scratch.mit.edu\/projects\/embed\/([^/]+)/
			const matches = url.match(SCRATCH_EMBED_REGEXP)
			if (matches) {
				const [_, id] = matches
				return `https://scratch.mit.edu/projects/${id}`
			}
			return
		},
	},
	{
		type: 'youtube',
		title: 'YouTube',
		hostnames: ['*.youtube.com', 'youtube.com', 'youtu.be'],
		width: 800,
		height: 450,
		doesResize: true,
		overridePermissions: {
			'allow-presentation': true,
			'allow-popups-to-escape-sandbox': true,
		},
		isAspectRatioLocked: true,
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (!urlObj) return

			const hostname = urlObj.hostname.replace(/^www./, '')
			if (hostname === 'youtu.be') {
				const videoId = urlObj.pathname.split('/').filter(Boolean)[0]
				return `https://www.youtube.com/embed/${videoId}`
			} else if (
				(hostname === 'youtube.com' || hostname === 'm.youtube.com') &&
				urlObj.pathname.match(/^\/watch/)
			) {
				const videoId = urlObj.searchParams.get('v')
				return `https://www.youtube.com/embed/${videoId}`
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (!urlObj) return

			const hostname = urlObj.hostname.replace(/^www./, '')
			if (hostname === 'youtube.com') {
				const matches = urlObj.pathname.match(/^\/embed\/([^/]+)\/?/)
				if (matches) {
					return `https://www.youtube.com/watch?v=${matches[1]}`
				}
			}
			return
		},
	},
	{
		type: 'google_calendar',
		title: 'Google Calendar',
		hostnames: ['calendar.google.*'],
		width: 720,
		height: 500,
		minWidth: 460,
		minHeight: 360,
		doesResize: true,
		instructionLink: 'https://support.google.com/calendar/answer/41207?hl=en',
		overridePermissions: {
			'allow-popups-to-escape-sandbox': true,
		},
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			const cidQs = urlObj?.searchParams.get('cid')

			if (urlObj?.pathname.match(/\/calendar\/u\/0/) && cidQs) {
				urlObj.pathname = '/calendar/embed'

				const keys = Array.from(urlObj.searchParams.keys())
				for (const key of keys) {
					urlObj.searchParams.delete(key)
				}
				urlObj.searchParams.set('src', cidQs)
				return urlObj.href
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			const srcQs = urlObj?.searchParams.get('src')

			if (urlObj?.pathname.match(/\/calendar\/embed/) && srcQs) {
				urlObj.pathname = '/calendar/u/0'
				const keys = Array.from(urlObj.searchParams.keys())
				for (const key of keys) {
					urlObj.searchParams.delete(key)
				}
				urlObj.searchParams.set('cid', srcQs)
				return urlObj.href
			}
			return
		},
	},
	{
		type: 'google_slides',
		title: 'Google Slides',
		hostnames: ['docs.google.*'],
		width: 720,
		height: 500,
		minWidth: 460,
		minHeight: 360,
		doesResize: true,
		overridePermissions: {
			'allow-popups-to-escape-sandbox': true,
		},
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)

			if (urlObj?.pathname.match(/^\/presentation/) && urlObj?.pathname.match(/\/pub\/?$/)) {
				urlObj.pathname = urlObj.pathname.replace(/\/pub$/, '/embed')
				const keys = Array.from(urlObj.searchParams.keys())
				for (const key of keys) {
					urlObj.searchParams.delete(key)
				}
				return urlObj.href
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)

			if (urlObj?.pathname.match(/^\/presentation/) && urlObj?.pathname.match(/\/embed\/?$/)) {
				urlObj.pathname = urlObj.pathname.replace(/\/embed$/, '/pub')
				const keys = Array.from(urlObj.searchParams.keys())
				for (const key of keys) {
					urlObj.searchParams.delete(key)
				}
				return urlObj.href
			}
			return
		},
	},
	{
		type: 'github_gist',
		title: 'GitHub Gist',
		hostnames: ['gist.github.com'],
		width: 720,
		height: 500,
		doesResize: true,
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(/\/([^/]+)\/([^/]+)/)) {
				if (!url.split('/').pop()) return
				return url
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(/\/([^/]+)\/([^/]+)/)) {
				if (!url.split('/').pop()) return
				return url
			}
			return
		},
	},
	{
		type: 'replit',
		title: 'Replit',
		hostnames: ['replit.com'],
		width: 720,
		height: 500,
		doesResize: true,
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(/\/@([^/]+)\/([^/]+)/)) {
				return `${url}?embed=true`
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (
				urlObj &&
				urlObj.pathname.match(/\/@([^/]+)\/([^/]+)/) &&
				urlObj.searchParams.has('embed')
			) {
				urlObj.searchParams.delete('embed')
				return urlObj.href
			}
			return
		},
	},
	{
		type: 'felt',
		title: 'Felt',
		hostnames: ['felt.com'],
		width: 720,
		height: 500,
		doesResize: true,
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(/^\/map\//)) {
				return urlObj.origin + '/embed' + urlObj.pathname
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(/^\/embed\/map\//)) {
				urlObj.pathname = urlObj.pathname.replace(/^\/embed/, '')
				return urlObj.href
			}
			return
		},
	},
	{
		type: 'spotify',
		title: 'Spotify',
		hostnames: ['open.spotify.com'],
		width: 720,
		height: 500,
		minHeight: 500,
		overrideOutlineRadius: 12,
		doesResize: true,
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(/^\/(artist|album)\//)) {
				return urlObj.origin + '/embed' + urlObj.pathname
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(/^\/embed\/(artist|album)\//)) {
				return urlObj.origin + urlObj.pathname.replace(/^\/embed/, '')
			}
			return
		},
	},
	{
		type: 'vimeo',
		title: 'Vimeo',
		hostnames: ['vimeo.com', 'player.vimeo.com'],
		width: 640,
		height: 360,
		doesResize: true,
		isAspectRatioLocked: true,
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.hostname === 'vimeo.com') {
				if (urlObj.pathname.match(/^\/[0-9]+/)) {
					return (
						'https://player.vimeo.com/video/' + urlObj.pathname.split('/')[1] + '?title=0&byline=0'
					)
				}
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.hostname === 'player.vimeo.com') {
				const matches = urlObj.pathname.match(/^\/video\/([^/]+)\/?$/)
				if (matches) {
					return 'https://vimeo.com/' + matches[1]
				}
			}
			return
		},
	},
	{
		type: 'excalidraw',
		title: 'Excalidraw',
		hostnames: ['excalidraw.com'],
		width: 720,
		height: 500,
		doesResize: true,
		isAspectRatioLocked: true,
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.hash.match(/#room=/)) {
				return url
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.hash.match(/#room=/)) {
				return url
			}
			return
		},
	},
	{
		type: 'observable',
		title: 'Observable',
		hostnames: ['observablehq.com'],
		width: 720,
		height: 500,
		doesResize: true,
		isAspectRatioLocked: false,
		backgroundColor: '#fff',
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(/^\/@([^/]+)\/([^/]+)\/?$/)) {
				return `${urlObj.origin}/embed${urlObj.pathname}?cell=*`
			}
			if (urlObj && urlObj.pathname.match(/^\/d\/([^/]+)\/?$/)) {
				const pathName = urlObj.pathname.replace(/^\/d/, '')
				return `${urlObj.origin}/embed${pathName}?cell=*`
			}

			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (urlObj && urlObj.pathname.match(/^\/embed\/@([^/]+)\/([^/]+)\/?$/)) {
				return `${urlObj.origin}${urlObj.pathname.replace('/embed', '')}#cell-*`
			}
			if (urlObj && urlObj.pathname.match(/^\/embed\/([^/]+)\/?$/)) {
				return `${urlObj.origin}${urlObj.pathname.replace('/embed', '/d')}#cell-*`
			}

			return
		},
	},
	{
		type: 'desmos',
		title: 'Desmos',
		hostnames: ['desmos.com'],
		width: 700,
		height: 450,
		doesResize: true,
		toEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (
				urlObj &&
				urlObj.hostname === 'www.desmos.com' &&
				urlObj.pathname.match(/^\/calculator\/([^/]+)\/?$/) &&
				urlObj.search === '' &&
				urlObj.hash === ''
			) {
				return `${url}?embed`
			}
			return
		},
		fromEmbedUrl: (url) => {
			const urlObj = safeParseUrl(url)
			if (
				urlObj &&
				urlObj.hostname === 'www.desmos.com' &&
				urlObj.pathname.match(/^\/calculator\/([^/]+)\/?$/) &&
				urlObj.search === '?embed' &&
				urlObj.hash === ''
			) {
				return url.replace('?embed', '')
			}
			return
		},
	},
] as const satisfies readonly EmbedDefinition[]

/** @public */
export type DefaultEmbedDefinitionType = (typeof DEFAULT_EMBED_DEFINITIONS)[number]['type']

const DEFAULT_EMBED_DEFINITION_TYPES = DEFAULT_EMBED_DEFINITIONS.map(
	(def) => def.type
) as DefaultEmbedDefinitionType[]

/** @public */
export function isDefaultEmbedDefintionType(type: string): type is DefaultEmbedDefinitionType {
	return DEFAULT_EMBED_DEFINITION_TYPES.includes(type as DefaultEmbedDefinitionType)
}

/** @public */
export function isCustomEmbedDefinition(
	def: EmbedDefinition | CustomEmbedDefinition
): def is CustomEmbedDefinition {
	return 'icon' in def
}
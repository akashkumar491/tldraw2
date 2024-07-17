export const cspDirectives: { [key: string]: string[] } = {
	'default-src': [`'self'`],
	'connect-src': [
		`'self'`,
		`ws:`,
		`wss:`,
		'blob:',
		'http://localhost:8788',
		`https://assets.tldraw.xyz`,
		`https://*.tldraw.workers.dev`,
		`https://*.ingest.sentry.io`,
	],
	'font-src': [`'self'`, `https://fonts.googleapis.com`, `https://fonts.gstatic.com`, 'data:'],
	'frame-src': [`https:`],
	'img-src': [`'self'`, `http:`, `https:`, `data:`, `blob:`],
	'media-src': [`'self'`, `http:`, `https:`, `data:`, `blob:`],
	'style-src': [`'self'`, `'unsafe-inline'`, `https://fonts.googleapis.com`],
	'style-src-elem': [`'self'`, `'unsafe-inline'`, `https://fonts.googleapis.com`],
	'report-uri': [process.env.SENTRY_CSP_REPORT_URI ?? ``],
}

export const csp = Object.keys(cspDirectives)
	.map((directive) => `${directive} ${cspDirectives[directive].join(' ')}`)
	.join('; ')

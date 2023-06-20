/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		scrollRestoration: true,
	},
	transpilePackages: ['@tldraw/utils'],
	async redirects() {
		return [
			{
				// For reverse compatibility with old links
				source: '/:sectionId/ucg/:articleId',
				destination: '/:sectionId/:articleId',
				permanent: true,
			},
			{
				// For reverse compatibility with old links
				source: '/docs/introduction',
				destination: '/introduction',
				permanent: true,
			},
			{
				// For reverse compatibility with old links
				source: '/docs/installation',
				destination: '/installation',
				permanent: true,
			},
			{
				// For reverse compatibility with old links
				source: '/docs/usage',
				destination: '/usage',
				permanent: true,
			},
		]
	},
}

module.exports = nextConfig

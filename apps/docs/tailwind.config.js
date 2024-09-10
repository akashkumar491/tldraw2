/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-geist-sans)'],
				mono: ['"Noto Sans Mono", monospace'],
				hand: ['var(--font-shantell-sans)'],
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
}

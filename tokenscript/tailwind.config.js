/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'ccPink': {
					light: '#DC79FF1A',
					dark: '#DC79FF',
					border: '#DC79FF80'
				},
				'ccPurple': {
					dark: '#6868FF'
				}
			},
			fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
			},
		},
	},
	plugins: []
};

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'ccBlack': {
					DEFAULT: '#2D2D2D',
				},
				'ccGray': {
					DEFAULT: '#707070',
					soft: '#E3E3E3',
				},
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

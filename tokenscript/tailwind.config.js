/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			backgroundImage: {
				'gradient-hover': 'linear-gradient(90deg, #6868FF 0%, #DC79FF 100%);',
				'gradient-press': 'linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), linear-gradient(90deg, #6868FF 0%, #DC79FF 100%)'
			},
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
					dark: '#6868FF',
					light: '#C4C4FF',
				},
				'ccRed': {
					DEFAULT: '#FF6868',
				}
			},
			fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
			},
		},
	},
	plugins: []
};

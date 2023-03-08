const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import("tailwindcss").Config} */
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', ...defaultTheme.fontFamily.sans]
			}
		}
	},

	plugins: []
};

module.exports = config;

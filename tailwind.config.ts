/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      colors: {
        'hoja-green': {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8fd18f',
          400: '#5bb55b',
          500: '#389738',
          600: '#2a7a2a',
          700: '#236223',
          800: '#1f4f1f',
          900: '#1a421a',
        },
        'hoja-orange': {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#f9d5bf',
          300: '#f4b993',
          400: '#ed8f5e',
          500: '#e67332',
          600: '#d75b28',
          700: '#b34925',
          800: '#8f3c25',
          900: '#743223',
        }
      }
    },
  },
  plugins: [],
}
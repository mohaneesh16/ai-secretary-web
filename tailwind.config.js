/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5f5f5',
          100: '#ebebeb',
          200: '#d6d6d6',
          300: '#b0b0b0',
          400: '#808080',
          500: '#505050',
          600: '#1a1a1a',
          700: '#111111',
          800: '#080808',
          900: '#000000',
        },
      },
    },
  },
  plugins: [],
}

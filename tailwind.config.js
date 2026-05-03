/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
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
      boxShadow: {
        'card':       '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        'modal':      '0 24px 64px -12px rgba(0,0,0,0.18)',
        'nav':        '0 2px 8px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '2xl':  '16px',
        '3xl':  '20px',
        '4xl':  '28px',
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight:   '-0.02em',
      },
    },
  },
  plugins: [],
}

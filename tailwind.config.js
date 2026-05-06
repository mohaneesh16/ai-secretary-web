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
        sandal: {
          DEFAULT: '#e8dcc4',
          dark:    '#cfc4a8',
          muted:   '#8a7a60',
          subtle:  '#4a4030',
          bg:      '#2a2620',
        },
        surface: {
          DEFAULT: '#111111',
          raised:  '#161616',
          high:    '#1e1e1e',
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

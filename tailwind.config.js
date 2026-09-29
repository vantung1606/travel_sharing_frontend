/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['12.5px', { lineHeight: '18px' }],
        'sm': ['16px', { lineHeight: '24px' }],
        'base': ['17.5px', { lineHeight: '26px' }],
        'lg': ['19.5px', { lineHeight: '28px' }],
        'xl': ['22px', { lineHeight: '30px' }],
        '2xl': ['26px', { lineHeight: '34px' }],
        '3xl': ['32px', { lineHeight: '38px' }],
        '4xl': ['40px', { lineHeight: '46px' }],
        '5xl': ['50px', { lineHeight: '56px' }],
      },
      colors: {
        oceanic: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#026aa7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        tealDeep: {
          800: '#0d5c75',
          900: '#083c4d',
        },
        coralSunset: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        darkSlate: {
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

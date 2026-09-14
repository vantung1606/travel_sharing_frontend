/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

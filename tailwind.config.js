/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['16px', { lineHeight: '22px' }],
        'sm': ['17px', { lineHeight: '25px' }],
        'base': ['18.5px', { lineHeight: '27px' }],
        'lg': ['20.5px', { lineHeight: '29px' }],
        'xl': ['23px', { lineHeight: '31px' }],
        '2xl': ['27px', { lineHeight: '35px' }],
        '3xl': ['33px', { lineHeight: '39px' }],
        '4xl': ['41px', { lineHeight: '47px' }],
        '5xl': ['52px', { lineHeight: '58px' }],
      },
      textColor: {
        slate: {
          900: '#000000', // Đen tuyền sắc nét nhất (Tiêu đề, tên tác giả, headline)
          800: '#090d16', // Đen đậm nét (Nội dung quan trọng, menu, button)
          700: '#111827', // Đen than rõ ràng (Nội dung bài viết, mô tả)
          600: '#1f2937', // Đen mềm tương phản cao (thay vì xám mờ)
          500: '#374151', // Xám than đậm đọc rõ từng chữ (thay vì xám mờ ảo)
          400: '#4b5563', // Chữ phụ, ngày giờ, nhãn phụ luôn sắc nét
        }
      },
      colors: {
        oceanic: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        emeraldDeep: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        forestDeep: {
          700: '#065f46',
          800: '#064e3b',
          900: '#022c22',
          950: '#011c15',
        },
        tealDeep: {
          800: '#064e3b',
          900: '#022c22',
        },
        sky: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        coralSunset: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
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

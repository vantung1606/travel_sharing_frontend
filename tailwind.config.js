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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sapphire: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
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
        sans: ['"Times New Roman"', 'Times', 'Georgia', 'serif'],
        serif: ['"Times New Roman"', 'Times', 'Georgia', 'serif'],
        display: ['"Times New Roman"', 'Times', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}

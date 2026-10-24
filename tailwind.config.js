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
        // ── Paper & Ink & Terracotta design system ─────────────────────────
        clay: {
          50: '#FBF2EC',
          100: '#F6E3D8',
          200: '#EFCDBC',
          300: '#E3AE95',
          400: '#D68C6C',
          500: '#C66A45',
          600: '#B0522F',
          700: '#93422A',
          800: '#783725',
          900: '#622E20',
          950: '#3B1A12',
        },
        ink: {
          50: '#F5F2EC',
          100: '#E8E3D9',
          200: '#CFC7B8',
          300: '#A79D8C',
          400: '#7A7164',
          500: '#565048',
          600: '#3D3830',
          700: '#2B271F',
          800: '#1E1A15',
          900: '#17130F',
          950: '#0F0C09',
        },
        oceanic: {
          50: '#FBF2EC',
          100: '#F6E3D8',
          200: '#EFCDBC',
          300: '#E3AE95',
          400: '#D68C6C',
          500: '#C66A45',
          600: '#B0522F',
          700: '#93422A',
          800: '#783725',
          900: '#622E20',
        },
        sapphire: {
          50: '#FBF2EC',
          100: '#F6E3D8',
          200: '#EFCDBC',
          300: '#E3AE95',
          400: '#D68C6C',
          500: '#C66A45',
          600: '#B0522F',
          700: '#93422A',
          800: '#783725',
          900: '#622E20',
        },
        sky: {
          50: '#FBF2EC',
          100: '#F6E3D8',
          200: '#EFCDBC',
          300: '#E3AE95',
          400: '#D68C6C',
          500: '#C66A45',
          600: '#B0522F',
          700: '#93422A',
          800: '#783725',
          900: '#622E20',
          950: '#3B1A12',
        },
        blue: {
          50: '#FBF2EC',
          100: '#F6E3D8',
          200: '#EFCDBC',
          300: '#E3AE95',
          400: '#D68C6C',
          500: '#C66A45',
          600: '#B0522F',
          700: '#93422A',
          800: '#783725',
          900: '#622E20',
        },
        indigo: {
          50: '#FBF2EC',
          100: '#F6E3D8',
          200: '#EFCDBC',
          300: '#E3AE95',
          400: '#D68C6C',
          500: '#C66A45',
          600: '#B0522F',
          700: '#93422A',
          800: '#783725',
          900: '#622E20',
        },
        cyan: {
          50: '#FBF2EC',
          100: '#F6E3D8',
          200: '#EFCDBC',
          300: '#E3AE95',
          400: '#D68C6C',
          500: '#C66A45',
          600: '#B0522F',
          700: '#93422A',
          800: '#783725',
          900: '#622E20',
        },
        coralSunset: {
          400: '#D68C6C',
          500: '#C66A45',
          600: '#B0522F',
        },
        darkSlate: {
          800: '#1E1A15',
          900: '#17130F',
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

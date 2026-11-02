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
        // ── Brand & Authentic Travel Palette ─────────────────────────
        clay: {
          50: '#FBF2EC',
          100: '#F6E3D8',
          200: '#EFCDBC',
          300: '#E3AE95',
          400: '#D68C6C',
          500: '#C66A45',
          600: 'var(--wf-primary, #0284c7)',
          700: 'var(--wf-primary-hover, #0369a1)',
          800: '#783725',
          900: '#622E20',
          950: '#3B1A12',
        },
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        oceanic: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        sapphire: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        coralSunset: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
        darkSlate: {
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

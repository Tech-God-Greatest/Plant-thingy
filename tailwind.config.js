/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        sage: {
          50: '#f6f7f5',
          100: '#e9ece6',
          200: '#d4dbcf',
          300: '#b6c3af',
          400: '#94a78c',
          500: '#758c6c',
          600: '#5c7054',
          700: '#4a5944',
          800: '#3d4938',
          900: '#343e31',
        },
        moss: {
          light: '#8ba888',
          DEFAULT: '#527953',
          dark: '#2d472c',
        },
        terracotta: {
          light: '#fcebe6',
          DEFAULT: '#e07a5f',
          dark: '#b55338',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5', // Primary indigo accent
          700: '#4338CA',
          800: '#3730A3',
        },
        skyAccent: '#0EA5E9',
        amberAccent: '#F59E0B',
        paperBg: '#F7F9FC',
        paperSurface: '#FFFFFF',
        paperText: '#172033',
        paperMuted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Bengali', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif']
      }
    },
  },
  plugins: [],
}

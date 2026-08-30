/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0071e3', // Apple Blue
          600: '#005bb5',
          700: '#004488',
        },
        dark: {
          bg: '#0c0e12',
          surface: '#14171f',
          card: '#1a1e29',
          border: '#262c3d',
          hover: '#222838'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'apple': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'apple-dark': '0 8px 30px rgba(0, 0, 0, 0.45)',
        'glow': '0 0 25px -5px rgba(0, 113, 227, 0.4)'
      }
    },
  },
  plugins: [],
}

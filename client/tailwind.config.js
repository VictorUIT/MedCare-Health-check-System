/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        },
        medical: {
          blue: '#0284c7',
          darkBlue: '#0f172a',
          teal: '#0d9488',
          emerald: '#059669',
          accent: '#3b82f6'
        }
      }
    },
  },
  plugins: [],
}

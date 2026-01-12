/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arkode: {
          orange: '#FF6C5D',
          'orange-dark': '#E5564A',
          'orange-light': '#FF8A7D',
          black: '#1A1A1A',
          white: '#FFFFFF',
          gray: '#F5F5F5',
          'gray-dark': '#666666',
          'gray-medium': '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

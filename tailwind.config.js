/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rover: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#F59E0B',
          danger: '#EF4444',
          success: '#10B981',
          warning: '#F59E0B',
          info: '#06B6D4'
        }
      }
    },
  },
  plugins: [],
}
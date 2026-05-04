/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ¡Verifica que esta línea sea igual!
  ],
  theme: {
    extend: {
      colors: {
        market: {
          green: '#1b8a3e',
          dark: '#0f5b29',
          yellow: '#facc15',
          orange: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}
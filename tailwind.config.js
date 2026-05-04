/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. Unificamos tus colores de marca
      colors: {
        market: {
          green: '#1b8a3e',
          dark: '#0f5b29',
          yellow: '#facc15',
          orange: '#f59e0b',
        },
      },
      // 2. Agregamos los movimientos (Keyframes)
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      // 3. Agregamos la clase de animación para usar en el HTML
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  // 4. Mantenemos tus plugins activos
  plugins: [
    require("tailwindcss-animate"),
  ],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ]
,
  theme: {
    extend: {
      keyframes: {
        fadeScaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%":   { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fadeScaleIn": "fadeScaleIn 0.12s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
      },
    },
  },
  plugins: [],
}


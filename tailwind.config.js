/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "intensity-1": "rgb(var(--intensity-1) / <alpha-value>)",
        "intensity-2": "rgb(var(--intensity-2) / <alpha-value>)",
        "intensity-3": "rgb(var(--intensity-3) / <alpha-value>)",
        "intensity-4": "rgb(var(--intensity-4) / <alpha-value>)",
        "intensity-5": "rgb(var(--intensity-5) / <alpha-value>)",
        "intensity-6": "rgb(var(--intensity-6) / <alpha-value>)",
        "intensity-7": "rgb(var(--intensity-7) / <alpha-value>)",
        "intensity-8": "rgb(var(--intensity-8) / <alpha-value>)",
        "intensity-9": "rgb(var(--intensity-9) / <alpha-value>)",
      }
    },
  },
  plugins: [require('tailwindcss-primeui')]
}


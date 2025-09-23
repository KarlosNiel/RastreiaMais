// frontend/tailwind.config.js
const { heroui } = require("@heroui/theme");

/** Tailwind v4: tokens principais devem viver no globals.css via @theme.
 *  Mantemos o necessário para scanning e plugin do HeroUI.
 */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css", // <- v4: apenas CSS aqui
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        brand: { DEFAULT: "#DF3800", primary: "#DF3800" },
        risk: { safe: "#25A05C", moderate: "#F2C94C", critical: "#B00020" },
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
      boxShadow: { soft: "0 6px 24px rgba(0,0,0,.06)" },
    },
  },
  plugins: [heroui()],
};

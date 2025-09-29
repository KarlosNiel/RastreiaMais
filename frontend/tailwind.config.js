// frontend/tailwind.config.js
const { heroui } = require("@heroui/theme");

/** Tailwind v4: tokens principais vivem no globals.css via @theme.
 *  Mantemos scanning + plugin do HeroUI com a cor primária da marca.
 */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css", // v4: CSS aqui
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
      // auxiliares próprias (opcional)
      colors: {
        brand: { DEFAULT: "#ec4d23", contrast: "#ffffff" }, // marca
        risk: { safe: "#25A05C", moderate: "#F2C94C", critical: "#B00020" },
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
      boxShadow: { soft: "0 6px 24px rgba(0,0,0,.06)" },
    },
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            // <Button color="primary" variant="solid"> => laranja com texto branco
            primary: { DEFAULT: "#ec4d23", foreground: "#ffffff" },
            focus: "#ec4d23",
          },
          layout: {
            radius: {
              small: "8px",
              medium: "12px",
              large: "16px",
            },
          },
        },
        dark: {
          colors: {
            primary: { DEFAULT: "#ec4d23", foreground: "#ffffff" },
            focus: "#ec4d23",
          },
          layout: {
            radius: {
              small: "8px",
              medium: "12px",
              large: "16px",
            },
          },
        },
      },
    }),
  ],
};

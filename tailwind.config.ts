/* eslint-disable @typescript-eslint/no-require-imports */
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        "source-sans-3": ["var(--font-source-sans-3)", ...fontFamily.sans],
        "playfair-display": [
          "var(--font-playfair-display)",
          ...fontFamily.sans,
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        green: "#4A5838",
        brown: {
          DEFAULT: "#6a573a", // Base color
          // Lightening shades
          "light-10": "#79684e", // slightly lighter
          "light-20": "#887961", // lighter
          "light-30": "#978975", // even lighter
          "light-40": "#a69889", // more light
          "light-50": "#b5a89d", // much lighter
          "light-60": "#c3bcb0", // very light
          "light-70": "#d2cdc4", // near white
          "light-80": "#e1ddd8", // almost white
          "light-90": "#f0eeeb", // very close to white
          white: "#ffffff", // pure white

          // Darkening shades
          "dark-10": "#5f4e34", // slightly darker
          "dark-20": "#55462e", // darker
          "dark-30": "#4a3d29", // more dark
          "dark-40": "#403423", // even darker
          "dark-50": "#352c1d", // much darker
          "dark-60": "#2a2317", // very dark
          "dark-70": "#201a11", // near black
          "dark-80": "#15110c", // almost black
          "dark-90": "#0b0906", // very close to black
          black: "#000000", // pure black
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

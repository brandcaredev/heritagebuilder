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
        green: {
          DEFAULT: "#4A5838",
          "2": "#6E7960",
          "3": "#343E27",
          "4": "#252C1C",
        },
        brown: {
          DEFAULT: "#6a573a",
          "2": "#A69A89",
          "3": "#403423",
          "4": "#201A11",
        },
        black: "#000000", // pure black
        white: "#ffffff", // pure white
        "white-2": "#EDEEEB",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

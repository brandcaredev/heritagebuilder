import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";

const { fontFamily } = defaultTheme;

export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
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
          "50": "#F0EEEB",
          "100": "#CBC4BA",
          "200": "#A69A89",
          "700": "#403423",
          "900": "#201A11",
        },
        black: "#000000",
        white: "#ffffff",
        "white-2": "#EDEEEB",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

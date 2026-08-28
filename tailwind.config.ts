import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2CC274',
          dark: '#1F9C59',
          light: '#E8F8F0'
        },
        dark: '#18191F',
        muted: '#474A57',
        surface: '#F7F9FA',
        sage: {
          DEFAULT: "#7D8B6A",
          50: "#EEF1EA",
          100: "#D4DCCA",
          200: "#B8C4A8",
          300: "#A8B496",
          400: "#94A57E",
          500: "#7D8B6A",
          600: "#6A7659",
          700: "#555F48",
          800: "#404837",
          900: "#2B3026",
        },
        cream: "#FAF8F5",
        charcoal: "#2C2C2C",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

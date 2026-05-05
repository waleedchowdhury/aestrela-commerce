import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b1f35",
        pearl: "#f7f3ec",
        porcelain: "#fbfaf7",
        champagne: "#c7a85f",
        graphite: "#222528",
        mist: "#e7e2d7"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Arial", "sans-serif"],
        editorial: ["var(--font-editorial)", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(11, 31, 53, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

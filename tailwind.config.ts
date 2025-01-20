import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-helvetica-neue)", "sans-serif"],
        ysabeau: ["var(--font-ysabeau)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1F4D3A",
        accent: "#F5A98A",
        background: "#FAF6F0",
        foreground: "#2A2A2A",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        hero: "0 24px 60px rgba(42, 42, 42, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;

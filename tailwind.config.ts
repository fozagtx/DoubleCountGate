import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#faf7f0",
        sheet: "#fffdf8",
        sand: "#f2ecdf",
        ink: "#1e1b16",
        lead: "#4a443b",
        mute: "#7a7266",
        line: "#e7dfcf",
        forest: "#1f4d3a",
        moss: "#e4eee5",
        tan: "#e2a65a",
        "tan-deep": "#cf9043",
        clay: "#b4432f",
        blush: "#f8e6df",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(30,27,22,0.04), 0 8px 24px -12px rgba(30,27,22,0.12)",
        lift: "0 1px 2px rgba(30,27,22,0.05), 0 24px 60px -24px rgba(30,27,22,0.25)",
      },
      maxWidth: {
        marketing: "1160px",
        desk: "880px",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f9f9f8",
        sheet: "#fdfdfc",
        sand: "#f1f0ef",
        ink: "#21201c",
        lead: "#46413e",
        mute: "#63635e",
        line: "#e9e8e6",
        forest: "#1f4d3a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "rgba(28,25,23,0.04) 0 1px 3px 0 inset, rgba(28,25,23,0.08) 0 2px 5px -2px, rgba(28,25,23,0.08) 0 6px 16px -8px",
        stage:
          "rgba(0,0,0,0.024) 0 1px 2px 0, rgba(0,0,0,0.055) 0 18px 44px 0, rgba(255,255,255,0.9) 0 1px 0 0 inset",
      },
      maxWidth: {
        marketing: "1120px",
        desk: "760px",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#efece4",
        sheet: "#f7f5f0",
        ink: "#1c1915",
        mute: "#5e584f",
        line: "#ddd6c8",
        forest: "#1e4636",
        moss: "#e5efe7",
        oxide: "#9c3418",
        clay: "#f6e6de",
      },
      fontFamily: {
        serif: ["Fraunces Variable", "Fraunces", "Iowan Old Style", "Palatino", "Georgia", "serif"],
        sans: ["Outfit Variable", "Outfit", "Avenir Next", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      maxWidth: {
        page: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;

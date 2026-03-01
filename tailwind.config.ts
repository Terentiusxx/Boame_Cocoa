import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#F4FAF4",
          dark: "#0a0a0a",
        },
        foreground: {
          DEFAULT: "#171717",
          dark: "#ededed",
        },
        primary: {
          green: "#2d7d32",
          "green-secondary": "#388e3c",
          "green-light": "#4caf50",
        },
        brand: {
          "text-titles": "#003300",
          "sub-text": "#707b81",
          "input-text": "#000000",
          buttons: "#1f4e20",
          hyperlink: "#0b539b",
          "sub-titles": "#1f4e20",
        },
        urgency: {
          high: "#ec221f",
          medium: "#bf6a02",
          low: "#4caf50",
        },
        gray: {
          bg: "#f5f5f5",
          "bg-dark": "#1a1a1a",
        },
        card: {
          bg: "#ffffff",
          "bg-dark": "#2a2a2a",
        },
      },
      borderRadius: {
        brand: "16px",
        "brand-sm": "12px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      maxWidth: {
        mobile: "375px",
      },
      boxShadow: {
        mobile: "0 0 20px rgba(0, 0, 0, 0.1)",
        card: "0 1px 3px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.15)",
        "scan-button": "0 4px 12px rgba(0, 0, 0, 0.15)",
        "nav-shadow": "0 -2px 10px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
  darkMode: ["class", ".dark"],
};

export default config;
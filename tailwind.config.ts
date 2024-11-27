import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#E2E8F0",
        input: "#F8FAFC",
        background: "#FFFFFF",
        foreground: "#0F172A",
        primary: "#4F46E5",
        "primary-hover": "#4338CA",
        secondary: "#F1F5F9",
        muted: "#64748B",
        accent: "#3730A3",
        "chat-blue": "#60A5FA",
        "sidebar-bg": "rgba(96, 165, 250, 0.1)",
        "model-hover": "rgba(96, 165, 250, 0.2)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      boxShadow: {
        custom: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
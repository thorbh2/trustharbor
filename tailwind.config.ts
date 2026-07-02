import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F8FA",
        surface: "#FFFFFF",
        text: "#111827",
        primary: "#0F766E",
        secondary: "#1F2937",
        accent: "#C2410C",
        success: "#15803D",
        danger: "#B91C1C",
        line: "#D7DEE8",
        muted: "#667085",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: { DEFAULT: "6px", md: "6px", lg: "8px" },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        pop: "0 12px 32px -10px rgba(16,24,40,0.22)",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(5px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulse2: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.45" } },
      },
      animation: { fadeUp: "fadeUp 0.25s ease-out", pulse2: "pulse2 1.6s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;

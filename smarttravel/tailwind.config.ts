import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1020",
        card: "#121A2F",
        card2: "#18213A",
        turq: "#5EEAD4",
        tech: "#38BDF8",
        ai: "#7C3AED",
        opp: "#22C55E",
        warn: "#F59E0B",
        danger: "#EF4444",
        ink: "#F8FAFC",
        muted: "#94A3B8",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: { xl2: "1.5rem" },
      backdropBlur: { xs: "2px" },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "none" } },
        ring: { "0%": { transform: "scale(1)", opacity: "0.7" }, "100%": { transform: "scale(3.4)", opacity: "0" } },
      },
      animation: { rise: "rise .7s cubic-bezier(.2,.7,.2,1) forwards", ring: "ring 1.8s ease-out infinite" },
    },
  },
  plugins: [],
};
export default config;

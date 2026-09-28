import type { Config } from "tailwindcss";
// @ts-ignore
import sharedConfig from "../../packages/ui/tailwind.config.js";

const config: Config = {
  ...sharedConfig,
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/stores/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/utils/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...(sharedConfig.theme?.extend ?? {}),
      container: {
        center: true,
        padding: "1rem",
        screens: { "2xl": "1400px" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        ...(sharedConfig.theme?.extend?.keyframes ?? {}),
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        ...(sharedConfig.theme?.extend?.animation ?? {}),
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
};

export default config;

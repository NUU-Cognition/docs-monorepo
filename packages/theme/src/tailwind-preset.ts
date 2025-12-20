import type { Config } from "tailwindcss";

/**
 * NUU Docs Tailwind Preset
 *
 * Provides consistent colors, fonts, and spacing across all doc sites.
 */
export const tailwindPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // NUU brand colors - placeholder
        nuu: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e",
        },
      },
      fontFamily: {
        // Will be configured with NUU fonts
      },
    },
  },
};

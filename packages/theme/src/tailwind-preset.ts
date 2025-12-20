import type { Config } from "tailwindcss";

/**
 * NUU Docs Tailwind Preset
 *
 * Provides consistent colors, fonts, and spacing across all doc sites.
 * Based on NUU brand guidelines.
 */
export const tailwindPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // NUU semantic colors (using OKLCH)
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "oklch(var(--border) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        brand: "oklch(var(--brand) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "10px",
        xl: "14px",
      },
    },
  },
};

/**
 * CSS custom properties for NUU theme
 * Include in your globals.css
 */
export const cssVariables = `
:root {
  --background: 1 0 0;
  --foreground: 0.145 0 0;
  --primary: 0.205 0 0;
  --primary-foreground: 0.985 0 0;
  --secondary: 0.97 0 0;
  --secondary-foreground: 0.205 0 0;
  --muted: 0.97 0 0;
  --muted-foreground: 0.556 0 0;
  --accent: 0.97 0 0;
  --accent-foreground: 0.205 0 0;
  --destructive: 0.577 0.245 27.325;
  --destructive-foreground: 0.985 0 0;
  --border: 0.922 0 0;
  --ring: 0.708 0 0;
  --brand: 0.623 0.214 259.815;
}

.dark {
  --background: 0.145 0 0;
  --foreground: 0.985 0 0;
  --primary: 0.985 0 0;
  --primary-foreground: 0.205 0 0;
  --secondary: 0.269 0 0;
  --secondary-foreground: 0.985 0 0;
  --muted: 0.269 0 0;
  --muted-foreground: 0.708 0 0;
  --accent: 0.269 0 0;
  --accent-foreground: 0.985 0 0;
  --destructive: 0.577 0.245 27.325;
  --destructive-foreground: 0.985 0 0;
  --border: 0.269 0 0;
  --ring: 0.556 0 0;
  --brand: 0.707 0.165 254.624;
}
`;

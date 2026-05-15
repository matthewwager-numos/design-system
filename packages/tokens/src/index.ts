/**
 * Token references — string values that resolve to the CSS variables in
 * tokens.css at runtime. Use these in inline styles, prop defaults, or
 * anywhere CSS variables work.
 *
 *   <div style={{ background: tokens.color.primary }} />
 *
 * The CSS file (`./tokens.css`) is the source of truth for the *values*.
 */

export const tokens = {
  color: {
    bg: "var(--color-bg)",
    fg: "var(--color-fg)",
    muted: "var(--color-muted)",
    border: "var(--color-border)",
    primary: "var(--color-primary)",
    primaryFg: "var(--color-primary-fg)",
    primaryHover: "var(--color-primary-hover)",
    accent: "var(--color-accent)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
  },
  space: {
    1: "var(--space-1)",
    2: "var(--space-2)",
    3: "var(--space-3)",
    4: "var(--space-4)",
    5: "var(--space-5)",
    6: "var(--space-6)",
    7: "var(--space-7)",
    8: "var(--space-8)",
  },
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    full: "var(--radius-full)",
  },
  font: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
  text: {
    xs: "var(--text-xs)",
    sm: "var(--text-sm)",
    base: "var(--text-base)",
    lg: "var(--text-lg)",
    xl: "var(--text-xl)",
    "2xl": "var(--text-2xl)",
    "3xl": "var(--text-3xl)",
  },
  motion: {
    easeOut: "var(--ease-out)",
    durationFast: "var(--duration-fast)",
    durationBase: "var(--duration-base)",
    durationSlow: "var(--duration-slow)",
  },
  shadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
  },
} as const;

export type Tokens = typeof tokens;

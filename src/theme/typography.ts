export const typography = {
  fonts: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 16,
    md: 18,
    lg: 20,
    xl: 22,
    xxl: 26,
    lowerThirdName: 38,
    titleCardHeading: 76,
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  letterSpacings: {
    tighter: "-0.03em",
    tight: "-0.02em",
    snug: "-0.01em",
    normal: "0em",
    wide: "0.05em",
    wider: "0.08em",
    widest: "0.1em",
  },
} as const;

export type Typography = typeof typography;

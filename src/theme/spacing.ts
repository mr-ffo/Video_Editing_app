export const spacing = {
  space: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
    massive: 60,
  },
  radii: {
    none: 0,
    xs: 3,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    card: 18,
    panel: 24,
    full: 9999,
  },
} as const;

export type Spacing = typeof spacing;

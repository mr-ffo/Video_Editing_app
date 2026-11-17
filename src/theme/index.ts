import { colors } from "./colors";
import { spacing } from "./spacing";
import { timing } from "./timing";
import { typography } from "./typography";

/**
 * Unified theme object designed for 100% backward compatibility
 * with existing components while exposing rich modular design tokens.
 */
export const theme = {
  // Existing flat structure preserved exactly
  colors: {
    primary: colors.primary,
    background: colors.background,
    text: colors.text,
    accent: colors.accent,
  },
  primary: colors.primary,
  background: colors.background,
  text: colors.text,
  accent: colors.accent,
  fontFamily: typography.fonts.sans,
  timing: {
    fadeIn: timing.fadeIn,
    slideIn: timing.slideIn,
    hold: timing.hold,
    fadeOut: timing.fadeOut,
  },

  // Extended design token modules
  colorTokens: colors,
  typographyTokens: typography,
  spacingTokens: spacing,
  timingTokens: timing,
} as const;

export type Theme = typeof theme;

// Named module exports
export { colors } from "./colors";
export type { Colors } from "./colors";
export { typography } from "./typography";
export type { Typography } from "./typography";
export { spacing } from "./spacing";
export type { Spacing } from "./spacing";
export { timing } from "./timing";
export type { Timing } from "./timing";

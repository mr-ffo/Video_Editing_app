export const colors = {
  // Brand Base Palette (preserves existing brand identity)
  primary: "#2563eb", // Primary blue
  background: "#1a1a2e", // Dark navy background
  text: "#ffffff", // Pure white
  accent: "#f59e0b", // Gold accent

  // Brand Extended Palette
  brand: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    secondary: "#3b82f6",
    accent: "#f59e0b",
    accentHover: "#d97706",
  },

  // Surfaces & Glassmorphism
  surfaces: {
    background: "#1a1a2e",
    surfaceDark: "#0f172a",
    glass: "rgba(26, 26, 46, 0.82)",
    glassLight: "rgba(30, 41, 59, 0.7)",
    nodeCard: "rgba(15, 23, 42, 0.9)",
  },

  // Typography Colors
  typography: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.82)",
    muted: "rgba(255, 255, 255, 0.6)",
    dim: "rgba(255, 255, 255, 0.4)",
    accent: "#f59e0b",
    primaryAccent: "#2563eb",
  },

  // Borders & Dividers
  borders: {
    subtle: "rgba(255, 255, 255, 0.15)",
    glass: "rgba(255, 255, 255, 0.12)",
    primary: "rgba(37, 99, 235, 0.4)",
    accent: "rgba(245, 158, 11, 0.5)",
  },

  // Shadows & Ambient Glows
  shadows: {
    panel: "0 30px 60px rgba(0, 0, 0, 0.65)",
    card: "0 10px 25px rgba(0, 0, 0, 0.5)",
    lowerThird: "0 20px 45px rgba(0, 0, 0, 0.6)",
    glowPrimary: "rgba(37, 99, 235, 0.25)",
    glowAccent: "rgba(245, 158, 11, 0.5)",
  },

  // Status indicators
  status: {
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#38bdf8",
  },
} as const;

export type Colors = typeof colors;

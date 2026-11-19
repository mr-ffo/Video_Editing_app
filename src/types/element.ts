export interface ElementTransform {
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number; // in degrees (-180 to 180)
  scale?: number; // 0.1 to 3.0
  opacity?: number; // 0 to 1
  aspectRatioLocked?: boolean;
  borderRadius?: number;
  shadow?: string;
  zIndex?: number;
  locked?: boolean;
  hidden?: boolean;
}

export type TypographyPreset =
  | "technical-title"
  | "section-heading"
  | "subtitle"
  | "body"
  | "code-label"
  | "metric-value"
  | "callout"
  | "caption"
  | "custom";

export interface ElementTypography {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  color: string;
  align?: "left" | "center" | "right";
  textAlign?: "left" | "center" | "right";
  letterSpacing?: number | string;
  lineHeight?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  preset?: TypographyPreset;
  shadow?: boolean;
}

export type AnimationType =
  | "none"
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-out"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down"
  | "scale"
  | "zoom"
  | "reveal"
  | "typewriter"
  | "flip"
  | "wipe";

export interface ElementAnimationConfig {
  entrance: AnimationType;
  exit: AnimationType;
  durationInFrames?: number;
  durationFrames?: number;
  delayFrames: number;
  easing?: "spring" | "linear" | "ease-out" | "ease-in-out";
}

export interface SceneElementLayer {
  id: string;
  name: string;
  type: "text" | "container" | "video" | "node" | "group" | "shape";
  transform: ElementTransform;
  typography?: ElementTypography;
  animation?: ElementAnimationConfig;
  locked?: boolean;
  hidden?: boolean;
}

export type AlignmentType =
  | "left"
  | "center-h"
  | "right"
  | "top"
  | "center-v"
  | "bottom"
  | "distribute-h"
  | "distribute-v"
  | "center-canvas";

export interface SnappingGuide {
  orientation: "horizontal" | "vertical";
  position: number; // canvas pixel position
  label?: string;
}

export const SUPPORTED_FONTS = [
  { name: "Inter", value: "Inter, sans-serif", category: "sans" },
  { name: "JetBrains Mono", value: "'JetBrains Mono', monospace", category: "mono" },
  { name: "Space Grotesk", value: "'Space Grotesk', sans-serif", category: "display" },
  { name: "Fira Code", value: "'Fira Code', monospace", category: "mono" },
  { name: "Roboto Mono", value: "'Roboto Mono', monospace", category: "mono" },
];

export const TYPOGRAPHY_PRESETS: Record<TypographyPreset, ElementTypography> = {
  "technical-title": {
    fontFamily: "Inter, sans-serif",
    fontSize: 56,
    fontWeight: 900,
    color: "#ffffff",
    align: "center",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    textTransform: "none",
    preset: "technical-title",
    shadow: true,
  },
  "section-heading": {
    fontFamily: "Inter, sans-serif",
    fontSize: 38,
    fontWeight: 800,
    color: "#f8fafc",
    align: "left",
    letterSpacing: "-0.02em",
    lineHeight: 1.3,
    textTransform: "none",
    preset: "section-heading",
  },
  subtitle: {
    fontFamily: "Inter, sans-serif",
    fontSize: 24,
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.75)",
    align: "center",
    letterSpacing: "-0.01em",
    lineHeight: 1.4,
    textTransform: "none",
    preset: "subtitle",
  },
  body: {
    fontFamily: "Inter, sans-serif",
    fontSize: 18,
    fontWeight: 400,
    color: "rgba(255, 255, 255, 0.85)",
    align: "left",
    letterSpacing: "0em",
    lineHeight: 1.6,
    textTransform: "none",
    preset: "body",
  },
  "code-label": {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    fontWeight: 600,
    color: "#38bdf8",
    align: "left",
    letterSpacing: "0.02em",
    lineHeight: 1.4,
    textTransform: "none",
    preset: "code-label",
  },
  "metric-value": {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 48,
    fontWeight: 800,
    color: "#60a5fa",
    align: "center",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    textTransform: "none",
    preset: "metric-value",
  },
  callout: {
    fontFamily: "Inter, sans-serif",
    fontSize: 22,
    fontWeight: 600,
    color: "#10b981",
    align: "center",
    letterSpacing: "-0.01em",
    lineHeight: 1.5,
    textTransform: "none",
    preset: "callout",
  },
  caption: {
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.5)",
    align: "center",
    letterSpacing: "0.05em",
    lineHeight: 1.4,
    textTransform: "uppercase",
    preset: "caption",
  },
  custom: {
    fontFamily: "Inter, sans-serif",
    fontSize: 20,
    fontWeight: 500,
    color: "#ffffff",
    align: "left",
    letterSpacing: "0em",
    lineHeight: 1.4,
    textTransform: "none",
    preset: "custom",
  },
};

import type { EasingFunction } from "remotion";

export interface SpringPhysicsConfig {
  damping: number;
  mass: number;
  stiffness: number;
  overshootClamping?: boolean;
}

export type SpringPresetName = "snappy" | "bouncy" | "smooth" | "heavy" | "gentle";

export interface TimingTokens {
  fadeIn: number;
  slideIn: number;
  hold: number;
  fadeOut: number;
  staggerFast: number;
  staggerMedium: number;
  staggerSlow: number;
}

export interface FadeAnimationOptions {
  fadeInFrames?: number;
  fadeOutFrames?: number;
  totalDuration?: number;
  initialOpacity?: number;
  targetOpacity?: number;
  easing?: EasingFunction;
}

export interface SlideAnimationOptions {
  slideInFrames?: number;
  slideOutFrames?: number;
  totalDuration?: number;
  startDistance?: number;
  exitDistance?: number;
  easing?: EasingFunction;
}

export interface ScaleAnimationOptions {
  scaleInFrames?: number;
  totalDuration?: number;
  initialScale?: number;
  targetScale?: number;
  springConfig?: SpringPhysicsConfig;
}

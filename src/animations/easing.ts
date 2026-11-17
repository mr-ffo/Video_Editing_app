import { Easing, type EasingFunction } from "remotion";

/**
 * Standard cubic bezier curves for smooth and predictable motion
 */
export const easings: Record<string, EasingFunction> = {
  // Standard motion curve used across syntax-ops-graphics
  standard: Easing.bezier(0.16, 1, 0.3, 1),

  // Fast acceleration out of rest, gentle deceleration into rest
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),

  // Gradual start, rapid exit
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),

  // Snappy transition
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
};

export const standardEase = easings.standard;

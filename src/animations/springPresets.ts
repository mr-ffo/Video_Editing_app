import { spring } from "remotion";
import type { SpringPhysicsConfig, SpringPresetName } from "../types/animation";

/**
 * Standardized spring physics configurations matching existing motion characteristics
 */
export const springPresets: Record<SpringPresetName, SpringPhysicsConfig> = {
  // Snappy: fast response with subtle overshoot bounce (used in CloudDiagram nodes)
  snappy: {
    damping: 11,
    mass: 0.8,
    stiffness: 120,
  },
  // Bouncy: energetic scale pop with clear bounce (used in TitleCard)
  bouncy: {
    damping: 11,
    mass: 0.8,
    stiffness: 100,
  },
  // Smooth: broadcast transition with controlled settle (used in VideoOverlay split-screen)
  smooth: {
    damping: 14,
    mass: 1.0,
    stiffness: 100,
  },
  // Heavy: substantial weight with slow recovery
  heavy: {
    damping: 18,
    mass: 1.5,
    stiffness: 80,
  },
  // Gentle: soft, subtle push without overshoot
  gentle: {
    damping: 20,
    mass: 1.0,
    stiffness: 60,
  },
};

export interface CalculateSpringOptions {
  frame: number;
  fps: number;
  preset?: SpringPresetName;
  config?: Partial<SpringPhysicsConfig>;
  delay?: number;
  from?: number;
  to?: number;
}

/**
 * Deterministic helper to calculate spring value using a standardized preset
 */
export const calculateSpring = ({
  frame,
  fps,
  preset = "smooth",
  config,
  delay = 0,
  from = 0,
  to = 1,
}: CalculateSpringOptions): number => {
  const baseConfig = springPresets[preset];
  const finalConfig: SpringPhysicsConfig = {
    ...baseConfig,
    ...config,
  };

  return spring({
    frame,
    fps,
    delay,
    from,
    to,
    config: finalConfig,
  });
};

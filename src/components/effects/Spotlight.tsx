import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { standardEase } from "../../animations/easing";

export interface SpotlightProps {
  x?: number | string; // e.g. "50%" or 960
  y?: number | string; // e.g. "35%" or 300
  radius?: number; // e.g. 180
  intensity?: number; // 0 to 1 (default 0.75 dim)
  startFrame?: number;
  durationInFrames?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  style?: React.CSSProperties;
}

/**
 * Reusable spotlight overlay that dims surrounding composition elements
 * while illuminating a focused focal point or architecture node.
 */
export const Spotlight: React.FC<SpotlightProps> = ({
  x = "50%",
  y = "40%",
  radius = 220,
  intensity = 0.72,
  startFrame = 0,
  durationInFrames = 150,
  fadeInFrames = 15,
  fadeOutFrames = 15,
  style,
}) => {
  const currentFrame = useCurrentFrame();
  const localFrame = currentFrame - startFrame;

  if (localFrame < 0 || localFrame > durationInFrames) {
    return null;
  }

  const fadeOutStart = durationInFrames - fadeOutFrames;

  const opacity = interpolate(
    localFrame,
    [0, fadeInFrames, fadeOutStart, durationInFrames],
    [0, intensity, intensity, 0],
    {
      easing: standardEase,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(circle at ${x} ${y}, transparent 0px, transparent ${radius}px, rgba(0, 0, 0, ${opacity}) ${radius + 120}px)`,
        ...style,
      }}
    />
  );
};

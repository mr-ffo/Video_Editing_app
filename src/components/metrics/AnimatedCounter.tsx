import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { standardEase } from "../../animations/easing";

export interface AnimatedCounterProps {
  from?: number;
  to: number;
  startFrame?: number;
  durationInFrames?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formatter?: (val: number) => string;
  style?: React.CSSProperties;
}

/**
 * Deterministic frame-based animated counter.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  startFrame = 0,
  durationInFrames = 45,
  prefix = "",
  suffix = "",
  decimals = 0,
  formatter,
  style,
}) => {
  const currentFrame = useCurrentFrame();
  const localFrame = currentFrame - startFrame;

  const numericValue = interpolate(
    localFrame,
    [0, durationInFrames],
    [from, to],
    {
      easing: standardEase,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const formattedNumber = formatter
    ? formatter(numericValue)
    : decimals > 0
      ? numericValue.toFixed(decimals)
      : Math.round(numericValue).toLocaleString();

  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

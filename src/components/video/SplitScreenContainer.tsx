import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { calculateSpring } from "../../animations/springPresets";
import type { SplitScreenMode, SplitScreenInterval } from "../../types/timeline";

export interface SplitScreenContainerProps {
  children: React.ReactNode;
  startFrame?: number;
  mode?: SplitScreenMode;
  targetScale?: number;
  translateY?: number;
  translateX?: number;
  damping?: number;
  borderRadius?: number;
  shadow?: string;
  style?: React.CSSProperties;
  /**
   * Optional frame at which the split-screen springs back to full-screen.
   * If omitted the container stays in split position until composition end.
   */
  restoreFrame?: number;
  /**
   * Optional array of multiple split-screen intervals across long videos.
   * If provided, orchestrates multiple split-screen sessions across the timeline.
   */
  intervals?: SplitScreenInterval[];
}

/**
 * Reusable video container that animates between full-screen and broadcast split-screen modes.
 * Default configuration exactly matches the Phase 3 / Phase 4 baseline bottom split.
 * Supports multi-interval split-screen sessions across 1-5 minute timelines.
 */
export const SplitScreenContainer: React.FC<SplitScreenContainerProps> = ({
  children,
  startFrame = 0,
  mode = "bottom",
  targetScale,
  translateY,
  translateX,
  damping = 14,
  borderRadius,
  shadow,
  style,
  restoreFrame,
  intervals,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve active intervals
  const activeIntervals: SplitScreenInterval[] =
    intervals && intervals.length > 0
      ? intervals
      : [{ startFrame, restoreFrame: restoreFrame ?? 999999, mode }];

  let activeMode = mode;
  let netProgress = 0;

  for (const interval of activeIntervals) {
    const enterProgress = calculateSpring({
      frame: frame - interval.startFrame,
      fps,
      preset: "smooth",
      config: { damping },
    });

    const exitProgress =
      interval.restoreFrame !== undefined
        ? calculateSpring({
            frame: frame - interval.restoreFrame,
            fps,
            preset: "smooth",
            config: { damping },
          })
        : 0;

    const intervalProgress = interpolate(
      enterProgress - exitProgress,
      [0, 1],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    if (intervalProgress > 0.001) {
      netProgress = Math.max(netProgress, intervalProgress);
      if (interval.mode) {
        activeMode = interval.mode;
      }
    }
  }

  const progress = netProgress;

  // Mode-specific configuration defaults
  let defaultScale = 0.7;
  let defaultY = 0;
  let defaultX = 0;

  switch (activeMode) {
    case "bottom":
      defaultScale = 0.7;
      defaultY = 250;
      defaultX = 0;
      break;
    case "top":
      defaultScale = 0.7;
      defaultY = -250;
      defaultX = 0;
      break;
    case "left":
      defaultScale = 0.65;
      defaultX = -320;
      defaultY = 0;
      break;
    case "right":
      defaultScale = 0.65;
      defaultX = 320;
      defaultY = 0;
      break;
    case "pip":
      defaultScale = 0.35;
      defaultX = 550;
      defaultY = 300;
      break;
    case "focus":
      defaultScale = 0.9;
      defaultY = 50;
      defaultX = 0;
      break;
  }

  const resolvedTargetScale = targetScale ?? defaultScale;
  const resolvedTranslateY = translateY ?? defaultY;
  const resolvedTranslateX = translateX ?? defaultX;

  const currentScale = interpolate(progress, [0, 1], [1, resolvedTargetScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const currentTranslateY = interpolate(
    progress,
    [0, 1],
    [0, resolvedTranslateY],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const currentTranslateX = interpolate(
    progress,
    [0, 1],
    [0, resolvedTranslateX],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const resolvedRadius = borderRadius
    ? interpolate(progress, [0, 1], [0, borderRadius], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : undefined;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${currentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`,
        borderRadius: resolvedRadius,
        boxShadow: progress > 0.05 && shadow ? shadow : undefined,
        overflow: resolvedRadius ? "hidden" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

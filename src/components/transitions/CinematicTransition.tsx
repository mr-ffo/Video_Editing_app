import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { standardEase } from "../../animations/easing";
import { calculateSpring } from "../../animations/springPresets";
import type { SpringPresetName } from "../../types/animation";

export type TransitionType =
  | "fade"
  | "slide"
  | "scale"
  | "zoom"
  | "wipe";

export type TransitionDirection = "left" | "right" | "top" | "bottom";

export interface CinematicTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  direction?: TransitionDirection;
  springPreset?: SpringPresetName;
  durationInFrames?: number;
  delay?: number;
  exitDurationFrames?: number;
  style?: React.CSSProperties;
}

/**
 * Reusable cinematic transition wrapper supporting fade, slide, scale, and wipe
 * driven strictly by Remotion frame interpolation and spring physics.
 */
export const CinematicTransition: React.FC<CinematicTransitionProps> = ({
  children,
  type = "fade",
  direction = "left",
  springPreset,
  durationInFrames = 20,
  delay = 0,
  exitDurationFrames = 15,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: totalDuration, fps } = useVideoConfig();

  const localFrame = frame - delay;
  const exitStart = totalDuration - exitDurationFrames;

  // Entrance progress [0, 1]
  const entranceProgress = springPreset
    ? calculateSpring({
        frame: localFrame,
        fps,
        preset: springPreset,
      })
    : interpolate(localFrame, [0, durationInFrames], [0, 1], {
        easing: standardEase,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  // Exit progress [0, 1]
  const exitProgress = interpolate(
    frame,
    [exitStart, totalDuration],
    [0, 1],
    {
      easing: standardEase,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  let transform = "";
  let opacity = 1;
  let clipPath: string | undefined = undefined;

  switch (type) {
    case "fade":
      opacity = interpolate(
        frame,
        [delay, delay + durationInFrames, exitStart, totalDuration],
        [0, 1, 1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );
      break;

    case "scale":
    case "zoom": {
      const scaleVal = interpolate(entranceProgress, [0, 1], [0.85, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const exitScale = interpolate(exitProgress, [0, 1], [1, 0.95], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      transform = `scale(${scaleVal * exitScale})`;
      opacity = interpolate(
        frame,
        [delay, delay + durationInFrames, exitStart, totalDuration],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      break;
    }

    case "slide": {
      const offset = 120;
      let startX = 0;
      let startY = 0;
      if (direction === "left") startX = -offset;
      if (direction === "right") startX = offset;
      if (direction === "top") startY = -offset;
      if (direction === "bottom") startY = offset;

      const currentX = interpolate(entranceProgress, [0, 1], [startX, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const currentY = interpolate(entranceProgress, [0, 1], [startY, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

      transform = `translate(${currentX}px, ${currentY}px)`;
      opacity = interpolate(
        frame,
        [delay, delay + durationInFrames, exitStart, totalDuration],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      break;
    }

    case "wipe": {
      const wipePercent = entranceProgress * 100;
      clipPath = `polygon(0% 0%, ${wipePercent}% 0%, ${wipePercent}% 100%, 0% 100%)`;
      break;
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        opacity,
        transform: transform || undefined,
        clipPath,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

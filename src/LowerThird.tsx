import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "./theme";

export type LowerThirdProps = {
  name?: string;
  title?: string;
};

export const LowerThird: React.FC<LowerThirdProps> = ({
  name = "Folarin Favour Olaoluwapo",
  title = "Cloud Engineer",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeOutStart = durationInFrames - theme.timing.fadeOut;

  const opacity = interpolate(
    frame,
    [0, theme.timing.fadeIn, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const translateX = interpolate(
    frame,
    [0, theme.timing.slideIn, fadeOutStart, durationInFrames],
    [-120, 0, 0, -60],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Pulsing "live" indicator: breathes on a 45-frame sine cycle
  const dotPulse = (Math.sin((frame / 45) * Math.PI * 2) + 1) / 2;
  const dotOpacity = interpolate(dotPulse, [0, 1], [0.45, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotScale = interpolate(dotPulse, [0, 1], [0.85, 1.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "flex-start",
        paddingLeft: 120,
        paddingBottom: 100,
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          opacity,
          transform: `translateX(${translateX}px)`,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: theme.colors.background,
          border: `1px solid rgba(37, 99, 235, 0.4)`,
          boxShadow: `0 20px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(37, 99, 235, 0.25)`,
        }}
      >
        {/* Colored accent bar */}
        <div
          style={{
            width: 10,
            backgroundColor: theme.colors.accent,
            flexShrink: 0,
          }}
        />

        {/* Content */}
        <div
          style={{
            padding: "24px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: theme.colors.text,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* Pulsing live indicator dot */}
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: theme.colors.accent,
                display: "inline-block",
                opacity: dotOpacity,
                transform: `scale(${dotScale})`,
                boxShadow: `0 0 6px rgba(245, 158, 11, ${dotOpacity * 0.8})`,
              }}
            />
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: theme.colors.primary,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {title}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

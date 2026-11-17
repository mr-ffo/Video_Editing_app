import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "./theme";

export type TitleCardProps = {
  title?: string;
};

export const TitleCard: React.FC<TitleCardProps> = ({
  title = "Behind The Cloud",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Subtle overshoot bounce effect via spring
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 11,
      mass: 0.8,
      stiffness: 100,
    },
  });

  // Accent bar reveal: starts after the title has sprung in (~12 frames)
  const barSpring = spring({
    frame: frame - 12,
    fps,
    config: {
      damping: 14,
      mass: 1,
      stiffness: 120,
    },
  });

  const barWidth = interpolate(barSpring, [0, 1], [0, 140], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barOpacity = interpolate(frame, [12, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cinematic letter-spacing: animates from wide (0.1em) → tight (-0.03em) as title settles
  const letterSpacing = interpolate(
    scale,
    [0, 0.6, 1],
    ["0.1em", "0.02em", "-0.03em"],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

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

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.background,
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.18) 0%, ${theme.colors.background} 70%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: theme.fontFamily,
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${scale})`,
        }}
      >
        {/* Centered Heading */}
        <h1
          style={{
            margin: 0,
            fontSize: 76,
            fontWeight: 800,
            color: theme.colors.text,
            letterSpacing,
            textAlign: "center",
            textShadow: `0 4px 20px rgba(0, 0, 0, 0.4)`,
          }}
        >
          {title}
        </h1>

        {/* Accent Bar — spring-driven reveal after title settles */}
        <div
          style={{
            marginTop: 24,
            width: barWidth,
            height: 6,
            borderRadius: 3,
            opacity: barOpacity,
            backgroundColor: theme.colors.accent,
            boxShadow: `0 0 18px rgba(245, 158, 11, 0.5), 0 0 6px ${theme.colors.primary}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

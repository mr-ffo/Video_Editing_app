import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { calculateSpring } from "../../animations/springPresets";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import type { KeywordPosition } from "../../types/callout";
import { resolveKeyword } from "./keywordDictionary";

export interface KeywordCalloutProps {
  keyword: string;
  customLabel?: string;
  customIcon?: string;
  badge?: string;
  color?: string;
  position?: KeywordPosition;
  stackOffsetIndex?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
}

/**
 * Animated Kinetic Keyword Callout.
 * Pops onto the screen when key technical terms are spoken with icon,
 * category badge, spring entrance, and idle breathing drift.
 */
export const KeywordCallout: React.FC<KeywordCalloutProps> = ({
  keyword,
  customLabel,
  customIcon,
  badge: customBadge,
  color: customColor,
  position = { x: "72%", y: "24%" },
  stackOffsetIndex = 0,
  durationInFrames: customDuration,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: configDuration } = useVideoConfig();

  const totalDuration = customDuration ?? configDuration ?? 75;
  const exitFrames = 15;
  const exitStart = totalDuration - exitFrames;

  // Resolve dictionary definition
  const def = resolveKeyword(keyword);
  const label = customLabel ?? def.label;
  const icon = customIcon ?? def.icon;
  const badge = customBadge ?? def.badge;
  const accentColor = customColor ?? def.color;

  // 1. Entrance spring physics (scale & horizontal pop)
  const enterSpring = calculateSpring({
    frame,
    fps,
    preset: "snappy",
  });

  const scaleEnter = interpolate(enterSpring, [0, 1], [0.65, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slideX = interpolate(enterSpring, [0, 1], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 2. Idle harmonic float (gentle 3px vertical drift)
  const idleFloatY = Math.sin((frame / 36) * Math.PI * 2) * 3;

  // 3. Smooth exit transition (fade out and scale down)
  const exitProgress = interpolate(frame, [exitStart, totalDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(
    frame,
    [0, 8, exitStart, totalDuration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const finalScale = scaleEnter * (1 - exitProgress * 0.12);

  // Stack offset calculation (stagger vertically if multiple callouts are concurrent)
  const stackOffsetPx = stackOffsetIndex * 76;

  const posX = position.x ?? "72%";
  const posY =
    typeof position.y === "number"
      ? position.y + stackOffsetPx + idleFloatY
      : `calc(${position.y ?? "24%"} + ${stackOffsetPx + idleFloatY}px)`;

  return (
    <div
      style={{
        position: "absolute",
        left: posX,
        top: posY,
        opacity,
        transform: `translate(${slideX}px, 0px) scale(${finalScale})`,
        zIndex: 50 + stackOffsetIndex,
        pointerEvents: "none",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 18px 10px 12px",
          backgroundColor: "rgba(15, 23, 42, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 14,
          border: `1px solid rgba(255, 255, 255, 0.14)`,
          borderLeft: `4px solid ${accentColor}`,
          boxShadow: `0 14px 30px rgba(0, 0, 0, 0.55), 0 0 20px ${accentColor}33`,
          fontFamily: typography.fonts.sans,
          minWidth: 200,
        }}
      >
        {/* Animated Icon Container */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            backgroundColor: `${accentColor}1a`,
            border: `1px solid ${accentColor}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            boxShadow: `0 0 12px ${accentColor}33`,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        {/* Content & Badge */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {badge && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: accentColor,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {badge}
            </span>
          )}
          <span
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: colors.typography.primary,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

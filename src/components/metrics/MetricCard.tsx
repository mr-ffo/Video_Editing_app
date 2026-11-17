import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { AnimatedCounter, type AnimatedCounterProps } from "./AnimatedCounter";

export interface MetricCardProps extends AnimatedCounterProps {
  label: string;
  sublabel?: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  width?: number | string;
  variant?: "primary" | "accent" | "success" | "warning";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  sublabel,
  icon,
  trend,
  trendLabel,
  width = 260,
  variant = "primary",
  from = 0,
  to,
  startFrame = 0,
  durationInFrames = 45,
  prefix,
  suffix,
  decimals = 0,
  formatter,
  style,
}) => {
  const currentFrame = useCurrentFrame();
  const localFrame = currentFrame - startFrame;

  const cardOpacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardScale = interpolate(localFrame, [0, 15], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isAccent = variant === "accent";
  const isSuccess = variant === "success";

  const borderColor = isSuccess
    ? colors.status.success
    : isAccent
      ? colors.brand.accent
      : colors.borders.primary;

  const glowColor = isSuccess
    ? "rgba(16, 185, 129, 0.25)"
    : isAccent
      ? colors.shadows.glowAccent
      : colors.shadows.glowPrimary;

  return (
    <div
      style={{
        width,
        padding: "18px 24px",
        backgroundColor: colors.surfaces.nodeCard,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        boxShadow: `0 15px 35px rgba(0, 0, 0, 0.5), 0 0 20px ${glowColor}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        fontFamily: typography.fonts.sans,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.typography.muted,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: colors.typography.primary,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        <AnimatedCounter
          from={from}
          to={to}
          startFrame={startFrame + 5}
          durationInFrames={durationInFrames}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          formatter={formatter}
        />
      </div>

      {(sublabel || trendLabel) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginTop: 2 }}>
          {trend && (
            <span
              style={{
                color: trend === "up" ? colors.status.success : trend === "down" ? colors.status.danger : colors.typography.muted,
                fontWeight: 700,
              }}
            >
              {trend === "up" ? "▲" : trend === "down" ? "▼" : "•"}
            </span>
          )}
          {trendLabel && (
            <span
              style={{
                color: trend === "up" ? colors.status.success : colors.typography.muted,
                fontWeight: 600,
              }}
            >
              {trendLabel}
            </span>
          )}
          {sublabel && <span style={{ color: colors.typography.dim }}>{sublabel}</span>}
        </div>
      )}
    </div>
  );
};

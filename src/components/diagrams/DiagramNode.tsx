import React from "react";
import { interpolate } from "remotion";
import { calculateSpring } from "../../animations/springPresets";
import { colors } from "../../theme/colors";
import { timing } from "../../theme/timing";
import type { DiagramNode as IDiagramNode } from "../../types/diagram";
import { type CloudProviderId, getProviderTheme } from "./providerRegistry";

export interface DiagramNodeProps {
  node: IDiagramNode;
  frame: number;
  fps?: number;
  defaultDelay?: number;
  style?: React.CSSProperties;
}

export const DiagramNode: React.FC<DiagramNodeProps> = ({
  node,
  frame,
  fps = timing.fps,
  defaultDelay = 15,
  style,
}) => {
  const delay = node.delayFrames ?? defaultDelay;

  // Spring pop-in animation
  const scale = calculateSpring({
    frame,
    fps,
    delay,
    preset: "snappy",
  });

  const opacity = interpolate(frame, [delay, delay + 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Provider theme resolution
  const providerTheme = node.provider
    ? getProviderTheme(node.provider as CloudProviderId)
    : undefined;

  // Variant styling
  const variant = node.variant ?? (node.type === "storage" ? "accent" : "primary");
  const isAccent = variant === "accent";
  const isHighlighted = node.highlighted;

  let borderColor: string = isHighlighted
    ? colors.brand.accent
    : isAccent
      ? colors.borders.accent
      : colors.borders.primary;

  let glowColor: string = isHighlighted
    ? colors.shadows.glowAccent
    : isAccent
      ? colors.shadows.glowAccent
      : colors.shadows.glowPrimary;

  let subtitleColor: string = isAccent ? colors.brand.accent : colors.brand.primary;

  if (providerTheme) {
    borderColor = providerTheme.borderColor;
    glowColor = providerTheme.glowColor;
    subtitleColor = providerTheme.primaryColor;
  }

  // Status color
  const statusColors = {
    healthy: colors.status.success,
    active: colors.status.success,
    warning: colors.status.warning,
    error: colors.status.danger,
    offline: colors.typography.muted,
  };

  const isPositioned = node.position?.x !== undefined || node.position?.y !== undefined;

  return (
    <div
      style={{
        position: isPositioned ? "absolute" : undefined,
        left: node.position?.x,
        top: node.position?.y,
        transform: `scale(${isHighlighted ? scale * 1.04 : scale})`,
        opacity,
        minWidth: 200,
        padding: "14px 28px",
        borderRadius: 18,
        backgroundColor: colors.surfaces.nodeCard,
        border: `2px solid ${borderColor}`,
        boxShadow: `0 10px 25px rgba(0, 0, 0, 0.5), 0 0 ${isHighlighted ? "30px" : "20px"} ${glowColor}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...style,
      }}
    >
      {/* Node Header: Provider badge / Icon / Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {providerTheme && <span>{providerTheme.badge}</span>}
        {node.icon && <span style={{ fontSize: 24 }}>{node.icon}</span>}
        {node.status && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: statusColors[node.status] ?? colors.status.info,
              boxShadow: `0 0 8px ${statusColors[node.status] ?? colors.status.info}`,
            }}
          />
        )}
      </div>

      {/* Main Label */}
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: colors.typography.primary,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}
      >
        {node.label}
      </div>

      {/* Subtitle */}
      {node.subtitle && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: subtitleColor,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {node.subtitle}
        </div>
      )}

      {/* Optional Description */}
      {node.description && (
        <div
          style={{
            fontSize: 11,
            color: colors.typography.muted,
            textAlign: "center",
            maxWidth: 180,
            marginTop: 4,
          }}
        >
          {node.description}
        </div>
      )}
    </div>
  );
};

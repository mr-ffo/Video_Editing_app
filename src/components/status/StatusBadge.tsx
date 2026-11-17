import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

export type SystemStatus =
  | "operational"
  | "healthy"
  | "warning"
  | "error"
  | "pending"
  | "processing"
  | "offline";

export interface StatusBadgeProps {
  status: SystemStatus;
  label?: string;
  pulse?: boolean;
  style?: React.CSSProperties;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  pulse = true,
  style,
}) => {
  const frame = useCurrentFrame();

  const statusConfigs: Record<
    SystemStatus,
    { color: string; defaultLabel: string }
  > = {
    operational: { color: colors.status.success, defaultLabel: "Operational" },
    healthy: { color: colors.status.success, defaultLabel: "Healthy" },
    warning: { color: colors.status.warning, defaultLabel: "Warning" },
    error: { color: colors.status.danger, defaultLabel: "Critical" },
    pending: { color: colors.status.warning, defaultLabel: "Pending" },
    processing: { color: colors.brand.primary, defaultLabel: "Processing" },
    offline: { color: colors.typography.muted, defaultLabel: "Offline" },
  };

  const config = statusConfigs[status] ?? statusConfigs.operational;
  const displayLabel = label ?? config.defaultLabel;

  // Frame-deterministic subtle breathing pulse (cycle every 30 frames / 1s)
  const pulseFactor = pulse
    ? interpolate(Math.sin((frame / 30) * Math.PI * 2), [-1, 1], [0.65, 1])
    : 1;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px",
        borderRadius: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        border: `1px solid ${config.color}55`,
        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.4)`,
        fontFamily: typography.fonts.sans,
        ...style,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: config.color,
          transform: `scale(${pulseFactor})`,
          boxShadow: `0 0 10px ${config.color}`,
        }}
      />
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: colors.typography.primary,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {displayLabel}
      </span>
    </div>
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import { MetricCard } from "../components/metrics/MetricCard";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

export interface MetricItem {
  label: string;
  to: number;
  prefix?: string;
  suffix?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  sublabel?: string;
  variant?: "primary" | "accent" | "success" | "warning";
  decimals?: number;
  icon?: string;
}

export interface MetricsSceneProps {
  title?: string;
  subtitle?: string;
  metrics?: MetricItem[];
}

export const MetricsScene: React.FC<MetricsSceneProps> = ({
  title = "System Telemetry & Performance",
  subtitle = "High-availability workload monitoring",
  metrics = [
    {
      label: "System Availability",
      to: 99.99,
      suffix: "%",
      decimals: 2,
      trend: "up",
      trendLabel: "SLA Compliant",
      variant: "success",
      icon: "⚡",
    },
    {
      label: "Throughput",
      to: 45000,
      suffix: " req/s",
      trend: "up",
      trendLabel: "+18%",
      variant: "primary",
      icon: "📊",
    },
    {
      label: "P99 Latency",
      to: 14,
      suffix: " ms",
      trend: "down",
      trendLabel: "-6ms delta",
      variant: "accent",
      icon: "⏱️",
    },
    {
      label: "Cloud Cost Efficiency",
      to: 34,
      prefix: "$",
      suffix: "k / mo",
      trend: "down",
      trendLabel: "-22% reduced",
      variant: "accent",
      icon: "💰",
    },
  ],
}) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        fontFamily: typography.fonts.sans,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 42,
            fontWeight: 800,
            color: colors.typography.primary,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: 18,
              color: colors.typography.muted,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
          maxWidth: 1200,
        }}
      >
        {metrics.map((m, idx) => (
          <MetricCard
            key={`metric-${idx}`}
            label={m.label}
            to={m.to}
            prefix={m.prefix}
            suffix={m.suffix}
            decimals={m.decimals}
            trend={m.trend}
            trendLabel={m.trendLabel}
            sublabel={m.sublabel}
            variant={m.variant}
            icon={m.icon}
            startFrame={idx * 8}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export interface GlassPanelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  top?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
  opacity?: number;
  scale?: number;
  blur?: number;
  borderRadius?: number;
  padding?: string | number;
  /**
   * Adds a subtle holographic / CRT scan-line overlay for a technical HUD appearance.
   * Default: false
   */
  showScanlines?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  style,
  top,
  left,
  width,
  height,
  opacity,
  scale,
  blur = 20,
  borderRadius = spacing.radii.panel,
  padding = "20px 40px",
  showScanlines = false,
}) => {
  const isPositioned = top !== undefined || left !== undefined;

  return (
    <div
      style={{
        position: isPositioned ? "absolute" : "relative",
        top,
        left,
        width,
        height,
        boxSizing: "border-box",
        backgroundColor: colors.surfaces.glass,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid ${colors.borders.subtle}`,
        borderRadius,
        padding,
        boxShadow: `${colors.shadows.panel}, 0 0 40px ${colors.shadows.glowPrimary}, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
        opacity,
        transform: scale !== undefined ? `scale(${scale})` : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        ...style,
      }}
    >
      {showScanlines && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255, 255, 255, 0.025) 3px, rgba(255, 255, 255, 0.025) 5px)",
          }}
        />
      )}
      {children}
    </div>
  );
};

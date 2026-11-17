import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

export interface SectionProgressProps {
  currentSection: number;
  totalSections: number;
  sectionTitle: string;
  startFrame?: number;
  durationInFrames?: number;
  showProgressBar?: boolean;
  style?: React.CSSProperties;
}

export const SectionProgress: React.FC<SectionProgressProps> = ({
  currentSection,
  totalSections,
  sectionTitle,
  startFrame = 0,
  durationInFrames,
  showProgressBar = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: defaultDuration } = useVideoConfig();

  const totalDuration = durationInFrames ?? defaultDuration;
  const localFrame = Math.max(0, frame - startFrame);

  // Progress of current section [0, 1]
  const sectionProgress = interpolate(
    localFrame,
    [0, totalDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
        fontFamily: typography.fonts.sans,
        pointerEvents: "none",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: colors.brand.accent,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Part {String(currentSection).padStart(2, "0")} / {String(totalSections).padStart(2, "0")}
        </span>
        <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>•</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.typography.secondary,
            letterSpacing: "0.02em",
          }}
        >
          {sectionTitle}
        </span>
      </div>

      {showProgressBar && (
        <div
          style={{
            width: 180,
            height: 3,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${sectionProgress * 100}%`,
              height: "100%",
              backgroundColor: colors.brand.accent,
              boxShadow: `0 0 8px ${colors.brand.accent}`,
            }}
          />
        </div>
      )}
    </div>
  );
};

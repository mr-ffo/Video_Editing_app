import React from "react";
import { interpolate } from "remotion";
import { standardEase } from "../../animations/easing";
import { colors } from "../../theme/colors";
import type { DiagramConnection as IDiagramConnection } from "../../types/diagram";

export interface ConnectionLineProps {
  connection: IDiagramConnection;
  frame: number;
  width?: number;
  height?: number;
  color?: string;
  orientation?: "horizontal" | "vertical";
  style?: React.CSSProperties;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  frame,
  width = 200,
  height = 28,
  color,
  orientation = "horizontal",
  style,
}) => {
  const startDelay = connection.startDelayFrames ?? 35;
  const drawDuration = connection.drawDurationFrames ?? 20;

  // Draw progress
  const lineProgress = interpolate(
    frame,
    [startDelay, startDelay + drawDuration],
    [0, 1],
    {
      easing: standardEase,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const showArrow = connection.showArrow ?? true;
  const showDataFlow = connection.animatedDataFlow ?? true;
  const resolvedColor = connection.color ?? color ?? colors.brand.accent;

  const arrowOpacity = interpolate(lineProgress, [0.85, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isVertical = orientation === "vertical";
  const svgWidth = isVertical ? 28 : width;
  const svgHeight = isVertical ? (height === 28 ? 120 : height) : height;

  const centerX = isVertical ? 14 : width / 2;
  const centerY = isVertical ? svgHeight / 2 : 14;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isVertical ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        width: isVertical ? 80 : width,
        height: isVertical ? svgHeight : undefined,
        ...style,
      }}
    >
      {connection.label && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: resolvedColor,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            opacity: lineProgress > 0 ? 1 : 0,
            whiteSpace: "nowrap",
          }}
        >
          {connection.label}
        </div>
      )}

      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ overflow: "visible" }}
      >
        {/* Background dashed guide */}
        <line
          x1={isVertical ? centerX : 0}
          y1={isVertical ? 0 : centerY}
          x2={isVertical ? centerX : svgWidth}
          y2={isVertical ? svgHeight : centerY}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={3}
          strokeDasharray="6 6"
        />

        {/* Active animated drawn line */}
        <line
          x1={isVertical ? centerX : 0}
          y1={isVertical ? 0 : centerY}
          x2={isVertical ? centerX : svgWidth * lineProgress}
          y2={isVertical ? svgHeight * lineProgress : centerY}
          stroke={resolvedColor}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Animated moving pulse packet */}
        {showDataFlow && lineProgress > 0 && lineProgress < 1 && (
          <circle
            cx={isVertical ? centerX : svgWidth * lineProgress}
            cy={isVertical ? svgHeight * lineProgress : centerY}
            r={5}
            fill={resolvedColor}
            filter={`drop-shadow(0 0 8px ${resolvedColor})`}
          />
        )}

        {/* Directional arrowhead */}
        {showArrow && (
          <polygon
            points={
              isVertical
                ? `${centerX - 6},${svgHeight - 6} ${centerX},${svgHeight + 6} ${centerX + 6},${svgHeight - 6}`
                : `${svgWidth - 6},${centerY - 6} ${svgWidth + 6},${centerY} ${svgWidth - 6},${centerY + 6}`
            }
            fill={resolvedColor}
            opacity={arrowOpacity}
          />
        )}
      </svg>
    </div>
  );
};

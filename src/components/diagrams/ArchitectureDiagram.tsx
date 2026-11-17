import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { standardEase } from "../../animations/easing";
import { calculateFade } from "../../animations/presets";
import { colors } from "../../theme/colors";
import { timing } from "../../theme/timing";
import { typography } from "../../theme/typography";
import type {
  DiagramAnimationConfig,
  DiagramConfig,
  DiagramConnection,
  DiagramLayoutConfig,
  DiagramNode as IDiagramNode,
} from "../../types/diagram";
import { GlassPanel } from "../containers/GlassPanel";
import { ConnectionLine } from "./ConnectionLine";
import { DiagramNode } from "./DiagramNode";

export interface ArchitectureDiagramProps {
  config?: DiagramConfig;
  title?: string;
  nodes?: IDiagramNode[];
  connections?: DiagramConnection[];
  layout?: DiagramLayoutConfig;
  animation?: DiagramAnimationConfig;
  showScanlines?: boolean;
  style?: React.CSSProperties;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  config,
  title,
  nodes: directNodes,
  connections: directConnections,
  layout: directLayout,
  animation: directAnimation,
  showScanlines: directShowScanlines,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Resolve config and fallbacks safely
  const resolvedTitle = title ?? config?.title ?? "System Architecture";
  const nodes = directNodes ?? config?.nodes ?? [];
  const connections = directConnections ?? config?.connections ?? [];
  const layout = directLayout ?? config?.layout;
  const animation = directAnimation ?? config?.animation;
  const showScanlines = directShowScanlines ?? layout?.showScanlines ?? true;

  // Panel entrance and exit animations
  const fadeInFrames = animation?.panelFadeInFrames ?? timing.fadeIn;
  const fadeOutFrames = animation?.panelFadeOutFrames ?? timing.fadeOut;
  const panelOpacity = calculateFade(frame, durationInFrames, {
    fadeInFrames,
    fadeOutFrames,
  });

  const panelScale = interpolate(frame, [0, fadeInFrames + 5], [0.95, 1], {
    easing: standardEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const top = layout?.topPosition ?? "5%";
  const left = layout?.leftPosition ?? "10%";
  const width = layout?.panelWidth ?? "80%";
  const height = layout?.panelHeight ?? (layout?.orientation === "vertical" ? "65%" : "30%");
  const orientation = layout?.orientation ?? "horizontal";
  const gap = layout?.gap ?? (nodes.length > 2 ? 140 : 200);

  const isCustomPositioning =
    orientation === "custom" ||
    (nodes.length > 0 && nodes.some((n) => n.position?.x !== undefined));

  return (
    <AbsoluteFill
      style={{
        fontFamily: typography.fonts.sans,
        pointerEvents: "none",
        ...style,
      }}
    >
      <GlassPanel
        top={top}
        left={left}
        width={width}
        height={height}
        opacity={panelOpacity}
        scale={panelScale}
        showScanlines={showScanlines}
      >
        {/* Dynamic Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: colors.brand.accent,
              boxShadow: `0 0 12px ${colors.brand.accent}`,
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: colors.typography.primary,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {resolvedTitle}
          </span>
        </div>

        {/* Workflow Canvas */}
        {nodes.length === 0 ? (
          <div
            style={{
              fontSize: 14,
              color: colors.typography.muted,
              fontStyle: "italic",
              padding: "20px 0",
            }}
          >
            No architecture nodes configured
          </div>
        ) : isCustomPositioning ? (
          /* Explicit 2D Absolute Canvas */
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              minHeight: 280,
            }}
          >
            {nodes.map((node, index) => (
              <DiagramNode
                key={`${node.id || "node"}-${index}`}
                node={node}
                frame={frame}
              />
            ))}
            {connections.map((conn, index) => (
              <ConnectionLine
                key={`conn-${conn.id || "c"}-${index}`}
                connection={conn}
                frame={frame}
                width={gap}
              />
            ))}
          </div>
        ) : (
          /* Standard Flex Workflow (Horizontal or Vertical) */
          <div
            style={{
              display: "flex",
              flexDirection: orientation === "vertical" ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
              gap: orientation === "vertical" ? 16 : nodes.length > 2 ? 20 : 32,
              width: "100%",
            }}
          >
            {nodes.map((node, index) => {
              const nextNode = nodes[index + 1];

              // Safe connection resolution
              const connection = nextNode
                ? connections.find(
                    (c) => c.sourceId === node.id && c.targetId === nextNode.id
                  ) ??
                  connections.find(
                    (c) =>
                      c.sourceId === node.id &&
                      (!c.targetId || c.targetId === nextNode.id)
                  ) ??
                  (connections[index] && !connections[index].sourceId
                    ? connections[index]
                    : undefined)
                : undefined;

              return (
                <React.Fragment key={`${node.id || "node"}-${index}`}>
                  <DiagramNode node={node} frame={frame} />
                  {nextNode && connection && (
                    <ConnectionLine
                      key={`conn-${connection.id || "c"}-${index}`}
                      connection={connection}
                      frame={frame}
                      orientation={orientation}
                      width={orientation === "horizontal" ? gap : undefined}
                      height={orientation === "vertical" ? gap : undefined}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </GlassPanel>
    </AbsoluteFill>
  );
};

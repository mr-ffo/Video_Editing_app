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
  DiagramContainer,
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
  containers?: DiagramContainer[];
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
  containers: directContainers,
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
  const containers = directContainers ?? config?.containers ?? [];
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
              minHeight: 380,
            }}
          >
            {/* Containers / Logical Boundaries */}
            {containers.map((c) => (
              <div
                key={c.id}
                style={{
                  position: "absolute",
                  left: c.x,
                  top: c.y,
                  width: c.width,
                  height: c.height,
                  borderRadius: 16,
                  border: `${c.borderStyle === "dashed" ? "2px dashed" : "2px solid"} ${c.color || "rgba(59, 130, 246, 0.4)"}`,
                  backgroundColor: `${c.color || "#3b82f6"}10`,
                  padding: 12,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: c.color || "#60a5fa",
                    backgroundColor: "rgba(15, 23, 42, 0.8)",
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: `1px solid ${c.color || "rgba(59, 130, 246, 0.3)"}`,
                  }}
                >
                  {c.label}
                </span>
              </div>
            ))}

            {/* Freeform 2D SVG Connections Overlay */}
            <svg
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <defs>
                <marker
                  id="arch-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill={colors.brand.accent} />
                </marker>
              </defs>
              {connections.map((conn, index) => {
                const sNode = nodes.find((n) => n.id === conn.sourceId);
                const tNode = nodes.find((n) => n.id === conn.targetId);
                const sX = typeof sNode?.position?.x === "number" ? sNode.position.x + (sNode.width ? sNode.width / 2 : 75) : null;
                const sY = typeof sNode?.position?.y === "number" ? sNode.position.y + (sNode.height ? sNode.height / 2 : 35) : null;
                const tX = typeof tNode?.position?.x === "number" ? tNode.position.x + (tNode.width ? tNode.width / 2 : 75) : null;
                const tY = typeof tNode?.position?.y === "number" ? tNode.position.y + (tNode.height ? tNode.height / 2 : 35) : null;

                if (sX !== null && sY !== null && tX !== null && tY !== null) {
                  const connColor = conn.color || colors.brand.accent;
                  const isCurved = conn.style === "curved";
                  const isOrthogonal = conn.style === "orthogonal";
                  const midX = (sX + tX) / 2;
                  const pathD = isCurved
                    ? `M ${sX} ${sY} C ${midX} ${sY}, ${midX} ${tY}, ${tX} ${tY}`
                    : isOrthogonal
                    ? `M ${sX} ${sY} L ${midX} ${sY} L ${midX} ${tY} L ${tX} ${tY}`
                    : `M ${sX} ${sY} L ${tX} ${tY}`;

                  return (
                    <g key={`svg-conn-${conn.id || index}`}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={connColor}
                        strokeWidth={2.5}
                        strokeDasharray={conn.animatedDataFlow !== false ? "6 4" : undefined}
                        strokeDashoffset={conn.animatedDataFlow !== false ? -frame * 1.5 : undefined}
                        markerEnd={conn.showArrow !== false ? "url(#arch-arrow)" : undefined}
                        opacity={0.85}
                      />
                      {conn.label && (
                        <text
                          x={midX}
                          y={(sY + tY) / 2 - 8}
                          fill="#e2e8f0"
                          fontSize={11}
                          fontWeight={600}
                          textAnchor="middle"
                          style={{
                            backgroundColor: "rgba(15,23,42,0.9)",
                            fontFamily: typography.fonts.sans,
                          }}
                        >
                          {conn.label}
                        </text>
                      )}
                    </g>
                  );
                }

                return (
                  <foreignObject key={`fo-conn-${conn.id || index}`} width="100%" height="100%">
                    <ConnectionLine connection={conn} frame={frame} width={gap} />
                  </foreignObject>
                );
              })}
            </svg>

            {/* Nodes */}
            <div style={{ position: "relative", zIndex: 2 }}>
              {nodes.map((node, index) => (
                <DiagramNode
                  key={`${node.id || "node"}-${index}`}
                  node={node}
                  frame={frame}
                />
              ))}
            </div>
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

export type DiagramNodeType =
  | "security"
  | "storage"
  | "compute"
  | "network"
  | "database"
  | "custom";

export type DiagramNodeVariant =
  | "primary"
  | "accent"
  | "neutral"
  | "highlight";

export type NodeStatusType =
  | "healthy"
  | "warning"
  | "error"
  | "active"
  | "offline";

export interface DiagramNodePosition {
  x?: number | string;
  y?: number | string;
}

export interface DiagramNode {
  id: string;
  label: string;
  subtitle?: string;
  icon?: string;
  type?: DiagramNodeType;
  variant?: DiagramNodeVariant;
  provider?: string;
  status?: NodeStatusType;
  description?: string;
  position?: DiagramNodePosition;
  x?: number;
  y?: number;
  delayFrames?: number;
  highlighted?: boolean;
  width?: number;
  height?: number;
  badge?: string;
}

export type ConnectionLineStyle = "curved" | "straight" | "orthogonal";
export type ConnectionDirection = "forward" | "bidirectional" | "reverse";

export interface DiagramConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  showArrow?: boolean;
  animatedDataFlow?: boolean;
  startDelayFrames?: number;
  drawDurationFrames?: number;
  color?: string;
  style?: ConnectionLineStyle;
  lineStyle?: ConnectionLineStyle;
  direction?: ConnectionDirection;
}

export interface DiagramContainer {
  id: string;
  label: string;
  type?: "vpc" | "subnet" | "region" | "az" | "boundary" | "custom";
  color?: string;
  borderColor?: string;
  backgroundColor?: string;
  borderStyle?: "solid" | "dashed";
  x: number;
  y: number;
  width: number;
  height: number;
  nodeIds?: string[];
}

export interface DiagramLayoutConfig {
  orientation?: "horizontal" | "vertical" | "custom";
  gap?: number;
  panelWidth?: string | number;
  panelHeight?: string | number;
  topPosition?: string | number;
  leftPosition?: string | number;
  showScanlines?: boolean;
}

export interface DiagramAnimationConfig {
  panelFadeInFrames?: number;
  panelFadeOutFrames?: number;
  nodePopStaggerFrames?: number;
  connectionDrawFrames?: number;
}

export interface DiagramConfig {
  title: string;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  containers?: DiagramContainer[];
  layout?: DiagramLayoutConfig;
  animation?: DiagramAnimationConfig;
}

/**
 * Backward-compatible interface for the existing CloudDiagram component
 */
export interface CloudDiagramProps {
  leftNode?: string;
  rightNode?: string;
  title?: string;
}

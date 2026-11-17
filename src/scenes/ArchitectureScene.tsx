import React from "react";
import { ArchitectureDiagram } from "../components/diagrams/ArchitectureDiagram";
import type { DiagramConfig } from "../types/diagram";

export interface ArchitectureSceneProps {
  title?: string;
  leftNode?: string;
  rightNode?: string;
  config?: DiagramConfig;
}

/**
 * Modular ArchitectureScene coordinating technical architecture diagram sequences.
 * Integrates directly with the generic ArchitectureDiagram engine while preserving
 * standard two-node defaults for full baseline visual parity.
 */
export const ArchitectureScene: React.FC<ArchitectureSceneProps> = ({
  title = "AWS Core Architecture",
  leftNode = "IAM 🛡️",
  rightNode = "Amazon S3 🪣",
  config,
}) => {
  if (config) {
    return <ArchitectureDiagram config={config} />;
  }

  return (
    <ArchitectureDiagram
      title={title}
      nodes={[
        {
          id: "iam-node",
          label: leftNode,
          subtitle: "Security & Identity",
          variant: "primary",
          delayFrames: 15,
        },
        {
          id: "s3-node",
          label: rightNode,
          subtitle: "Storage",
          variant: "accent",
          delayFrames: 55,
        },
      ]}
      connections={[
        {
          id: "conn-1",
          sourceId: "iam-node",
          targetId: "s3-node",
          label: "Permits Access",
          showArrow: true,
          animatedDataFlow: true,
          startDelayFrames: 35,
          drawDurationFrames: 20,
        },
      ]}
    />
  );
};

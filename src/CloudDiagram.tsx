import React from "react";
import { ArchitectureDiagram } from "./components/diagrams/ArchitectureDiagram";
import type { CloudDiagramProps } from "./types/diagram";

export type { CloudDiagramProps };

/**
 * Backward-compatible CloudDiagram component that serves as a specialized
 * 2-node configuration wrapper around the generic ArchitectureDiagram engine.
 */
export const CloudDiagram: React.FC<CloudDiagramProps> = ({
  leftNode = "IAM 🛡️",
  rightNode = "Amazon S3 🪣",
  title = "AWS Core Architecture",
}) => {
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
          id: "iam-s3-conn",
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

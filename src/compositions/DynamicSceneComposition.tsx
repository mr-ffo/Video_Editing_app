import React from "react";
import { AbsoluteFill, Series } from "remotion";
import type { AspectRatio, SceneItem } from "../types/scene";
import { SceneRenderer } from "../components/scenes/SceneRenderer";
import { TEMPLATE_PROJECTS } from "../data/sceneTemplates";
import { colors } from "../theme/colors";

export interface DynamicSceneCompositionProps {
  scenes?: SceneItem[];
  aspectRatio?: AspectRatio;
}

/**
 * DynamicSceneComposition: The master dynamic multi-scene timeline renderer.
 * Chains active scenes deterministically using Remotion's Series sequence engine.
 */
export const DynamicSceneComposition: React.FC<DynamicSceneCompositionProps> = ({
  scenes,
  aspectRatio = "16:9",
}) => {
  const activeScenes = (
    scenes && scenes.length > 0 ? scenes : TEMPLATE_PROJECTS[0].scenes
  ).filter((s) => !s.hidden);

  if (activeScenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: colors.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.typography.muted,
          fontFamily: "sans-serif",
          fontSize: 24,
        }}
      >
        No active scenes in project timeline.
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        overflow: "hidden",
      }}
    >
      <Series>
        {activeScenes.map((scene) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={Math.max(15, scene.durationInFrames)}
            name={`${scene.type}: ${scene.title}`}
          >
            <SceneRenderer scene={scene} aspectRatio={aspectRatio} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

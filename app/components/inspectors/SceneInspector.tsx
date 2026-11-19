"use client";

import React, { useState } from "react";
import {
  type SceneItem,
  type IntroSceneItem,
  type PresenterSceneItem,
  type ArchitectureSceneItem,
  type TerminalSceneItem,
  type CodeSceneItem,
  type MetricsSceneItem,
  type CalloutSceneItem,
  type OutroSceneItem,
  type AspectRatio,
  ASPECT_RATIOS,
} from "../../../src/types/scene";
import type { ElementTransform, ElementTypography, ElementAnimationConfig, AlignmentType } from "../../../src/types/element";
import { calculateAlignment, type BoundingBox } from "../../../src/lib/coordinateUtils";
import { IntroInspector } from "./IntroInspector";
import { PresenterInspector } from "./PresenterInspector";
import { ArchitectureInspector } from "./ArchitectureInspector";
import { TerminalInspector } from "./TerminalInspector";
import { CodeInspector } from "./CodeInspector";
import { MetricsInspector } from "./MetricsInspector";
import { CalloutInspector } from "./CalloutInspector";
import { OutroInspector } from "./OutroInspector";
import { TransformInspector } from "./TransformInspector";
import { TypographyInspector } from "./TypographyInspector";
import { AnimationInspector } from "./AnimationInspector";

type InspectorTab = "properties" | "transform" | "typography" | "animation";

interface SceneInspectorProps {
  scene: SceneItem | null;
  onUpdateScene: (updated: Partial<SceneItem>) => void;
  onDeleteScene?: () => void;
  onDuplicateScene?: () => void;
  aspectRatio?: AspectRatio;
  selectedElementId?: string | null;
}

export const SceneInspector: React.FC<SceneInspectorProps> = ({
  scene,
  onUpdateScene,
  onDeleteScene,
  onDuplicateScene,
  aspectRatio = "16:9",
  selectedElementId,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>("properties");

  if (!scene) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <span className="text-3xl mb-2">🎬</span>
        <p className="text-xs font-medium">Select a scene from the navigator to edit its properties.</p>
      </div>
    );
  }

  const { width: canvasWidth, height: canvasHeight } =
    ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS["16:9"];

  // Determine if a diagram node or container is specifically selected
  const archScene = scene.type === "architecture" ? (scene as ArchitectureSceneItem) : null;
  const selectedNode = archScene?.nodes.find((n) => n.id === selectedElementId);
  const selectedContainer = archScene?.containers?.find((c) => c.id === selectedElementId);

  // Active transform depending on element vs scene
  const activeTransform: ElementTransform = selectedNode
    ? {
        x: selectedNode.x ?? 0,
        y: selectedNode.y ?? 0,
        width: selectedNode.width ?? 140,
        height: selectedNode.height ?? 110,
        scale: 1,
        rotation: 0,
        opacity: 1,
      }
    : selectedContainer
    ? {
        x: selectedContainer.x,
        y: selectedContainer.y,
        width: selectedContainer.width,
        height: selectedContainer.height,
        scale: 1,
        rotation: 0,
        opacity: 1,
      }
    : scene.transform || {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
      };

  const handleTransformChange = (updated: Partial<ElementTransform>) => {
    if (selectedNode && archScene) {
      const updatedNodes = archScene.nodes.map((n) =>
        n.id === selectedNode.id
          ? {
              ...n,
              x: updated.x !== undefined ? updated.x : (n.x ?? 0),
              y: updated.y !== undefined ? updated.y : (n.y ?? 0),
              width: updated.width !== undefined ? updated.width : n.width,
              height: updated.height !== undefined ? updated.height : n.height,
            }
          : n
      );
      onUpdateScene({ nodes: updatedNodes } as Partial<SceneItem>);
    } else if (selectedContainer && archScene) {
      const updatedContainers = (archScene.containers || []).map((c) =>
        c.id === selectedContainer.id
          ? {
              ...c,
              x: updated.x !== undefined ? updated.x : c.x,
              y: updated.y !== undefined ? updated.y : c.y,
              width: updated.width !== undefined ? updated.width : c.width,
              height: updated.height !== undefined ? updated.height : c.height,
            }
          : c
      );
      onUpdateScene({ containers: updatedContainers } as Partial<SceneItem>);
    } else {
      onUpdateScene({
        transform: {
          ...activeTransform,
          ...updated,
        },
      });
    }
  };

  const handleAlign = (type: AlignmentType) => {
    const box: BoundingBox = {
      x: activeTransform.x,
      y: activeTransform.y,
      width: activeTransform.width ?? 300,
      height: activeTransform.height ?? 200,
    };
    const [aligned] = calculateAlignment(type, [box], canvasWidth, canvasHeight);
    if (aligned) {
      handleTransformChange({ x: aligned.x, y: aligned.y });
    }
  };

  const activeTypography: ElementTypography = scene.typography || {
    fontSize: 32,
    fontWeight: 700,
    color: "#ffffff",
    fontFamily: "Inter, sans-serif",
    align: "center",
    textAlign: "center",
  };

  const handleTypographyChange = (updated: Partial<ElementTypography>) => {
    onUpdateScene({
      typography: {
        ...activeTypography,
        ...updated,
      },
    });
  };

  const activeAnimation: ElementAnimationConfig = scene.animation || {
    entrance: "fade-up",
    exit: "fade-out",
    durationInFrames: 25,
    durationFrames: 25,
    delayFrames: 0,
    easing: "ease-out",
  };

  const handleAnimationChange = (updated: Partial<ElementAnimationConfig>) => {
    onUpdateScene({
      animation: {
        ...activeAnimation,
        ...updated,
      },
    });
  };

  const renderSceneSpecificProperties = () => {
    switch (scene.type) {
      case "intro":
        return (
          <IntroInspector
            scene={scene as IntroSceneItem}
            onChange={onUpdateScene}
            onDelete={onDeleteScene}
            onDuplicate={onDuplicateScene}
          />
        );
      case "presenter":
        return (
          <PresenterInspector
            scene={scene as PresenterSceneItem}
            onChange={onUpdateScene}
            onDelete={onDeleteScene}
            onDuplicate={onDuplicateScene}
          />
        );
      case "architecture":
        return (
          <ArchitectureInspector
            scene={scene as ArchitectureSceneItem}
            onChange={onUpdateScene}
            onDelete={onDeleteScene}
            onDuplicate={onDuplicateScene}
          />
        );
      case "terminal":
        return (
          <TerminalInspector
            scene={scene as TerminalSceneItem}
            onChange={onUpdateScene}
            onDelete={onDeleteScene}
            onDuplicate={onDuplicateScene}
          />
        );
      case "code":
        return (
          <CodeInspector
            scene={scene as CodeSceneItem}
            onChange={onUpdateScene}
            onDelete={onDeleteScene}
            onDuplicate={onDuplicateScene}
          />
        );
      case "metrics":
        return (
          <MetricsInspector
            scene={scene as MetricsSceneItem}
            onChange={onUpdateScene}
            onDelete={onDeleteScene}
            onDuplicate={onDuplicateScene}
          />
        );
      case "callout":
        return (
          <CalloutInspector
            scene={scene as CalloutSceneItem}
            onChange={onUpdateScene}
            onDelete={onDeleteScene}
            onDuplicate={onDuplicateScene}
          />
        );
      case "outro":
        return (
          <OutroInspector
            scene={scene as OutroSceneItem}
            onChange={onUpdateScene}
            onDelete={onDeleteScene}
            onDuplicate={onDuplicateScene}
          />
        );
      default:
        return (
          <div className="p-4 text-xs text-slate-400">
            Unknown scene type: {(scene as SceneItem).type}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Inspector Top Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("properties")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            activeTab === "properties"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          Properties
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("transform")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            activeTab === "transform"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          Transform
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("typography")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            activeTab === "typography"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          Type
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("animation")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            activeTab === "animation"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          Motion
        </button>
      </div>

      {/* Target element indicator */}
      {(selectedNode || selectedContainer) && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Target element:</span>
          <span className="font-semibold text-indigo-300 font-mono">
            {selectedNode ? `Node: ${selectedNode.label}` : `Container: ${selectedContainer?.label}`}
          </span>
        </div>
      )}

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === "properties" && renderSceneSpecificProperties()}
        {activeTab === "transform" && (
          <TransformInspector
            transform={activeTransform}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onChange={handleTransformChange}
            onAlign={handleAlign}
          />
        )}
        {activeTab === "typography" && (
          <TypographyInspector
            typography={activeTypography}
            onChange={handleTypographyChange}
          />
        )}
        {activeTab === "animation" && (
          <AnimationInspector
            animation={activeAnimation}
            onChange={handleAnimationChange}
          />
        )}
      </div>
    </div>
  );
};

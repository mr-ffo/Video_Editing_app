"use client";

import React from "react";
import type { SceneItem, ArchitectureSceneItem } from "../../../src/types/scene";

interface LayerNavigatorProps {
  scene: SceneItem;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateScene: (updated: Partial<SceneItem>) => void;
}

export const LayerNavigator: React.FC<LayerNavigatorProps> = ({
  scene,
  selectedElementId,
  onSelectElement,
  onUpdateScene,
}) => {
  const isArch = scene.type === "architecture";
  const archScene = isArch ? (scene as ArchitectureSceneItem) : null;

  // Reorder node layer up
  const handleMoveNode = (index: number, direction: "up" | "down") => {
    if (!archScene) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= archScene.nodes.length) return;

    const updated = [...archScene.nodes];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onUpdateScene({ nodes: updated });
  };

  // Toggle node lock
  const handleToggleLock = (nodeId: string) => {
    if (!archScene) return;
    const updated = archScene.nodes.map((n) =>
      n.id === nodeId ? { ...n, highlighted: !n.highlighted } : n
    );
    onUpdateScene({ nodes: updated });
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    if (!archScene) return;
    const updatedNodes = archScene.nodes.filter((n) => n.id !== nodeId);
    const updatedConns = archScene.connections.filter(
      (c) => c.sourceId !== nodeId && c.targetId !== nodeId
    );
    onUpdateScene({ nodes: updatedNodes, connections: updatedConns });
    if (selectedElementId === nodeId) onSelectElement(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Layer Hierarchy
          </h3>
          <p className="text-[11px] text-slate-400">Z-index ordering & element lock</p>
        </div>
        <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-blue-400 border border-slate-800 font-mono">
          {isArch ? `${archScene?.nodes.length || 0} nodes` : "Scene Root"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 py-3 pr-1">
        {isArch && archScene ? (
          <>
            {/* Containers Layers */}
            {archScene.containers?.map((cont) => {
              const isSelected = selectedElementId === cont.id;
              return (
                <div
                  key={cont.id}
                  onClick={() => onSelectElement(cont.id)}
                  className={`group flex items-center justify-between rounded-xl border p-2 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/15 text-white"
                      : "border-slate-800/80 bg-slate-900/40 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">🔲</span>
                    <span className="font-semibold truncate max-w-[140px]">
                      {cont.label || "Group Container"}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-amber-400/80 font-bold">
                    Group
                  </span>
                </div>
              );
            })}

            {/* Nodes Layers */}
            {archScene.nodes.map((node, idx) => {
              const isSelected = selectedElementId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => onSelectElement(node.id)}
                  className={`group flex items-center justify-between rounded-xl border p-2 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/15 text-white"
                      : "border-slate-800/80 bg-slate-900/40 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px] font-mono">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold truncate max-w-[130px]">
                      {node.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveNode(idx, "up");
                      }}
                      disabled={idx === 0}
                      title="Bring Forward"
                      className="rounded p-0.5 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer text-[10px]"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveNode(idx, "down");
                      }}
                      disabled={idx === archScene.nodes.length - 1}
                      title="Send Backward"
                      className="rounded p-0.5 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer text-[10px]"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(node.id);
                      }}
                      title="Highlight/Focus"
                      className="rounded p-0.5 text-slate-400 hover:text-white cursor-pointer text-[10px]"
                    >
                      {node.highlighted ? "🔒" : "🔓"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      title="Delete layer"
                      className="rounded p-0.5 text-slate-400 hover:text-rose-400 cursor-pointer text-[10px]"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          /* Single scene primary layer */
          <div
            onClick={() => onSelectElement(scene.id)}
            className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-colors cursor-pointer ${
              selectedElementId === scene.id
                ? "border-blue-500 bg-blue-500/15 text-white"
                : "border-slate-800/80 bg-slate-900/40 text-slate-300 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🎬</span>
              <span className="font-semibold">{scene.title}</span>
            </div>
            <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 border border-blue-500/20 uppercase">
              {scene.type}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import type { SceneItem, SceneType } from "../../../src/types/scene";
import { createDefaultScene } from "../../../src/types/scene";
import { TEMPLATE_PROJECTS } from "../../../src/data/sceneTemplates";

interface SceneNavigatorProps {
  scenes: SceneItem[];
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  onAddScene: (scene: SceneItem) => void;
  onReorderScenes: (reordered: SceneItem[]) => void;
  onDuplicateScene: (id: string) => void;
  onDeleteScene: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onApplyTemplate: (templateId: string) => void;
}

const SCENE_TYPE_META: Record<SceneType, { label: string; icon: string; color: string }> = {
  intro: { label: "Intro", icon: "🎬", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  presenter: { label: "Presenter", icon: "👤", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  architecture: { label: "Architecture", icon: "🏛️", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  terminal: { label: "Terminal", icon: "💻", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  code: { label: "Code", icon: "📜", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  metrics: { label: "Metrics", icon: "📊", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  callout: { label: "Callout", icon: "💡", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  outro: { label: "Outro", icon: "🚀", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
};

export const SceneNavigator: React.FC<SceneNavigatorProps> = ({
  scenes,
  selectedSceneId,
  onSelectScene,
  onAddScene,
  onReorderScenes,
  onDuplicateScene,
  onDeleteScene,
  onToggleVisibility,
  onApplyTemplate,
}) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Move scene up
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index <= 0) return;
    const updated = [...scenes];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onReorderScenes(updated);
  };

  // Move scene down
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index >= scenes.length - 1) return;
    const updated = [...scenes];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onReorderScenes(updated);
  };

  const handleSelectAddType = (type: SceneType) => {
    const newScene = createDefaultScene(type);
    onAddScene(newScene);
    setIsAddMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4">
      {/* Header and Add Scene Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Scene Navigator ({scenes.length})
          </h3>
          <p className="text-[11px] text-slate-400">Sequence and order scenes</p>
        </div>

        <div className="relative flex items-center gap-1.5">
          {/* Template Menu Button */}
          <button
            type="button"
            onClick={() => {
              setIsTemplateMenuOpen(!isTemplateMenuOpen);
              setIsAddMenuOpen(false);
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Load Pre-configured Template"
          >
            📋 Templates
          </button>

          {/* Add Scene Button */}
          <button
            type="button"
            onClick={() => {
              setIsAddMenuOpen(!isAddMenuOpen);
              setIsTemplateMenuOpen(false);
            }}
            className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-blue-500 transition-all cursor-pointer"
          >
            + Add Scene
          </button>

          {/* Add Scene Dropdown */}
          {isAddMenuOpen && (
            <div className="absolute right-0 top-8 z-50 w-52 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl space-y-1">
              <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Choose Scene Type
              </span>
              {(Object.keys(SCENE_TYPE_META) as SceneType[]).map((type) => {
                const meta = SCENE_TYPE_META[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelectAddType(type)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left text-slate-200 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{meta.icon}</span>
                    <span className="font-semibold">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Template Dropdown */}
          {isTemplateMenuOpen && (
            <div className="absolute right-0 top-8 z-50 w-64 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl space-y-1">
              <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Load Project Template
              </span>
              {TEMPLATE_PROJECTS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onApplyTemplate(t.id);
                    setIsTemplateMenuOpen(false);
                  }}
                  className="w-full text-left rounded-lg p-2 hover:bg-slate-800 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-blue-400">
                      {t.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {t.aspectRatio}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scene Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
        {scenes.map((scene, idx) => {
          const isSelected = scene.id === selectedSceneId;
          const meta = SCENE_TYPE_META[scene.type] || SCENE_TYPE_META.intro;
          const durationSec = ((scene.durationInFrames || 90) / 30).toFixed(1);

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`group relative flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer ${
                isSelected
                  ? "border-blue-500 bg-blue-500/15 shadow-md shadow-blue-500/10"
                  : scene.hidden
                  ? "border-slate-800/40 bg-slate-900/30 opacity-50"
                  : "border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              {/* Left: Index badge & Meta */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800 text-[10px] font-bold text-slate-400">
                  {idx + 1}
                </span>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{meta.icon}</span>
                    <span className="text-xs font-bold text-white truncate max-w-[140px]">
                      {scene.title || meta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className={`px-1 rounded border font-semibold ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span>{durationSec}s</span>
                  </div>
                </div>
              </div>

              {/* Right: Quick actions on hover / selection */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {/* Reorder Up */}
                <button
                  type="button"
                  onClick={(e) => handleMoveUp(idx, e)}
                  disabled={idx === 0}
                  title="Move up"
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-20 cursor-pointer text-[10px]"
                >
                  ▲
                </button>
                {/* Reorder Down */}
                <button
                  type="button"
                  onClick={(e) => handleMoveDown(idx, e)}
                  disabled={idx === scenes.length - 1}
                  title="Move down"
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-20 cursor-pointer text-[10px]"
                >
                  ▼
                </button>
                {/* Duplicate */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateScene(scene.id);
                  }}
                  title="Duplicate scene"
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer text-[10px]"
                >
                  📋
                </button>
                {/* Toggle Visibility */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(scene.id);
                  }}
                  title={scene.hidden ? "Show scene" : "Hide scene"}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer text-[10px]"
                >
                  {scene.hidden ? "🙈" : "👁️"}
                </button>
                {/* Delete */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteScene(scene.id);
                  }}
                  title="Delete scene"
                  className="rounded p-1 text-slate-400 hover:bg-rose-900/40 hover:text-rose-400 cursor-pointer text-[10px]"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

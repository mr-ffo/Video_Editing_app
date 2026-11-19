"use client";

import React from "react";
import type { AspectRatio } from "../../../src/types/scene";
import { ASPECT_RATIOS } from "../../../src/types/scene";

interface EditorToolbarProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  editorMode: "scenes" | "overlays";
  onEditorModeChange: (mode: "scenes" | "overlays") => void;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showSafeArea?: boolean;
  onToggleSafeArea?: () => void;
  canvasEditMode?: boolean;
  onToggleCanvasEditMode?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  aspectRatio,
  onAspectRatioChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  editorMode,
  onEditorModeChange,
  zoomLevel = 1.0,
  onZoomChange,
  showGrid = false,
  onToggleGrid,
  showSafeArea = false,
  onToggleSafeArea,
  canvasEditMode = true,
  onToggleCanvasEditMode,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-3 shadow-lg">
      {/* Left: Mode Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => onEditorModeChange("scenes")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              editorMode === "scenes"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🎬</span>
            <span>Scene Editor</span>
          </button>

          <button
            type="button"
            onClick={() => onEditorModeChange("overlays")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              editorMode === "overlays"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🎛️</span>
            <span>Broadcast Overlays</span>
          </button>
        </div>

        {editorMode === "scenes" && (
          <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            {/* Direct Edit Toggle */}
            <button
              type="button"
              onClick={onToggleCanvasEditMode}
              title="Toggle Direct Manipulation Canvas"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                canvasEditMode
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🎯</span>
              <span>Direct Edit</span>
            </button>

            {/* Grid Toggle */}
            <button
              type="button"
              onClick={onToggleGrid}
              title="Toggle Rule-of-Thirds and Center Grid"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                showGrid
                  ? "bg-cyan-600/80 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              # Grid
            </button>

            {/* Safe Area Toggle */}
            <button
              type="button"
              onClick={onToggleSafeArea}
              title="Toggle Safe Area Guides (Action 90% / Title 80%)"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                showSafeArea
                  ? "bg-amber-600/80 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⛶ Safe Areas
            </button>
          </div>
        )}
      </div>

      {/* Center: Aspect Ratio & Zoom Picker */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Aspect:
          </span>
          <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
            {(["16:9", "9:16", "1:1"] as AspectRatio[]).map((ratio) => {
              const config = ASPECT_RATIOS[ratio];
              const isSelected = aspectRatio === ratio;
              return (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => onAspectRatioChange(ratio)}
                  title={config.label}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{config.icon}</span>
                  <span>{ratio}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zoom selector */}
        {onZoomChange && (
          <div className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
            <span className="text-[10px] text-slate-500 px-1 font-semibold">Zoom:</span>
            {[0.5, 0.75, 1.0, 1.5].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => onZoomChange(z)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  zoomLevel === z
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {z === 1.0 ? "Fit" : `${Math.round(z * 100)}%`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Undo / Redo */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z / Cmd+Z)"
          className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer"
        >
          <span>↩</span>
          <span className="hidden md:inline">Undo</span>
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z / Cmd+Shift+Z)"
          className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer"
        >
          <span>↪</span>
          <span className="hidden md:inline">Redo</span>
        </button>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import type { SceneItem, SceneTransitionType } from "../../../src/types/scene";

interface InspectorHeaderProps {
  scene: SceneItem;
  onChange: (updated: Partial<SceneItem>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const InspectorHeader: React.FC<InspectorHeaderProps> = ({
  scene,
  onChange,
  onDelete,
  onDuplicate,
}) => {
  const durationSec = ((scene.durationInFrames || 90) / 30).toFixed(1);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sec = Math.max(0.5, parseFloat(e.target.value) || 1);
    onChange({ durationInFrames: Math.round(sec * 30) });
  };

  const handleTransitionType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as SceneTransitionType;
    onChange({
      transition: {
        type: val,
        durationInFrames: val === "cut" ? 0 : 15,
        direction: scene.transition?.direction || "left",
      },
    });
  };

  return (
    <div className="space-y-4 border-b border-slate-800 pb-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
            {scene.type}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {scene.durationInFrames} frames ({durationSec}s)
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              title="Duplicate scene"
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-xs"
            >
              📋
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete scene"
              className="rounded p-1 text-slate-400 hover:bg-rose-900/40 hover:text-rose-400 transition-colors text-xs"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Scene Title */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Scene Title
        </label>
        <input
          type="text"
          value={scene.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Timing and Transition Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Duration (Seconds)
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="60"
            value={durationSec}
            onChange={handleDurationChange}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Transition
          </label>
          <select
            value={scene.transition?.type || "crossfade"}
            onChange={handleTransitionType}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="crossfade">Crossfade</option>
            <option value="fade-black">Fade Black</option>
            <option value="slide">Slide</option>
            <option value="zoom">Zoom</option>
            <option value="cut">Cut (Instant)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

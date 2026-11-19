"use client";

import React from "react";
import type { IntroSceneItem, SceneItem } from "../../../src/types/scene";
import { InspectorHeader } from "./InspectorCommon";

interface IntroInspectorProps {
  scene: IntroSceneItem;
  onChange: (updated: Partial<SceneItem>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const IntroInspector: React.FC<IntroInspectorProps> = ({
  scene,
  onChange,
  onDelete,
  onDuplicate,
}) => {
  return (
    <div className="space-y-4">
      <InspectorHeader
        scene={scene}
        onChange={onChange}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />

      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Subtitle / Topic
        </label>
        <textarea
          rows={2}
          value={scene.subtitle || ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="e.g. Production Architecture & Infrastructure as Code"
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Category Badge
          </label>
          <input
            type="text"
            value={scene.badge || ""}
            onChange={(e) => onChange({ badge: e.target.value })}
            placeholder="e.g. AWS & DEVOPS"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Accent Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={scene.accentColor || "#3b82f6"}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded-lg border border-slate-700 bg-transparent p-0"
            />
            <span className="text-xs font-mono text-slate-300">
              {scene.accentColor || "#3b82f6"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

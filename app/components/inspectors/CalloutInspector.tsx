"use client";

import React from "react";
import type { CalloutSceneItem, SceneItem } from "../../../src/types/scene";
import { InspectorHeader } from "./InspectorCommon";

interface CalloutInspectorProps {
  scene: CalloutSceneItem;
  onChange: (updated: Partial<SceneItem>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const CalloutInspector: React.FC<CalloutInspectorProps> = ({
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Keyword / Concept
          </label>
          <input
            type="text"
            value={scene.keyword}
            onChange={(e) => onChange({ keyword: e.target.value })}
            placeholder="e.g. Idempotency"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Badge Tag
          </label>
          <input
            type="text"
            value={scene.badge || ""}
            onChange={(e) => onChange({ badge: e.target.value })}
            placeholder="e.g. BEST PRACTICE"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Explanation & Advice
        </label>
        <textarea
          rows={4}
          value={scene.explanation}
          onChange={(e) => onChange({ explanation: e.target.value })}
          placeholder="Detailed takeaway message..."
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none leading-relaxed"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Highlight Accent Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={scene.color || "#10b981"}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded-lg border border-slate-700 bg-transparent p-0"
          />
          <span className="text-xs font-mono text-slate-300">
            {scene.color || "#10b981"}
          </span>
        </div>
      </div>
    </div>
  );
};

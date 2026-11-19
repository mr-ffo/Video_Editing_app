"use client";

import React from "react";
import type { PresenterSceneItem, SceneItem } from "../../../src/types/scene";
import { InspectorHeader } from "./InspectorCommon";

interface PresenterInspectorProps {
  scene: PresenterSceneItem;
  onChange: (updated: Partial<SceneItem>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const PresenterInspector: React.FC<PresenterInspectorProps> = ({
  scene,
  onChange,
  onDelete,
  onDuplicate,
}) => {
  const layouts: Array<{
    id: PresenterSceneItem["layoutMode"];
    label: string;
    icon: string;
  }> = [
    { id: "full", label: "Full Video", icon: "📺" },
    { id: "pip-bottom-right", label: "PiP Bottom-Right", icon: "↘️" },
    { id: "pip-top-right", label: "PiP Top-Right", icon: "↗️" },
    { id: "split-left", label: "Split Left", icon: "⬅️" },
    { id: "split-right", label: "Split Right", icon: "➡️" },
  ];

  return (
    <div className="space-y-4">
      <InspectorHeader
        scene={scene}
        onChange={onChange}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />

      {/* Layout Mode Selector */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Layout & Presentation Mode
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {layouts.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onChange({ layoutMode: l.id })}
              className={`flex items-center gap-1.5 rounded-xl border p-2 text-left text-xs transition-all cursor-pointer ${
                scene.layoutMode === l.id
                  ? "border-blue-500 bg-blue-500/20 text-white font-bold"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span>{l.icon}</span>
              <span className="truncate">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Speaker Name
          </label>
          <input
            type="text"
            value={scene.speakerName || ""}
            onChange={(e) => onChange({ speakerName: e.target.value })}
            placeholder="e.g. Folarin Favour Olaoluwapo"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Speaker Title / Role
          </label>
          <input
            type="text"
            value={scene.speakerTitle || ""}
            onChange={(e) => onChange({ speakerTitle: e.target.value })}
            placeholder="e.g. Cloud Solutions Architect"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Video Source URL
        </label>
        <input
          type="text"
          value={scene.videoUrl || ""}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="test-video.mp4 or S3 URL"
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
        />
      </div>
    </div>
  );
};

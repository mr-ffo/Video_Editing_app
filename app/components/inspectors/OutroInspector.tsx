"use client";

import React from "react";
import type { OutroSceneItem, SceneItem } from "../../../src/types/scene";
import { InspectorHeader } from "./InspectorCommon";

interface OutroInspectorProps {
  scene: OutroSceneItem;
  onChange: (updated: Partial<SceneItem>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const OutroInspector: React.FC<OutroInspectorProps> = ({
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
          Subtitle / Summary
        </label>
        <textarea
          rows={2}
          value={scene.subtitle || ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="e.g. Weekly AWS Architectures, Docker, and Kubernetes Tutorials"
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Call to Action (CTA) Button
        </label>
        <input
          type="text"
          value={scene.ctaText || ""}
          onChange={(e) => onChange({ ctaText: e.target.value })}
          placeholder="e.g. Subscribe on YouTube • Star on GitHub"
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Presenter Name
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
            Social Handle / Channel
          </label>
          <input
            type="text"
            value={scene.speakerHandle || ""}
            onChange={(e) => onChange({ speakerHandle: e.target.value })}
            placeholder="e.g. @syntaxops"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
          />
        </div>
      </div>
    </div>
  );
};

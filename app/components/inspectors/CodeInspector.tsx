"use client";

import React, { useState } from "react";
import type { CodeSceneItem, SceneItem } from "../../../src/types/scene";
import { InspectorHeader } from "./InspectorCommon";

interface CodeInspectorProps {
  scene: CodeSceneItem;
  onChange: (updated: Partial<SceneItem>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  scene,
  onChange,
  onDelete,
  onDuplicate,
}) => {
  const [highlightInput, setHighlightInput] = useState(
    (scene.highlightedLines || []).join(", ")
  );

  const handleHighlightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHighlightInput(val);
    const parsed = val
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    onChange({ highlightedLines: parsed });
  };

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
            Language
          </label>
          <select
            value={scene.language || "typescript"}
            onChange={(e) =>
              onChange({
                language: e.target.value as CodeSceneItem["language"],
              })
            }
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="typescript">TypeScript / JS</option>
            <option value="python">Python</option>
            <option value="yaml">YAML</option>
            <option value="json">JSON</option>
            <option value="bash">Bash / Shell</option>
            <option value="dockerfile">Dockerfile</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Editor Theme
          </label>
          <select
            value={scene.theme || "dark"}
            onChange={(e) =>
              onChange({
                theme: e.target.value as CodeSceneItem["theme"],
              })
            }
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="dark">Dark Slate</option>
            <option value="cyber">Cyber Glow</option>
            <option value="clean">Minimal Clean</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Active Line Number
          </label>
          <input
            type="number"
            min="1"
            value={scene.activeLine || 1}
            onChange={(e) =>
              onChange({ activeLine: parseInt(e.target.value, 10) || 1 })
            }
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Highlighted Lines (csv)
          </label>
          <input
            type="text"
            value={highlightInput}
            onChange={handleHighlightChange}
            placeholder="e.g. 2, 4, 5"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Source Code Snippet
        </label>
        <textarea
          rows={10}
          value={scene.code}
          onChange={(e) => onChange({ code: e.target.value })}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-xs text-white font-mono leading-relaxed focus:border-blue-500 focus:outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

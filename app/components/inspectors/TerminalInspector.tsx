"use client";

import React from "react";
import type { TerminalSceneItem, SceneItem } from "../../../src/types/scene";
import type { TerminalCommand } from "../../../src/components/terminal/TerminalWindow";
import { InspectorHeader } from "./InspectorCommon";

interface TerminalInspectorProps {
  scene: TerminalSceneItem;
  onChange: (updated: Partial<SceneItem>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const TerminalInspector: React.FC<TerminalInspectorProps> = ({
  scene,
  onChange,
  onDelete,
  onDuplicate,
}) => {
  const handleAddCommand = () => {
    const newCmd: TerminalCommand = {
      command: "aws sts get-caller-identity",
      output: [
        `{ "UserId": "AIDAJ...", "Account": "123456789012", "Arn": "arn:aws:iam::..." }`,
      ],
      typingDelayFrames: 15,
      typingSpeed: 2,
      outputDelayFrames: 10,
    };

    onChange({
      commands: [...scene.commands, newCmd],
    });
  };

  const handleUpdateCommand = (
    index: number,
    updated: Partial<TerminalCommand>
  ) => {
    const updatedCmds = [...scene.commands];
    updatedCmds[index] = { ...updatedCmds[index], ...updated };
    onChange({ commands: updatedCmds });
  };

  const handleDeleteCommand = (index: number) => {
    onChange({
      commands: scene.commands.filter((_, idx) => idx !== index),
    });
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
            Section Heading
          </label>
          <input
            type="text"
            value={scene.heading || ""}
            onChange={(e) => onChange({ heading: e.target.value })}
            placeholder="e.g. Deploying Cloud Architecture"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Shell Prompt
          </label>
          <input
            type="text"
            value={scene.prompt || "$"}
            onChange={(e) => onChange({ prompt: e.target.value })}
            placeholder="$ or >>>"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Terminal Theme
        </label>
        <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
          {(["dark", "glass", "matrix"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ theme: t })}
              className={`rounded px-2.5 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                scene.theme === t
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Commands List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Terminal Commands ({scene.commands.length})
          </span>
          <button
            type="button"
            onClick={handleAddCommand}
            className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-bold text-white hover:bg-blue-500 cursor-pointer"
          >
            + Add Command
          </button>
        </div>

        {scene.commands.map((cmd, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">
                Command #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteCommand(idx)}
                className="text-slate-500 hover:text-rose-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400">Command Input</label>
              <input
                type="text"
                value={cmd.command}
                onChange={(e) =>
                  handleUpdateCommand(idx, { command: e.target.value })
                }
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400">
                Output Lines (One per line)
              </label>
              <textarea
                rows={3}
                value={
                  Array.isArray(cmd.output)
                    ? cmd.output.join("\n")
                    : cmd.output || ""
                }
                onChange={(e) =>
                  handleUpdateCommand(idx, {
                    output: e.target.value.split("\n"),
                  })
                }
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

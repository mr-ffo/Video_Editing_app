"use client";

import React from "react";
import { TEMPLATE_PROJECTS, type ProjectTemplate } from "../../../src/data/sceneTemplates";
import { createDefaultScene, type SceneType, type SceneItem } from "../../../src/types/scene";

interface TemplateNavigatorProps {
  onInsertScene: (scene: SceneItem) => void;
  onApplyProjectTemplate?: (template: ProjectTemplate) => void;
}

const INDIVIDUAL_SCENE_TEMPLATES: {
  type: SceneType;
  title: string;
  badge: string;
  icon: string;
  description: string;
}[] = [
  {
    type: "intro",
    title: "Title & Hook Card",
    badge: "Intro",
    icon: "🎬",
    description: "High-impact opening with title, subtitle, and author badge.",
  },
  {
    type: "architecture",
    title: "AWS Cloud Diagram",
    badge: "Diagram",
    icon: "☁️",
    description: "Interactive nodes, VPC containers, and animated pulse connections.",
  },
  {
    type: "terminal",
    title: "Animated Terminal",
    badge: "CLI",
    icon: "💻",
    description: "Realistic terminal execution with prompt, commands, and colored output.",
  },
  {
    type: "code",
    title: "Syntax Code Block",
    badge: "Code",
    icon: "📝",
    description: "Syntax-highlighted code editor with line numbers and filepath.",
  },
  {
    type: "metrics",
    title: "Telemetry & Stats",
    badge: "Metrics",
    icon: "📊",
    description: "Animated numeric counters, percentage changes, and status cards.",
  },
  {
    type: "presenter",
    title: "Presenter & PiP Overlay",
    badge: "Speaker",
    icon: "👤",
    description: "Picture-in-picture speaker layout with split-screen modes.",
  },
  {
    type: "callout",
    title: "Key Takeaway & Warning",
    badge: "Callout",
    icon: "💡",
    description: "Prominent informational callout banner with glowing borders.",
  },
  {
    type: "outro",
    title: "Call-to-Action Outro",
    badge: "Outro",
    icon: "🚀",
    description: "Closing card with subscribe link, handles, and thank-you message.",
  },
];

export const TemplateNavigator: React.FC<TemplateNavigatorProps> = ({
  onInsertScene,
  onApplyProjectTemplate,
}) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-4 pr-1">
      {/* Individual Scene Templates */}
      <div>
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Insert Scene Preset
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {INDIVIDUAL_SCENE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.type}
              type="button"
              onClick={() => {
                const newScene = createDefaultScene(tpl.type, `scene-${Date.now()}`);
                onInsertScene(newScene);
              }}
              className="flex items-start gap-2.5 p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-blue-500/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 group-hover:bg-blue-600/20 text-base">
                {tpl.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 truncate">
                    {tpl.title}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase px-1 rounded bg-slate-800/80">
                    {tpl.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {tpl.description}
                </p>
              </div>
              <span className="text-slate-600 group-hover:text-blue-400 text-xs self-center">
                +
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Complete Project Templates */}
      {onApplyProjectTemplate && (
        <div className="pt-2 border-t border-slate-800">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Complete Project Starters
          </h4>
          <div className="space-y-2">
            {TEMPLATE_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {proj.name}
                  </span>
                  <span className="text-[9px] font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                    {proj.aspectRatio}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 mb-2">
                  {proj.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{proj.scenes.length} scenes</span>
                  <button
                    type="button"
                    onClick={() => onApplyProjectTemplate(proj)}
                    className="px-2 py-0.5 rounded bg-blue-600/80 hover:bg-blue-600 text-white font-semibold transition-colors cursor-pointer"
                  >
                    Load Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

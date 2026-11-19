"use client";

import React from "react";
import {
  type ElementTypography,
  type TypographyPreset,
  SUPPORTED_FONTS,
  TYPOGRAPHY_PRESETS,
} from "../../../src/types/element";

interface TypographyInspectorProps {
  typography: ElementTypography;
  onChange: (updated: Partial<ElementTypography>) => void;
}

export const TypographyInspector: React.FC<TypographyInspectorProps> = ({
  typography,
  onChange,
}) => {
  const handleApplyPreset = (presetKey: TypographyPreset) => {
    const preset = TYPOGRAPHY_PRESETS[presetKey];
    if (preset) {
      onChange(preset);
    }
  };

  return (
    <div className="space-y-4">
      {/* Presets Grid */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Typography Preset
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { id: "technical-title", label: "Technical Title" },
              { id: "section-heading", label: "Section Heading" },
              { id: "subtitle", label: "Subtitle" },
              { id: "code-label", label: "Code Label" },
              { id: "metric-value", label: "Metric Value" },
              { id: "callout", label: "Callout" },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p.id)}
              className={`rounded-lg border px-2 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                typography.preset === p.id
                  ? "border-blue-500 bg-blue-500/20 text-white font-bold"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Font Family
        </label>
        <select
          value={typography.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
        >
          {SUPPORTED_FONTS.map((font) => (
            <option key={font.name} value={font.value}>
              {font.name} ({font.category})
            </option>
          ))}
        </select>
      </div>

      {/* Size and Weight Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Font Size (px)
          </label>
          <input
            type="number"
            min="10"
            max="120"
            value={typography.fontSize || 24}
            onChange={(e) =>
              onChange({ fontSize: parseInt(e.target.value, 10) || 24 })
            }
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Font Weight
          </label>
          <select
            value={String(typography.fontWeight || 500)}
            onChange={(e) => onChange({ fontWeight: e.target.value })}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">SemiBold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="900">Black (900)</option>
          </select>
        </div>
      </div>

      {/* Alignment and Transform */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Text Alignment
          </label>
          <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-0.5">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onChange({ align: a })}
                className={`flex-1 rounded py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                  typography.align === a
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Case Transform
          </label>
          <select
            value={typography.textTransform || "none"}
            onChange={(e) =>
              onChange({
                textTransform: e.target.value as ElementTypography["textTransform"],
              })
            }
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="none">Normal</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="lowercase">lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>
      </div>

      {/* Color and Shadow */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Color:
          </label>
          <input
            type="color"
            value={typography.color || "#ffffff"}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-7 w-8 cursor-pointer rounded-lg border border-slate-700 bg-transparent p-0"
          />
          <span className="text-xs font-mono text-slate-300">
            {typography.color || "#ffffff"}
          </span>
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={typography.shadow ?? false}
            onChange={(e) => onChange({ shadow: e.target.checked })}
            className="rounded border-slate-700"
          />
          <span>Text Shadow</span>
        </label>
      </div>
    </div>
  );
};

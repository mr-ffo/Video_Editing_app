"use client";

import React from "react";
import type { ElementTransform, AlignmentType } from "../../../src/types/element";
import { calculateAlignment, type BoundingBox } from "../../../src/lib/coordinateUtils";

interface TransformInspectorProps {
  transform: ElementTransform;
  canvasWidth: number;
  canvasHeight: number;
  onChange: (updated: Partial<ElementTransform>) => void;
  onAlign?: (type: AlignmentType) => void;
}

export const TransformInspector: React.FC<TransformInspectorProps> = ({
  transform,
  canvasWidth,
  canvasHeight,
  onChange,
  onAlign,
}) => {
  const handleAlignment = (type: AlignmentType) => {
    if (onAlign) {
      onAlign(type);
      return;
    }

    const currentBox: BoundingBox = {
      x: transform.x || 0,
      y: transform.y || 0,
      width: transform.width || 400,
      height: transform.height || 300,
    };

    const [aligned] = calculateAlignment(type, [currentBox], canvasWidth, canvasHeight);
    if (aligned) {
      onChange({ x: aligned.x, y: aligned.y });
    }
  };

  return (
    <div className="space-y-4">
      {/* Alignment Bar */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Canvas Alignment
        </label>
        <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5">
          <button
            type="button"
            onClick={() => handleAlignment("left")}
            title="Align Left"
            className="rounded p-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            ⇠ Left
          </button>
          <button
            type="button"
            onClick={() => handleAlignment("center-h")}
            title="Center Horizontally"
            className="rounded p-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            ⇹ Center
          </button>
          <button
            type="button"
            onClick={() => handleAlignment("right")}
            title="Align Right"
            className="rounded p-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            Right ⇢
          </button>
          <button
            type="button"
            onClick={() => handleAlignment("center-canvas")}
            title="Center Relative to Canvas"
            className="rounded p-1 text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer"
          >
            🎯 Middle
          </button>
          <button
            type="button"
            onClick={() => handleAlignment("top")}
            title="Align Top"
            className="rounded p-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            ⇡ Top
          </button>
          <button
            type="button"
            onClick={() => handleAlignment("center-v")}
            title="Center Vertically"
            className="rounded p-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            ⇕ Middle
          </button>
          <button
            type="button"
            onClick={() => handleAlignment("bottom")}
            title="Align Bottom"
            className="rounded p-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            ⇣ Bottom
          </button>
          <button
            type="button"
            onClick={() => handleAlignment("distribute-h")}
            title="Distribute Evenly"
            className="rounded p-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            ⇋ Spread
          </button>
        </div>
      </div>

      {/* Position (X, Y) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Position X (px)
          </label>
          <input
            type="number"
            value={Math.round(transform.x || 0)}
            onChange={(e) => onChange({ x: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Position Y (px)
          </label>
          <input
            type="number"
            value={Math.round(transform.y || 0)}
            onChange={(e) => onChange({ y: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Dimensions (Width, Height, Aspect Lock) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Dimensions (px)
          </label>
          <button
            type="button"
            onClick={() => onChange({ aspectRatioLocked: !transform.aspectRatioLocked })}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
              transform.aspectRatioLocked
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>{transform.aspectRatioLocked ? "🔒 Locked" : "🔓 Unlocked"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-slate-500">Width</span>
            <input
              type="number"
              min="20"
              value={Math.round(transform.width || 400)}
              onChange={(e) => {
                const w = Math.max(20, parseFloat(e.target.value) || 20);
                if (transform.aspectRatioLocked && transform.width && transform.height) {
                  const ratio = transform.width / transform.height;
                  onChange({ width: w, height: Math.round(w / ratio) });
                } else {
                  onChange({ width: w });
                }
              }}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <span className="text-[10px] text-slate-500">Height</span>
            <input
              type="number"
              min="20"
              value={Math.round(transform.height || 300)}
              onChange={(e) => {
                const h = Math.max(20, parseFloat(e.target.value) || 20);
                if (transform.aspectRatioLocked && transform.width && transform.height) {
                  const ratio = transform.width / transform.height;
                  onChange({ height: h, width: Math.round(h * ratio) });
                } else {
                  onChange({ height: h });
                }
              }}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Rotation, Scale, and Opacity Sliders */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Opacity</span>
            <span className="font-mono text-slate-200">
              {Math.round((transform.opacity ?? 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={transform.opacity ?? 1}
            onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
            className="w-full h-1.5 rounded-lg bg-slate-800 accent-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Scale</span>
            <span className="font-mono text-slate-200">
              {(transform.scale ?? 1).toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={transform.scale ?? 1}
            onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
            className="w-full h-1.5 rounded-lg bg-slate-800 accent-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Rotation</span>
            <span className="font-mono text-slate-200">
              {Math.round(transform.rotation || 0)}°
            </span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={transform.rotation || 0}
            onChange={(e) => onChange({ rotation: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 rounded-lg bg-slate-800 accent-blue-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

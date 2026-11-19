"use client";

import React from "react";
import type { ElementAnimationConfig, AnimationType } from "../../../src/types/element";

interface AnimationInspectorProps {
  animation: ElementAnimationConfig;
  onChange: (updated: Partial<ElementAnimationConfig>) => void;
}

export const AnimationInspector: React.FC<AnimationInspectorProps> = ({
  animation,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Entrance Animation */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Entrance Animation
        </label>
        <select
          value={animation.entrance}
          onChange={(e) =>
            onChange({ entrance: e.target.value as AnimationType })
          }
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="none">None (Instant)</option>
          <option value="fade">Fade In</option>
          <option value="slide-left">Slide In (From Left)</option>
          <option value="slide-right">Slide In (From Right)</option>
          <option value="slide-up">Slide In (From Bottom)</option>
          <option value="slide-down">Slide In (From Top)</option>
          <option value="scale">Scale Pop</option>
          <option value="zoom">Cinematic Zoom</option>
          <option value="reveal">Wipe Reveal</option>
          <option value="typewriter">Typewriter</option>
        </select>
      </div>

      {/* Exit Animation */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Exit Animation
        </label>
        <select
          value={animation.exit}
          onChange={(e) => onChange({ exit: e.target.value as AnimationType })}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="none">None (Instant)</option>
          <option value="fade">Fade Out</option>
          <option value="slide-left">Slide Out (To Left)</option>
          <option value="slide-right">Slide Out (To Right)</option>
          <option value="zoom">Zoom Out</option>
        </select>
      </div>

      {/* Timing and Physics */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Duration (frames)
          </label>
          <input
            type="number"
            min="5"
            max="120"
            step="5"
            value={animation.durationInFrames || 15}
            onChange={(e) =>
              onChange({
                durationInFrames: parseInt(e.target.value, 10) || 15,
              })
            }
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Delay (frames)
          </label>
          <input
            type="number"
            min="0"
            max="120"
            step="5"
            value={animation.delayFrames || 0}
            onChange={(e) =>
              onChange({
                delayFrames: parseInt(e.target.value, 10) || 0,
              })
            }
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Physics / Easing */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Easing Curve
        </label>
        <select
          value={animation.easing || "spring"}
          onChange={(e) =>
            onChange({
              easing: e.target.value as ElementAnimationConfig["easing"],
            })
          }
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="spring">Spring Physics (Bouncy)</option>
          <option value="ease-out">Ease Out (Smooth)</option>
          <option value="ease-in-out">Ease In-Out</option>
          <option value="linear">Linear</option>
        </select>
      </div>
    </div>
  );
};

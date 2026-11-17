"use client";

import React, { useState } from "react";
import type { VideoDurationMinutes } from "../../src/data/timelinePresets";
import type { KeywordCue } from "../../src/types/callout";
import { resolveKeyword } from "../../src/components/callouts/keywordDictionary";

export interface StudioConfig {
  compositionId: "VideoOverlay" | "TechnicalExplainer";
  videoUrl: string;
  videoFileName: string;
  speakerName: string;
  speakerTitle: string;
  episodeTitle: string;
  durationMinutes: VideoDurationMinutes;
  playbackRate: number;
  trimSilenceAndFillers: boolean;
  keywordCues: KeywordCue[];
}

interface SidebarControlsProps {
  config: StudioConfig;
  onChange: (updated: Partial<StudioConfig>) => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  config,
  onChange,
}) => {
  const [newKeyword, setNewKeyword] = useState("");
  const [newTimestamp, setNewTimestamp] = useState("15");

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    const atSec = parseFloat(newTimestamp) || 15;
    const def = resolveKeyword(newKeyword);

    const newCue: KeywordCue = {
      id: `custom-${Date.now()}`,
      keyword: newKeyword.trim(),
      atSeconds: atSec,
      durationFrames: 90,
      badge: def.badge,
      color: def.color,
    };

    onChange({
      keywordCues: [...config.keywordCues, newCue],
    });
    setNewKeyword("");
  };

  const handleRemoveKeyword = (id?: string) => {
    onChange({
      keywordCues: config.keywordCues.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
      {/* 1. Composition Selector */}
      <div>
        <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Template Mode
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ compositionId: "VideoOverlay" })}
            className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
              config.compositionId === "VideoOverlay"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📹 Video Overlay
          </button>
          <button
            type="button"
            onClick={() => onChange({ compositionId: "TechnicalExplainer" })}
            className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
              config.compositionId === "TechnicalExplainer"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📊 Standalone Explainer
          </button>
        </div>
      </div>

      {/* 2. Duration Preset Selector */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Duration Tier
          </label>
          <span className="text-xs font-bold text-amber-400">
            {config.durationMinutes} Min ({config.durationMinutes * 60 * 30} frames)
          </span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {([1, 2, 3, 4, 5] as VideoDurationMinutes[]).map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => onChange({ durationMinutes: min })}
              className={`rounded-lg py-2 text-xs font-bold transition-all ${
                config.durationMinutes === min
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {min}m
            </button>
          ))}
        </div>
      </div>

      {/* 3. Titles & Presenter */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Presenter & Titles
        </label>
        <div>
          <span className="text-[11px] text-slate-400">Episode Title</span>
          <input
            type="text"
            value={config.episodeTitle}
            onChange={(e) => onChange({ episodeTitle: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            placeholder="Episode Title"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[11px] text-slate-400">Speaker Name</span>
            <input
              type="text"
              value={config.speakerName}
              onChange={(e) => onChange({ speakerName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Speaker Role</span>
            <input
              type="text"
              value={config.speakerTitle}
              onChange={(e) => onChange({ speakerTitle: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Speed & Pacing */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            Playback Speed
          </label>
          <span className="text-xs font-bold text-blue-400">
            {config.playbackRate.toFixed(2)}x
          </span>
        </div>
        <input
          type="range"
          min="1.0"
          max="1.3"
          step="0.05"
          value={config.playbackRate}
          onChange={(e) => onChange({ playbackRate: parseFloat(e.target.value) })}
          className="mt-2 w-full accent-blue-500 cursor-pointer"
        />
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>1.0x (Natural)</span>
          <span>1.15x (Paced)</span>
          <span>1.3x (Fast)</span>
        </div>

        {/* Silence & Filler Toggle */}
        <label className="mt-4 flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={config.trimSilenceAndFillers}
            onChange={(e) => onChange({ trimSilenceAndFillers: e.target.checked })}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 accent-blue-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-white">Cut silence & &apos;um&apos; / &apos;like&apos;</span>
            <p className="text-[11px] text-slate-400">Trims dead air & applies punch-in camera cuts</p>
          </div>
        </label>
      </div>

      {/* 5. Keyword Callouts Manager */}
      <div>
        <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Spoken Keyword Badges ({config.keywordCues.length})
        </label>

        {/* Add keyword form */}
        <form onSubmit={handleAddKeyword} className="mt-2 flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="e.g. s3, glacier, cost..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            value={newTimestamp}
            onChange={(e) => setNewTimestamp(e.target.value)}
            placeholder="Sec"
            className="w-16 rounded-xl border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-center text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
          >
            Add
          </button>
        </form>

        {/* Existing keywords list */}
        <div className="mt-3 flex flex-col gap-2 max-h-48 overflow-y-auto">
          {config.keywordCues.map((cue) => {
            const def = resolveKeyword(cue.keyword);
            const timeSec =
              cue.atSeconds ?? Math.round((cue.startFrame ?? 0) / 30);

            return (
              <div
                key={cue.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{def.icon}</span>
                  <div>
                    <p className="font-bold text-white">{def.label}</p>
                    <p className="text-[10px] text-slate-400">
                      At {timeSec}s • {def.badge}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(cue.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors text-sm px-1.5"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Dropzone } from "./components/Dropzone";
import { PlayerPreview } from "./components/PlayerPreview";
import { SidebarControls, type StudioConfig } from "./components/SidebarControls";
import { ExportModal } from "./components/ExportModal";
import { demoKeywordCues } from "../src/data/scenePresets";

const initialConfig: StudioConfig = {
  compositionId: "VideoOverlay",
  videoUrl: "test-video.mp4",
  videoFileName: "test-video.mp4",
  speakerName: "Folarin Favour Olaoluwapo",
  speakerTitle: "Cloud Solutions Architect",
  episodeTitle: "Behind The Cloud • S3 Glacier & FinOps",
  durationMinutes: 1,
  playbackRate: 1.0,
  trimSilenceAndFillers: false,
  keywordCues: demoKeywordCues,
};

export default function StudioDashboard() {
  const [config, setConfig] = useState<StudioConfig>(initialConfig);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleUpdate = (updated: Partial<StudioConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleVideoSelected = (url: string, fileName: string) => {
    handleUpdate({
      videoUrl: url,
      videoFileName: fileName,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#080d1a] text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 font-extrabold text-white shadow-lg shadow-blue-500/20">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white">SyntaxOps</span>
              <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                Studio
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Cloud Motion Graphics & Video Overlay Engine</p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Remotion Player Active
          </span>
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
          >
            🚀 Export on Lambda
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left Column: Video Dropzone & Interactive Player Preview */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Video Dropzone */}
          {config.compositionId === "VideoOverlay" && (
            <Dropzone
              currentFileName={config.videoFileName}
              onVideoSelected={handleVideoSelected}
            />
          )}

          {/* Remotion Interactive Player */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Live Viewport</h2>
                <p className="text-xs text-slate-400">
                  {config.compositionId === "VideoOverlay"
                    ? `Adaptive Video Overlay • ${config.durationMinutes} min timeline`
                    : "Standalone Technical Explainer"}
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400">
                Press <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[10px]">Space</kbd> to play / pause
              </span>
            </div>

            <PlayerPreview config={config} />
          </div>
        </div>

        {/* Right Column: Sidebar Controls */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <div className="border-b border-slate-800/80 px-6 py-4">
            <h2 className="text-sm font-bold text-white">Broadcast Parameters</h2>
            <p className="text-xs text-slate-400">Tune overlays, pacing, and keywords in real time</p>
          </div>
          <SidebarControls config={config} onChange={handleUpdate} />
        </div>
      </main>

      {/* Cloud Render Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        config={config}
      />
    </div>
  );
}

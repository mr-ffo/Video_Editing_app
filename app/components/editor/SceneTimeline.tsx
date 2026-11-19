"use client";

import React, { useRef, useState } from "react";
import type { SceneItem, SceneTransition, SceneTransitionType } from "../../../src/types/scene";
import { calculateTotalScenesDuration } from "../../../src/types/scene";

interface SceneTimelineProps {
  scenes: SceneItem[];
  currentFrame: number;
  isPlaying: boolean;
  selectedSceneId: string | null;
  onSelectScene: (id: string) => void;
  onSeek: (frame: number) => void;
  onTogglePlay: () => void;
  onStepFrames: (delta: number) => void;
  onUpdateScenes?: (updated: SceneItem[]) => void;
  onUpdateSceneDuration?: (sceneId: string, newDurationFrames: number) => void;
  onUpdateSceneTransition?: (sceneId: string, transition: SceneTransition) => void;
  onRecordHistory?: () => void;
}

function formatTimecode(frame: number, fps: number = 30): string {
  const totalSeconds = Math.floor(frame / fps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const frames = Math.floor(frame % fps);

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const ff = String(frames).padStart(2, "0");

  return `${mm}:${ss}:${ff}`;
}

export const SceneTimeline: React.FC<SceneTimelineProps> = ({
  scenes,
  currentFrame,
  isPlaying,
  selectedSceneId,
  onSelectScene,
  onSeek,
  onTogglePlay,
  onStepFrames,
  onUpdateScenes,
  onUpdateSceneDuration,
  onUpdateSceneTransition,
  onRecordHistory,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const totalFrames = calculateTotalScenesDuration(scenes);

  // Precision Timeline State
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1x to 3x
  const [snappingEnabled, setSnappingEnabled] = useState<boolean>(true);
  const [activeTransitionSceneId, setActiveTransitionSceneId] = useState<string | null>(null);

  // Scene Trimming / Boundary Drag State
  const [trimmingSceneId, setTrimmingSceneId] = useState<string | null>(null);
  const [trimStartX, setTrimStartX] = useState<number | null>(null);
  const [initialDuration, setInitialDuration] = useState<number>(90);

  // Compute scene boundary frame ranges
  let accumulated = 0;
  const sceneRanges = scenes.map((scene) => {
    const start = accumulated;
    const duration = scene.hidden ? 0 : scene.durationInFrames || 90;
    const end = start + duration;
    accumulated = end;
    return { scene, start, end, duration };
  });

  // Track click seeking
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || totalFrames <= 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetFrame = Math.round(ratio * totalFrames);
    onSeek(targetFrame);
  };

  // Boundary Drag Handlers
  const handleStartTrim = (e: React.PointerEvent, sceneId: string, duration: number) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    onRecordHistory?.();
    setTrimmingSceneId(sceneId);
    setTrimStartX(e.clientX);
    setInitialDuration(duration);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!trimmingSceneId || trimStartX === null || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const pxPerFrame = rect.width / totalFrames;
    const deltaPx = e.clientX - trimStartX;
    const deltaFrames = Math.round(deltaPx / pxPerFrame);

    let newDuration = Math.max(15, initialDuration + deltaFrames);

    // Apply snapping to whole seconds (30 frames) if enabled
    if (snappingEnabled && Math.abs(newDuration % 30) <= 5) {
      newDuration = Math.round(newDuration / 30) * 30;
    }

    if (onUpdateSceneDuration) {
      onUpdateSceneDuration(trimmingSceneId, newDuration);
    } else if (onUpdateScenes) {
      const updated = scenes.map((s) =>
        s.id === trimmingSceneId ? { ...s, durationInFrames: newDuration } : s
      );
      onUpdateScenes(updated);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setTrimmingSceneId(null);
    setTrimStartX(null);
  };

  // Transition update handler
  const handleUpdateTransition = (
    sceneId: string,
    transition: SceneTransition
  ) => {
    if (onUpdateSceneTransition) {
      onUpdateSceneTransition(sceneId, transition);
    } else if (onUpdateScenes) {
      const updated = scenes.map((s) =>
        s.id === sceneId ? { ...s, transition } : s
      );
      onUpdateScenes(updated);
    }
  };

  const progressPercent = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-xl select-none"
    >
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Transport */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onStepFrames(-10)}
            title="Step back 10 frames"
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            -10f
          </button>
          <button
            type="button"
            onClick={() => onStepFrames(-1)}
            title="Step back 1 frame"
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            -1f
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-8 w-16 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all cursor-pointer"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            type="button"
            onClick={() => onStepFrames(1)}
            title="Step forward 1 frame"
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            +1f
          </button>
          <button
            type="button"
            onClick={() => onStepFrames(10)}
            title="Step forward 10 frames"
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            +10f
          </button>
        </div>

        {/* Zoom & Snapping Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSnappingEnabled(!snappingEnabled)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
              snappingEnabled
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                : "border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300"
            }`}
          >
            <span>🧲</span>
            <span className="hidden sm:inline">Snap: {snappingEnabled ? "ON" : "OFF"}</span>
          </button>

          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
              disabled={zoomLevel <= 1}
              className="rounded px-2 py-1 text-xs text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Zoom Out"
            >
              🔍-
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1">
              {zoomLevel}x
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
              disabled={zoomLevel >= 3}
              className="rounded px-2 py-1 text-xs text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Zoom In"
            >
              🔍+
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="rounded px-1.5 py-1 text-[10px] text-slate-400 hover:text-white cursor-pointer"
              title="Fit Timeline"
            >
              Fit
            </button>
          </div>
        </div>

        {/* Timecode and Frame Readout */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="font-bold text-white">{formatTimecode(currentFrame)}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{formatTimecode(totalFrames)}</span>
          <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-blue-400 border border-slate-800">
            {currentFrame} / {totalFrames} f
          </span>
        </div>
      </div>

      {/* Proportional Scene Track Container (Scrollable when zoomed) */}
      <div className="overflow-x-auto overflow-y-hidden pb-1">
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          style={{ width: `${zoomLevel * 100}%`, minWidth: "100%" }}
          className="relative h-16 rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden cursor-pointer select-none flex"
        >
          {/* Render Scene Track Blocks */}
          {sceneRanges.map(({ scene, duration }, idx) => {
            if (scene.hidden || duration <= 0) return null;
            const widthPct = (duration / totalFrames) * 100;
            const isSelected = scene.id === selectedSceneId;

            // Color accents by scene type
            const getBgStyle = () => {
              if (isSelected) return "bg-blue-600/30 border-blue-500";
              switch (scene.type) {
                case "intro":
                  return "bg-blue-900/20 border-blue-500/30";
                case "presenter":
                  return "bg-indigo-900/20 border-indigo-500/30";
                case "architecture":
                  return "bg-amber-900/20 border-amber-500/30";
                case "terminal":
                  return "bg-emerald-900/20 border-emerald-500/30";
                case "code":
                  return "bg-cyan-900/20 border-cyan-500/30";
                case "metrics":
                  return "bg-purple-900/20 border-purple-500/30";
                case "callout":
                  return "bg-yellow-900/20 border-yellow-500/30";
                case "outro":
                  return "bg-rose-900/20 border-rose-500/30";
                default:
                  return "bg-slate-800/40 border-slate-700/30";
              }
            };

            return (
              <div
                key={scene.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectScene(scene.id);
                }}
                style={{ width: `${widthPct}%` }}
                className={`relative h-full border-r border-t border-b flex flex-col justify-between p-2 transition-colors group ${getBgStyle()}`}
              >
                <div className="flex items-center justify-between overflow-hidden">
                  <span className="truncate text-[11px] font-bold text-slate-100">
                    #{idx + 1} {scene.title || scene.type}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="capitalize">{scene.type}</span>
                  <span>
                    {(duration / 30).toFixed(1)}s ({duration}f)
                  </span>
                </div>

                {/* Interactive Transition Pill between scenes */}
                {scene.transition && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTransitionSceneId(
                        activeTransitionSceneId === scene.id ? null : scene.id
                      );
                    }}
                    title={`Edit Transition: ${scene.transition.type}`}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-blue-500 text-[10px] text-blue-400 hover:scale-125 transition-transform shadow cursor-pointer"
                  >
                    ⚡
                  </button>
                )}

                {/* Right Boundary Drag Handle (Duration Trim) */}
                <div
                  onPointerDown={(e) => handleStartTrim(e, scene.id, duration)}
                  title="Drag boundary to adjust duration"
                  className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-blue-500/50 group-hover:bg-blue-500/20 transition-colors z-10 flex items-center justify-center"
                >
                  <div className="h-4 w-0.5 rounded bg-blue-400/80" />
                </div>
              </div>
            );
          })}

          {/* Playhead Marker */}
          <div
            style={{ left: `${progressPercent}%` }}
            className="pointer-events-none absolute top-0 bottom-0 z-30 w-0.5 bg-rose-500 shadow-[0_0_10px_#f43f5e]"
          >
            <div className="absolute -top-1 -left-1.5 h-3 w-3.5 rounded-sm bg-rose-500 clip-triangle" />
          </div>
        </div>
      </div>

      {/* Popover: Transition Editor */}
      {activeTransitionSceneId && (
        <div className="rounded-xl border border-blue-500/40 bg-slate-900/95 p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-400">⚡ Transition Settings:</span>
            <select
              value={
                scenes.find((s) => s.id === activeTransitionSceneId)?.transition
                  ?.type || "crossfade"
              }
              onChange={(e) =>
                handleUpdateTransition(activeTransitionSceneId, {
                  type: e.target.value as SceneTransitionType,
                  durationInFrames: 15,
                })
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white"
            >
              <option value="crossfade">Crossfade</option>
              <option value="fade-black">Fade Through Black</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
              <option value="cut">Cut (Instant)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Duration (frames):</span>
            <input
              type="number"
              min="5"
              max="60"
              step="5"
              value={
                scenes.find((s) => s.id === activeTransitionSceneId)?.transition
                  ?.durationInFrames || 15
              }
              onChange={(e) => {
                const current =
                  scenes.find((s) => s.id === activeTransitionSceneId)?.transition || {
                    type: "crossfade",
                    durationInFrames: 15,
                  };
                handleUpdateTransition(activeTransitionSceneId, {
                  ...current,
                  durationInFrames: parseInt(e.target.value, 10) || 15,
                });
              }}
              className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white font-mono"
            />
            <button
              type="button"
              onClick={() => setActiveTransitionSceneId(null)}
              className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

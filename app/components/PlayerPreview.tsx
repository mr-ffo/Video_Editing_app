"use client";

import React, { useMemo, useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { AdaptiveVideoOverlay } from "../../src/compositions/AdaptiveVideoOverlay";
import { TechnicalExplainer } from "../../src/compositions/TechnicalExplainer";
import { DynamicSceneComposition } from "../../src/compositions/DynamicSceneComposition";
import { ASPECT_RATIOS, calculateTotalScenesDuration, type AspectRatio, type SceneItem } from "../../src/types/scene";
import type { StudioConfig } from "./SidebarControls";
import { InteractiveCanvas } from "./editor/InteractiveCanvas";

interface PlayerPreviewProps {
  config: StudioConfig;
  scenes?: SceneItem[];
  aspectRatio?: AspectRatio;
  selectedScene?: SceneItem | null;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateScene?: (updated: Partial<SceneItem>) => void;
  onRecordHistory?: () => void;
  showGrid?: boolean;
  showSafeArea?: boolean;
  canvasEditMode?: boolean;
  zoomLevel?: number;
  playerRef?: React.RefObject<PlayerRef | null>;
  onFrameUpdate?: (frame: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
}

export const PlayerPreview: React.FC<PlayerPreviewProps> = ({
  config,
  scenes = [],
  aspectRatio = "16:9",
  selectedScene = null,
  selectedElementId = null,
  onSelectElement,
  onUpdateScene,
  onRecordHistory,
  showGrid = false,
  showSafeArea = false,
  canvasEditMode = true,
  zoomLevel = 1.0,
  playerRef: externalPlayerRef,
  onFrameUpdate,
  onPlayStateChange,
}) => {
  const internalPlayerRef = useRef<PlayerRef>(null);
  const playerRef = externalPlayerRef || internalPlayerRef;

  const isDynamic = config.compositionId === "DynamicProject";
  const isExplainer = config.compositionId === "TechnicalExplainer";

  const { width, height } = useMemo(() => {
    if (isDynamic) {
      return ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS["16:9"];
    }
    return { width: 1920, height: 1080 };
  }, [isDynamic, aspectRatio]);

  const durationInFrames = useMemo(() => {
    if (isDynamic) {
      return Math.max(30, calculateTotalScenesDuration(scenes));
    }
    if (isExplainer) return 1200;
    return config.durationMinutes * 60 * 30;
  }, [isDynamic, isExplainer, scenes, config.durationMinutes]);

  const component = useMemo(() => {
    if (isDynamic) return DynamicSceneComposition;
    if (isExplainer) return TechnicalExplainer;
    return AdaptiveVideoOverlay;
  }, [isDynamic, isExplainer]);

  const inputProps = useMemo(() => {
    if (isDynamic) {
      return {
        scenes,
        aspectRatio,
      };
    }
    if (isExplainer) {
      return {
        episodeTitle: config.episodeTitle,
        speakerName: config.speakerName,
        speakerTitle: config.speakerTitle,
      };
    }
    return {
      durationMinutes: config.durationMinutes,
      videoSrc: config.videoUrl,
      customKeywordCues: config.keywordCues,
      episodeTitle: config.episodeTitle,
      speakerName: config.speakerName,
      speakerTitle: config.speakerTitle,
      playbackRate: config.playbackRate,
      trimSilenceAndFillers: config.trimSilenceAndFillers,
    };
  }, [
    isDynamic,
    isExplainer,
    scenes,
    aspectRatio,
    config.durationMinutes,
    config.videoUrl,
    config.keywordCues,
    config.episodeTitle,
    config.speakerName,
    config.speakerTitle,
    config.playbackRate,
    config.trimSilenceAndFillers,
  ]);

  // Hook player listeners to synchronize timeline and timecode
  useEffect(() => {
    const current = playerRef.current;
    if (!current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFrame = (e: any) => {
      if (typeof e?.detail?.frame === "number") {
        onFrameUpdate?.(e.detail.frame);
      }
    };
    const onPlay = () => onPlayStateChange?.(true);
    const onPause = () => onPlayStateChange?.(false);

    current.addEventListener("frameupdate", onFrame);
    current.addEventListener("play", onPlay);
    current.addEventListener("pause", onPause);

    return () => {
      current.removeEventListener("frameupdate", onFrame);
      current.removeEventListener("play", onPlay);
      current.removeEventListener("pause", onPause);
    };
  }, [playerRef, onFrameUpdate, onPlayStateChange]);

  // Viewport container aspect styling
  const containerClass = useMemo(() => {
    if (!isDynamic || aspectRatio === "16:9") {
      return "w-full aspect-video max-w-4xl";
    }
    if (aspectRatio === "9:16") {
      return "w-[340px] aspect-[9/16] max-h-[600px]";
    }
    return "w-[480px] aspect-square max-h-[500px]";
  }, [isDynamic, aspectRatio]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      <div
        className={`relative ${containerClass} rounded-2xl overflow-hidden border border-slate-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.8)] bg-slate-950 transition-all duration-300`}
        style={{
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(37, 99, 235, 0.15)",
          transform: zoomLevel !== 1.0 ? `scale(${zoomLevel})` : undefined,
          transformOrigin: "center center",
        }}
      >
        <Player
          ref={playerRef}
          component={component}
          durationInFrames={durationInFrames}
          compositionWidth={width}
          compositionHeight={height}
          fps={30}
          controls
          autoPlay={false}
          loop
          acknowledgeRemotionLicense
          inputProps={inputProps}
          style={{
            width: "100%",
            height: "100%",
          }}
        />

        {/* Grid Overlay Guides */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Rule of Thirds */}
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-cyan-400/20" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-cyan-400/20" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-cyan-400/20" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-cyan-400/20" />
            {/* Center Crosshair */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-indigo-400/25 border-r border-dashed border-indigo-400/30" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-indigo-400/25 border-b border-dashed border-indigo-400/30" />
          </div>
        )}

        {/* Safe Area Guides */}
        {showSafeArea && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* 90% Action Safe */}
            <div className="absolute inset-[5%] border border-dashed border-amber-400/30 rounded flex items-start justify-start p-1">
              <span className="text-[9px] font-mono text-amber-400/50 bg-black/40 px-1 rounded">
                90% Action Safe
              </span>
            </div>
            {/* 80% Title Safe */}
            <div className="absolute inset-[10%] border border-dashed border-cyan-400/30 rounded flex items-start justify-start p-1">
              <span className="text-[9px] font-mono text-cyan-400/50 bg-black/40 px-1 rounded">
                80% Title Safe
              </span>
            </div>
          </div>
        )}

        {/* Interactive Direct-Manipulation Canvas Overlay */}
        {isDynamic && canvasEditMode && selectedScene && (
          <InteractiveCanvas
            scene={selectedScene}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
            onUpdateScene={onUpdateScene}
            onRecordHistory={onRecordHistory}
            aspectRatio={aspectRatio}
            canvasWidth={width}
            canvasHeight={height}
          />
        )}
      </div>

      {/* Timeline landmark badges below player */}
      <div className="mt-3 flex items-center justify-between w-full max-w-4xl px-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {isDynamic
              ? `Dynamic Scene Composition • ${width}x${height} (${aspectRatio})`
              : "Broadcast Remotion Player • 1080p 30fps"}
          </span>
          {canvasEditMode && isDynamic && (
            <span className="ml-2 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Interactive Canvas Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{durationInFrames} frames total</span>
          <span>•</span>
          <span className="text-amber-400">{(durationInFrames / 30).toFixed(1)}s total</span>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useMemo } from "react";
import { Player } from "@remotion/player";
import { AdaptiveVideoOverlay } from "../../src/compositions/AdaptiveVideoOverlay";
import { TechnicalExplainer } from "../../src/compositions/TechnicalExplainer";
import type { StudioConfig } from "./SidebarControls";

interface PlayerPreviewProps {
  config: StudioConfig;
}

export const PlayerPreview: React.FC<PlayerPreviewProps> = ({ config }) => {
  const isExplainer = config.compositionId === "TechnicalExplainer";

  const durationInFrames = useMemo(() => {
    if (isExplainer) return 1200;
    return config.durationMinutes * 60 * 30;
  }, [isExplainer, config.durationMinutes]);

  const component = useMemo(() => {
    if (isExplainer) {
      return TechnicalExplainer;
    }
    return AdaptiveVideoOverlay;
  }, [isExplainer]);

  const inputProps = useMemo(() => {
    if (isExplainer) {
      return {};
    }
    return {
      durationMinutes: config.durationMinutes,
      videoSrc: config.videoUrl,
      customKeywordCues: config.keywordCues,
    };
  }, [isExplainer, config.durationMinutes, config.videoUrl, config.keywordCues]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      <div
        className="relative w-full aspect-video max-w-4xl rounded-2xl overflow-hidden border border-slate-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.8)] bg-slate-950"
        style={{
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(37, 99, 235, 0.15)",
        }}
      >
        <Player
          component={component}
          durationInFrames={durationInFrames}
          compositionWidth={1920}
          compositionHeight={1080}
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
      </div>

      {/* Timeline landmark badges below player */}
      <div className="mt-3 flex items-center justify-between w-full max-w-4xl px-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Interactive Remotion Player • 1080p 30fps</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{durationInFrames} frames total</span>
          <span>•</span>
          <span className="text-amber-400">{(durationInFrames / 30).toFixed(0)}s total</span>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { OffthreadVideo, Series, staticFile, useVideoConfig } from "remotion";
import type { CutRegion, WordTimestamp } from "../../types/video";
import { calculateSpeechSegments, detectSilenceAndFillers } from "./cutOptimizer";

export interface SmartVideoProps {
  src?: string;
  totalDurationInFrames?: number;
  /** Playback speed multiplier (e.g. 1.1 for 10% faster pacing). Default: 1.0 */
  playbackRate?: number;
  volume?: number;
  muted?: boolean;
  /** Explicit list of regions to cut (silence, filler words, retakes) */
  cuts?: CutRegion[];
  /** Optional word timestamps from Whisper transcription to auto-detect cuts */
  words?: WordTimestamp[];
  /** Custom list of filler words to remove (defaults to "um", "uh", "em", "like", etc.) */
  fillerWords?: string[];
  /** Silence threshold in milliseconds before cutting dead air. Default: 450ms */
  maxSilenceMs?: number;
  /**
   * Disguises jump cuts by subtly alternating scale (1.0x vs 1.06x) across cuts,
   * mimicking a multi-camera interview setup. Default: true
   */
  punchInOnCuts?: boolean;
  /** Cinematic dark vignette around edges. Default: true */
  vignette?: boolean;
  /** Subtle brand navy tint overlay. Default: 0.04 */
  brandTintOpacity?: number;
  /** Subtle procedural SVG film grain. Default: true */
  grain?: boolean;
  style?: React.CSSProperties;
}

/**
 * SmartVideo: Intelligent programmatic video component for Remotion.
 * Features:
 * - Speed ramping via pitch-corrected playbackRate.
 * - Automatic dead silence trimming & filler word removal ("um", "uh", "like").
 * - Frame-accurate <Series> splicing with zero external video editing tools.
 * - Dynamic punch-in camera scaling to disguise jump cuts.
 * - Unified cinematic color grading (vignette, brand tint, film grain).
 */
export const SmartVideo: React.FC<SmartVideoProps> = ({
  src = "test-video.mp4",
  totalDurationInFrames,
  playbackRate = 1.0,
  volume = 1,
  muted = false,
  cuts: directCuts = [],
  words,
  fillerWords,
  maxSilenceMs = 450,
  punchInOnCuts = true,
  vignette = true,
  brandTintOpacity = 0.04,
  grain = true,
  style,
}) => {
  const { fps, durationInFrames: configDuration } = useVideoConfig();
  const duration = totalDurationInFrames ?? configDuration ?? 1800;

  // Resolve source URL
  const resolvedSrc =
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("blob:") ||
    src.startsWith("data:")
      ? src
      : staticFile(src);

  // 1. Auto-detect silence and filler words from word timestamps if provided
  const detectedCuts = words
    ? detectSilenceAndFillers(words, {
        maxSilenceMs,
        fillerWords,
        fps,
      })
    : [];

  const allCuts = [...directCuts, ...detectedCuts];

  // 2. Compute the kept speech segments and jump-cut punch-in scales
  const speechSegments = calculateSpeechSegments(
    duration,
    allCuts,
    fps,
    punchInOnCuts
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#000000",
        ...style,
      }}
    >
      {/* Spliced speech segments via Remotion Series */}
      {speechSegments.length === 1 ? (
        // Single segment (no cuts needed)
        <OffthreadVideo
          src={resolvedSrc}
          playbackRate={playbackRate}
          volume={volume}
          muted={muted}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        // Multi-segment spliced playback skipping silence & filler words
        <Series>
          {speechSegments.map((seg) => (
            <Series.Sequence
              key={seg.id}
              durationInFrames={seg.durationFrames}
              name={`Speech-${seg.id}`}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `scale(${seg.scaleMultiplier})`,
                  transformOrigin: "center center",
                  overflow: "hidden",
                }}
              >
                <OffthreadVideo
                  src={resolvedSrc}
                  startFrom={seg.startFrame}
                  endAt={seg.endFrame}
                  playbackRate={playbackRate}
                  volume={volume}
                  muted={muted}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </Series.Sequence>
          ))}
        </Series>
      )}

      {/* Brand Color Tint Overlay */}
      {brandTintOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#1a1a2e",
            opacity: brandTintOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Film Grain Texture Overlay */}
      {grain && (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.035,
            pointerEvents: "none",
            mixBlendMode: "overlay",
          }}
        >
          <filter id="smart-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#smart-grain)" />
        </svg>
      )}

      {/* Cinematic Vignette */}
      {vignette && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.72) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

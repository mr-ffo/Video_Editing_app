import React from "react";
import { OffthreadVideo, staticFile } from "remotion";

export interface BackgroundVideoProps {
  src?: string;
  durationInFrames?: number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  style?: React.CSSProperties;
  volume?: number;
  playbackRate?: number;
  muted?: boolean;
  /** Render a radial dark vignette around the edges. Default: true */
  vignette?: boolean;
  /** Overlay opacity for the brand navy tint (0–1). Default: 0.04 */
  brandTintOpacity?: number;
  /** Render a subtle SVG film grain/noise texture overlay. Default: true */
  grain?: boolean;
}

/**
 * Reusable background video component using Remotion's OffthreadVideo
 * for frame-accurate, deterministic video decoding.
 * Includes an optional cinematic vignette, brand colour tint overlay, and film grain.
 */
export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  src = "test-video.mp4",
  durationInFrames,
  objectFit = "cover",
  style,
  volume = 1,
  playbackRate = 1,
  muted = false,
  vignette = true,
  brandTintOpacity = 0.04,
  grain = true,
}) => {
  // If src does not start with http/https/blob, resolve via staticFile
  const resolvedSrc =
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("blob:") ||
    src.startsWith("data:")
      ? src
      : staticFile(src);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      <OffthreadVideo
        src={resolvedSrc}
        durationInFrames={durationInFrames}
        volume={volume}
        playbackRate={playbackRate}
        muted={muted}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
        }}
      />

      {/* Brand tint: subtle navy overlay for colour consistency */}
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

      {/* Film grain texture: subtle procedural SVG noise without external assets */}
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
          <filter id="bg-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#bg-grain)" />
        </svg>
      )}

      {/* Cinematic vignette: radial dark shadow around edges */}
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

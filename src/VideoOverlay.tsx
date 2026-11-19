import React from "react";
import {
  AdaptiveVideoOverlay,
  type AdaptiveVideoOverlayProps,
} from "./compositions/AdaptiveVideoOverlay";
import type { KeywordCue } from "./types/callout";

export interface VideoOverlayProps extends Partial<AdaptiveVideoOverlayProps> {
  keywordCues?: KeywordCue[];
}

/**
 * Master VideoOverlay composition coordinated via modular scene architecture.
 * Preserves 100% baseline visual fidelity, frame landmarks, and broadcast split-screen physics.
 * Unifies preview and export to use the canonical AdaptiveVideoOverlay engine.
 */
export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  keywordCues,
  customKeywordCues,
  durationMinutes = 1,
  ...rest
}) => {
  return (
    <AdaptiveVideoOverlay
      durationMinutes={durationMinutes}
      customKeywordCues={keywordCues ?? customKeywordCues}
      {...rest}
    />
  );
};

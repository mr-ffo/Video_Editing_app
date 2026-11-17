import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import type { KeywordCue } from "../../types/callout";
import { KeywordCallout } from "./KeywordCallout";

export interface KeywordOverlayProps {
  cues?: KeywordCue[];
  style?: React.CSSProperties;
}

/**
 * KeywordOverlay manages an array of spoken keyword cues,
 * automatically rendering each keyword at its designated timestamp
 * with smart vertical stacking when cues overlap in time.
 */
export const KeywordOverlay: React.FC<KeywordOverlayProps> = ({
  cues = [],
  style,
}) => {
  const { fps } = useVideoConfig();

  // Resolve startFrame and duration for all cues
  const resolvedCues = cues.map((cue, index) => {
    const start =
      cue.startFrame ??
      (cue.atSeconds !== undefined ? Math.round(cue.atSeconds * fps) : 0);
    const duration = cue.durationFrames ?? 75; // 2.5s default

    return {
      ...cue,
      id: cue.id ?? `cue-${index}-${cue.keyword}`,
      startFrame: start,
      durationFrames: duration,
      endFrame: start + duration,
    };
  });

  // Calculate stack offsets for overlapping cues
  const stackedCues = resolvedCues.map((cue, index) => {
    // Count active prior cues that overlap with this cue's startFrame
    const overlappingPriorCues = resolvedCues
      .slice(0, index)
      .filter((other) => other.startFrame <= cue.startFrame && other.endFrame > cue.startFrame);

    return {
      ...cue,
      stackOffsetIndex: overlappingPriorCues.length,
    };
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        ...style,
      }}
    >
      {stackedCues.map((cue) => (
        <Sequence
          key={cue.id}
          from={cue.startFrame}
          durationInFrames={cue.durationFrames}
          name={`Keyword-${cue.keyword}`}
        >
          <KeywordCallout
            keyword={cue.keyword}
            customLabel={cue.customLabel}
            customIcon={cue.customIcon}
            badge={cue.badge}
            color={cue.color}
            position={cue.position}
            stackOffsetIndex={cue.stackOffsetIndex}
            durationInFrames={cue.durationFrames}
          />
        </Sequence>
      ))}
    </div>
  );
};

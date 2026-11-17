import type { CutRegion, SpeechSegment, WordTimestamp } from "../../types/video";

export const DEFAULT_FILLER_WORDS = [
  "um",
  "uh",
  "em",
  "eh",
  "er",
  "ah",
  "like",
  "you know",
  "basically",
  "actually",
];

export interface DetectOptions {
  maxSilenceMs?: number;
  fillerWords?: string[];
  naturalPauseMs?: number;
  fps?: number;
}

/**
 * Detects dead silence gaps and filler words ("um", "uh", "em", "like", etc.)
 * from transcribed word timestamps.
 */
export const detectSilenceAndFillers = (
  words: WordTimestamp[],
  options: DetectOptions = {}
): CutRegion[] => {
  const {
    maxSilenceMs = 450,
    fillerWords = DEFAULT_FILLER_WORDS,
    naturalPauseMs = 120,
    fps = 30,
  } = options;

  const cuts: CutRegion[] = [];
  const normalizedFillers = new Set(fillerWords.map((f) => f.toLowerCase().trim()));

  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    const cleanText = current.text.toLowerCase().replace(/[^a-z]/g, "");

    // 1. Check for filler word
    if (normalizedFillers.has(cleanText)) {
      cuts.push({
        startSeconds: current.startMs / 1000,
        endSeconds: current.endMs / 1000,
        startFrame: Math.round((current.startMs / 1000) * fps),
        endFrame: Math.round((current.endMs / 1000) * fps),
        reason: `filler_${cleanText}`,
      });
    }

    // 2. Check for silence gap before next word
    if (i < words.length - 1) {
      const next = words[i + 1];
      const silenceMs = next.startMs - current.endMs;

      if (silenceMs > maxSilenceMs) {
        // Keep a natural breath pause of ~naturalPauseMs
        const cutStartMs = current.endMs + naturalPauseMs;
        const cutEndMs = next.startMs;

        if (cutEndMs > cutStartMs) {
          cuts.push({
            startSeconds: cutStartMs / 1000,
            endSeconds: cutEndMs / 1000,
            startFrame: Math.round((cutStartMs / 1000) * fps),
            endFrame: Math.round((cutEndMs / 1000) * fps),
            reason: "silence",
          });
        }
      }
    }
  }

  return cuts;
};

/**
 * Inverts an array of cut regions against the total video duration to produce
 * the clean, kept SpeechSegment intervals for Remotion's <Series> splicing.
 * Optionally alternates punch-in scale (1.0x vs 1.06x) across cuts to disguise jump cuts.
 */
export const calculateSpeechSegments = (
  totalDurationFrames: number,
  cuts: CutRegion[] = [],
  fps: number = 30,
  punchInOnCuts: boolean = true
): SpeechSegment[] => {
  if (cuts.length === 0) {
    return [
      {
        id: "seg-0",
        startFrame: 0,
        endFrame: totalDurationFrames,
        durationFrames: totalDurationFrames,
        scaleMultiplier: 1.0,
      },
    ];
  }

  // Normalize all cut intervals to frames
  const normalizedCuts = cuts
    .map((c) => ({
      start: c.startFrame ?? Math.round((c.startSeconds ?? 0) * fps),
      end: c.endFrame ?? Math.round((c.endSeconds ?? 0) * fps),
    }))
    .filter((c) => c.end > c.start && c.start < totalDurationFrames)
    .sort((a, b) => a.start - b.start);

  // Merge overlapping or adjacent cuts
  const mergedCuts: Array<{ start: number; end: number }> = [];
  for (const cut of normalizedCuts) {
    const prev = mergedCuts[mergedCuts.length - 1];
    if (!prev) {
      mergedCuts.push({ ...cut });
    } else if (cut.start <= prev.end) {
      prev.end = Math.max(prev.end, cut.end);
    } else {
      mergedCuts.push({ ...cut });
    }
  }

  const segments: SpeechSegment[] = [];
  let currentFrame = 0;
  let segmentIndex = 0;

  for (const cut of mergedCuts) {
    const clampedCutStart = Math.min(cut.start, totalDurationFrames);

    if (clampedCutStart > currentFrame) {
      const duration = clampedCutStart - currentFrame;
      if (duration > 0) {
        const isPunchIn = punchInOnCuts && segmentIndex % 2 === 1;
        segments.push({
          id: `seg-${segmentIndex}`,
          startFrame: currentFrame,
          endFrame: clampedCutStart,
          durationFrames: duration,
          scaleMultiplier: isPunchIn ? 1.06 : 1.0,
        });
        segmentIndex++;
      }
    }

    currentFrame = Math.max(currentFrame, Math.min(cut.end, totalDurationFrames));
  }

  // Remaining segment after the last cut
  if (currentFrame < totalDurationFrames) {
    const duration = totalDurationFrames - currentFrame;
    if (duration > 0) {
      const isPunchIn = punchInOnCuts && segmentIndex % 2 === 1;
      segments.push({
        id: `seg-${segmentIndex}`,
        startFrame: currentFrame,
        endFrame: totalDurationFrames,
        durationFrames: duration,
        scaleMultiplier: isPunchIn ? 1.06 : 1.0,
      });
    }
  }

  return segments;
};

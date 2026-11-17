export type CutReason =
  | "silence"
  | "filler_um"
  | "filler_uh"
  | "filler_em"
  | "filler_so"
  | "filler_like"
  | "retake"
  | "custom";

export interface CutRegion {
  startFrame?: number;
  endFrame?: number;
  startSeconds?: number;
  endSeconds?: number;
  reason?: CutReason | string;
}

export interface SpeechSegment {
  id: string;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  scaleMultiplier: number;
}

export interface WordTimestamp {
  text: string;
  startMs: number;
  endMs: number;
  confidence?: number | null;
}

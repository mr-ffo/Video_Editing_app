import test from "node:test";
import assert from "node:assert";
import {
  calculateSpeechSegments,
  detectSilenceAndFillers,
} from "../src/components/video/cutOptimizer";
import type { CutRegion, WordTimestamp } from "../src/types/video";

test("calculateSpeechSegments: Empty cuts returns single full-length segment", () => {
  const segments = calculateSpeechSegments(1800, []);

  assert.strictEqual(segments.length, 1);
  assert.strictEqual(segments[0].startFrame, 0);
  assert.strictEqual(segments[0].endFrame, 1800);
  assert.strictEqual(segments[0].durationFrames, 1800);
  assert.strictEqual(segments[0].scaleMultiplier, 1.0);
});

test("calculateSpeechSegments: Single cut creates two speech segments with punch-in zoom", () => {
  const cuts: CutRegion[] = [{ startFrame: 300, endFrame: 450, reason: "silence" }];
  const segments = calculateSpeechSegments(1800, cuts, 30, true);

  assert.strictEqual(segments.length, 2);

  // Segment 1 (pre-cut): frames 0 to 300, 1.0x wide
  assert.strictEqual(segments[0].startFrame, 0);
  assert.strictEqual(segments[0].endFrame, 300);
  assert.strictEqual(segments[0].durationFrames, 300);
  assert.strictEqual(segments[0].scaleMultiplier, 1.0);

  // Segment 2 (post-cut): frames 450 to 1800, 1.06x punch-in close-up!
  assert.strictEqual(segments[1].startFrame, 450);
  assert.strictEqual(segments[1].endFrame, 1800);
  assert.strictEqual(segments[1].durationFrames, 1350);
  assert.strictEqual(segments[1].scaleMultiplier, 1.06);

  // Sum of kept speech frames + cut frames equals original 1800 frames
  const totalKept = segments.reduce((sum, s) => sum + s.durationFrames, 0);
  assert.strictEqual(totalKept + 150, 1800);
});

test("calculateSpeechSegments: Merges overlapping cuts safely", () => {
  const overlappingCuts: CutRegion[] = [
    { startFrame: 100, endFrame: 180 },
    { startFrame: 150, endFrame: 220 }, // overlaps with previous
  ];
  const segments = calculateSpeechSegments(1000, overlappingCuts, 30, false);

  assert.strictEqual(segments.length, 2);
  assert.strictEqual(segments[0].startFrame, 0);
  assert.strictEqual(segments[0].endFrame, 100);

  // Merged cut ends at 220
  assert.strictEqual(segments[1].startFrame, 220);
  assert.strictEqual(segments[1].endFrame, 1000);
});

test("detectSilenceAndFillers: Automatically flags filler words ('um', 'like') and dead silence", () => {
  const words: WordTimestamp[] = [
    { text: "Amazon", startMs: 1000, endMs: 1400 },
    { text: "S3", startMs: 1450, endMs: 1800 },
    { text: "um", startMs: 1900, endMs: 2300 }, // filler word!
    // Dead silence from 2300 to 3500 (1200ms silence > 450ms threshold)
    { text: "Glacier", startMs: 3500, endMs: 4000 },
    { text: "like", startMs: 4050, endMs: 4300 }, // filler word!
    { text: "storage", startMs: 4350, endMs: 4800 },
  ];

  const cuts = detectSilenceAndFillers(words, { maxSilenceMs: 450, fps: 30 });

  // Should flag: "um" filler, silence between um & Glacier, and "like" filler
  assert.strictEqual(cuts.length, 3);

  const fillerUm = cuts.find((c) => c.reason === "filler_um");
  assert.ok(fillerUm, "Filler 'um' was not detected");

  const silenceCut = cuts.find((c) => c.reason === "silence");
  assert.ok(silenceCut, "Silence cut was not detected");

  const fillerLike = cuts.find((c) => c.reason === "filler_like");
  assert.ok(fillerLike, "Filler 'like' was not detected");
});

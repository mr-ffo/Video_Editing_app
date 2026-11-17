import test from "node:test";
import assert from "node:assert";
import {
  calculateFade,
  calculateSlideX,
  calculateScalePop,
  calculateSplitScreenTransition,
  calculateSpring,
} from "../src/animations";

test("calculateFade() - correctly computes clamped opacity across timeline", () => {
  const duration = 450;

  // Frame 0: exactly 0
  assert.strictEqual(calculateFade(0, duration), 0);

  // Before frame 0: clamped to 0
  assert.strictEqual(calculateFade(-10, duration), 0);

  // Frame 15 (fadeIn end): exactly 1
  assert.strictEqual(calculateFade(15, duration), 1);

  // Midpoint hold (frame 200): exactly 1
  assert.strictEqual(calculateFade(200, duration), 1);

  // Fade-out start (450 - 15 = 435): exactly 1
  assert.strictEqual(calculateFade(435, duration), 1);

  // Fade-out end (frame 450): exactly 0
  assert.strictEqual(calculateFade(450, duration), 0);

  // Beyond duration: clamped to 0
  assert.strictEqual(calculateFade(460, duration), 0);

  // Custom options
  const custom = calculateFade(10, 100, {
    fadeInFrames: 20,
    initialOpacity: 0.2,
    targetOpacity: 0.8,
  });
  assert.strictEqual(custom, 0.5); // halfway between 0.2 and 0.8
});

test("calculateSlideX() - computes horizontal entrance and exit with clamping", () => {
  const duration = 120;

  // Frame 0: starts at default distance (-120)
  assert.strictEqual(calculateSlideX(0, duration), -120);

  // Before 0: clamped
  assert.strictEqual(calculateSlideX(-5, duration), -120);

  // Frame 25 (slideIn end): settles at 0
  assert.strictEqual(calculateSlideX(25, duration), 0);

  // Hold phase (frame 60): stays at 0
  assert.strictEqual(calculateSlideX(60, duration), 0);

  // Exit end (frame 120): exits to default exitDistance (-60)
  assert.strictEqual(calculateSlideX(120, duration), -60);

  // Beyond duration: clamped to -60
  assert.strictEqual(calculateSlideX(130, duration), -60);
});

test("calculateScalePop() - computes spring scale with bounce overshoot", () => {
  const fps = 30;

  // Frame 0: starts at 0
  const scaleAt0 = calculateScalePop(0, fps);
  assert.strictEqual(scaleAt0, 0);

  // Frame 6: progressing upward
  const scaleAt6 = calculateScalePop(6, fps);
  assert.ok(scaleAt6 > 0.5 && scaleAt6 < 1.2, `scaleAt6 was ${scaleAt6}`);

  // Peak overshoot around frame 10-14 should exceed 1.0
  let maxScale = 0;
  for (let f = 1; f <= 25; f++) {
    const s = calculateScalePop(f, fps);
    if (s > maxScale) maxScale = s;
  }
  assert.ok(maxScale > 1.0, `Expected overshoot > 1.0, got ${maxScale}`);

  // Settles near 1.0 around frame 35
  const scaleAt35 = calculateScalePop(35, fps);
  assert.ok(
    Math.abs(scaleAt35 - 1.0) < 0.05,
    `Expected scale near 1.0, got ${scaleAt35}`
  );
});

test("calculateSplitScreenTransition() - computes broadcast transform parameters", () => {
  const startFrame = 600;
  const fps = 30;

  // Before start frame (e.g. 500): videoScale=1, videoTranslateY=0
  const before = calculateSplitScreenTransition(500, startFrame, fps);
  assert.strictEqual(before.progress, 0);
  assert.strictEqual(before.scale, 1);
  assert.strictEqual(before.translateY, 0);
  assert.strictEqual(before.transform, "scale(1) translateY(0px)");

  // At start frame (600): transition starts
  const atStart = calculateSplitScreenTransition(600, startFrame, fps);
  assert.strictEqual(atStart.progress, 0);
  assert.strictEqual(atStart.scale, 1);
  assert.strictEqual(atStart.translateY, 0);

  // After transition settles (e.g. frame 640): scale=0.7, translateY=250
  const settled = calculateSplitScreenTransition(640, startFrame, fps);
  assert.ok(
    Math.abs(settled.scale - 0.7) < 0.02,
    `Expected scale ~0.7, got ${settled.scale}`
  );
  assert.ok(
    Math.abs(settled.translateY - 250) < 5,
    `Expected translateY ~250, got ${settled.translateY}`
  );
});

test("calculateSpring() - supports presets, delays, and clamping", () => {
  const fps = 30;

  // Snappy preset with delay 15
  const beforeDelay = calculateSpring({
    frame: 10,
    fps,
    delay: 15,
    preset: "snappy",
  });
  assert.strictEqual(beforeDelay, 0);

  const atDelay = calculateSpring({
    frame: 15,
    fps,
    delay: 15,
    preset: "snappy",
  });
  assert.strictEqual(atDelay, 0);

  const afterDelay = calculateSpring({
    frame: 25,
    fps,
    delay: 15,
    preset: "snappy",
  });
  assert.ok(afterDelay > 0.5, `afterDelay was ${afterDelay}`);
});

import test from "node:test";
import assert from "node:assert";
import { interpolate } from "remotion";
import { standardEase } from "../src/animations/easing";

test("Cinematic wipe transition calculates valid polygon percentage across frames", () => {
  const duration = 20;

  const calculateWipePercent = (localFrame: number): number => {
    const progress = interpolate(localFrame, [0, duration], [0, 1], {
      easing: standardEase,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return progress * 100;
  };

  assert.strictEqual(calculateWipePercent(0), 0);
  assert.strictEqual(calculateWipePercent(20), 100);
  assert.ok(calculateWipePercent(10) > 0 && calculateWipePercent(10) < 100);
});

test("Cinematic slide transition calculates directional offsets", () => {
  const duration = 20;
  const offset = 120;

  const calculateSlideX = (localFrame: number, direction: "left" | "right") => {
    const startX = direction === "left" ? -offset : offset;
    return interpolate(localFrame, [0, duration], [startX, 0], {
      easing: standardEase,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  assert.strictEqual(calculateSlideX(0, "left"), -120);
  assert.strictEqual(calculateSlideX(20, "left"), 0);
  assert.strictEqual(calculateSlideX(0, "right"), 120);
  assert.strictEqual(calculateSlideX(20, "right"), 0);
});

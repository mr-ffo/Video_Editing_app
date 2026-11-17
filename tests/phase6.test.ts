import test from "node:test";
import assert from "node:assert";
import { getProviderTheme } from "../src/components/diagrams/providerRegistry";
import { interpolate } from "remotion";
import { standardEase } from "../src/animations/easing";

test("Provider Registry resolves distinct themes for cloud providers and falls back to generic", () => {
  const aws = getProviderTheme("aws");
  assert.strictEqual(aws.name, "Amazon Web Services");
  assert.strictEqual(aws.badge, "☁️");
  assert.strictEqual(aws.primaryColor, "#ff9900");

  const k8s = getProviderTheme("kubernetes");
  assert.strictEqual(k8s.name, "Kubernetes");
  assert.strictEqual(k8s.badge, "☸️");

  const fallback = getProviderTheme(undefined);
  assert.strictEqual(fallback.id, "generic");
});

test("Terminal typing calculation is deterministic across frames", () => {
  const command = "aws s3 ls";
  const typingStart = 15;
  const typingSpeed = 2; // 2 frames per character

  const calculateCharsTyped = (localFrame: number): number => {
    if (localFrame < typingStart) return 0;
    return Math.min(command.length, Math.floor((localFrame - typingStart) / typingSpeed));
  };

  // Before typing starts
  assert.strictEqual(calculateCharsTyped(10), 0);

  // Exactly at typing start
  assert.strictEqual(calculateCharsTyped(15), 0);

  // 2 frames in: 1 character ("a")
  assert.strictEqual(calculateCharsTyped(17), 1);
  assert.strictEqual(command.slice(0, calculateCharsTyped(17)), "a");

  // 6 frames in: 3 characters ("aws")
  assert.strictEqual(calculateCharsTyped(21), 3);
  assert.strictEqual(command.slice(0, calculateCharsTyped(21)), "aws");

  // Fully typed
  const completeFrame = typingStart + command.length * typingSpeed;
  assert.strictEqual(calculateCharsTyped(completeFrame), command.length);
  assert.strictEqual(calculateCharsTyped(completeFrame + 50), command.length);
});

test("Animated counter numeric interpolation produces expected clamped value", () => {
  const from = 0;
  const to = 1000;
  const duration = 45;

  const at0 = interpolate(0, [0, duration], [from, to], {
    easing: standardEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  assert.strictEqual(at0, 0);

  const atMid = interpolate(22, [0, duration], [from, to], {
    easing: standardEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // standardEase is a steep ease-out (reaches ~96% by midpoint)
  assert.ok(atMid > 850 && atMid < 1000, `Midpoint was ${atMid}`);

  const atEnd = interpolate(duration, [0, duration], [from, to], {
    easing: standardEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  assert.strictEqual(atEnd, 1000);
});

test("Section progress calculation accurately tracks completion", () => {
  const totalDuration = 300;

  const progressAt150 = interpolate(150, [0, totalDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  assert.strictEqual(progressAt150, 0.5);

  const progressAt300 = interpolate(300, [0, totalDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  assert.strictEqual(progressAt300, 1.0);
});

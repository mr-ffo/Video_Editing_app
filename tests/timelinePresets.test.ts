import test from "node:test";
import assert from "node:assert";
import { getTimelineForDuration, type VideoDurationMinutes } from "../src/data/timelinePresets";

test("Timeline Presets generate strictly validated durations for 1, 2, 3, 4, and 5 minutes", () => {
  const tiers: VideoDurationMinutes[] = [1, 2, 3, 4, 5];

  for (const min of tiers) {
    const schedule = getTimelineForDuration(min);

    // Frame arithmetic check (30 fps)
    assert.strictEqual(schedule.totalDurationFrames, min * 60 * 30);
    assert.strictEqual(schedule.durationMinutes, min);

    // Opening branding check
    assert.ok(schedule.scenes.titleIntro, `Tier ${min}m missing titleIntro`);
    assert.strictEqual(schedule.scenes.titleIntro.startFrame, 0);

    // Speaker lower third check
    assert.ok(schedule.scenes.speakerLowerThird, `Tier ${min}m missing speakerLowerThird`);

    // Split screen intervals check
    assert.ok(schedule.splitScreenIntervals.length >= 1, `Tier ${min}m missing splitScreenIntervals`);

    // Verify all split-screen intervals fit within total duration and have valid start < restore
    for (const interval of schedule.splitScreenIntervals) {
      assert.ok(
        interval.startFrame < interval.restoreFrame,
        `Interval start ${interval.startFrame} must precede restore ${interval.restoreFrame}`
      );
      assert.ok(
        interval.restoreFrame <= schedule.totalDurationFrames,
        `Interval restore ${interval.restoreFrame} exceeds duration ${schedule.totalDurationFrames}`
      );
    }

    // Verify keyword cues exist
    assert.ok(schedule.keywordCues.length > 0, `Tier ${min}m missing keyword cues`);
  }
});

test("5-Minute Tier orchestrates comprehensive multi-scene tutorial architecture", () => {
  const schedule5m = getTimelineForDuration(5);

  assert.strictEqual(schedule5m.totalDurationFrames, 9000);
  assert.strictEqual(schedule5m.splitScreenIntervals.length, 4);

  // Verifies all required scenes exist
  assert.ok(schedule5m.scenes.titleIntro);
  assert.ok(schedule5m.scenes.speakerLowerThird);
  assert.ok(schedule5m.scenes.architecture1);
  assert.ok(schedule5m.scenes.terminalDemo);
  assert.ok(schedule5m.scenes.metricsDashboard);
  assert.ok(schedule5m.scenes.architecture2);
  assert.ok(schedule5m.scenes.outroCard);
});

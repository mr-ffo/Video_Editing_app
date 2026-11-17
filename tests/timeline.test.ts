import test from "node:test";
import assert from "node:assert";
import { defaultVideoOverlayScenes } from "../src/data/scenePresets";
import { timing } from "../src/theme/timing";

test("Timeline manifest matches approved baseline scene landmarks", () => {
  assert.strictEqual(defaultVideoOverlayScenes.length, 3);

  const titleScene = defaultVideoOverlayScenes.find((s) => s.type === "title");
  assert.ok(titleScene);
  assert.strictEqual(titleScene.startFrame, 0);
  assert.strictEqual(titleScene.durationInFrames, timing.scenes.titleCardDuration);

  const speakerScene = defaultVideoOverlayScenes.find((s) => s.type === "speaker");
  assert.ok(speakerScene);
  assert.strictEqual(speakerScene.startFrame, 100);
  assert.strictEqual(speakerScene.durationInFrames, timing.scenes.lowerThirdDuration);

  const archScene = defaultVideoOverlayScenes.find((s) => s.type === "architecture");
  assert.ok(archScene);
  assert.strictEqual(archScene.startFrame, 600);
  assert.strictEqual(archScene.durationInFrames, timing.scenes.cloudDiagramDuration);
});

test("Timeline scenes fit comfortably within total 1800 frames duration", () => {
  for (const scene of defaultVideoOverlayScenes) {
    const endFrame = scene.startFrame + scene.durationInFrames;
    assert.ok(
      endFrame <= timing.scenes.totalDuration,
      `Scene ${scene.id} ends at ${endFrame}, which exceeds total ${timing.scenes.totalDuration}`
    );
  }
});

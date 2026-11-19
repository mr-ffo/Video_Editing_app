import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateTotalScenesDuration,
  createDefaultScene,
  type SceneItem,
  type AspectRatio,
} from "../src/types/scene";
import { TEMPLATE_PROJECTS } from "../src/data/sceneTemplates";
import {
  createNewProject,
  duplicateProject,
  exportProjectToJson,
  importProjectFromJson,
} from "../src/lib/projectStorage";

test("Scene Editor: calculateTotalScenesDuration correctly computes sum of non-hidden scenes", () => {
  const scenes: SceneItem[] = [
    { ...createDefaultScene("intro"), durationInFrames: 120, hidden: false },
    { ...createDefaultScene("terminal"), durationInFrames: 240, hidden: false },
    { ...createDefaultScene("metrics"), durationInFrames: 180, hidden: true }, // hidden
    { ...createDefaultScene("outro"), durationInFrames: 90, hidden: false },
  ];

  const total = calculateTotalScenesDuration(scenes);
  // 120 + 240 + 90 = 450
  assert.equal(total, 450);

  // Fallback on empty
  assert.equal(calculateTotalScenesDuration([]), 90);
});

test("Scene Editor: createDefaultScene creates rich typed scenes for all scene types", () => {
  const sceneTypes = [
    "intro",
    "presenter",
    "architecture",
    "terminal",
    "code",
    "metrics",
    "callout",
    "outro",
  ] as const;

  for (const type of sceneTypes) {
    const scene = createDefaultScene(type, "test-id");
    assert.equal(scene.type, type);
    assert.ok(scene.id.includes(type));
    assert.ok(scene.durationInFrames > 0);
    assert.ok(scene.title.length > 0);

    if (scene.type === "architecture") {
      assert.ok(scene.nodes.length >= 2);
      assert.ok(scene.connections.length >= 1);
    } else if (scene.type === "terminal") {
      assert.ok(scene.commands.length >= 1);
      assert.ok(scene.commands[0].command.length > 0);
    } else if (scene.type === "code") {
      assert.ok(scene.code.length > 0);
      assert.ok(scene.language);
    } else if (scene.type === "metrics") {
      assert.ok(scene.metrics.length >= 1);
    }
  }
});

test("Scene Editor: TEMPLATE_PROJECTS are all valid, non-empty, and well-formed", () => {
  assert.equal(TEMPLATE_PROJECTS.length, 4);

  const expectedTemplates = [
    "AWS Serverless Deep Dive",
    "DevOps CI/CD Automation",
    "Cloud Security & Zero-Trust IAM",
    "Quick Terminal Tip (Shorts / 9:16)",
  ];

  for (let i = 0; i < TEMPLATE_PROJECTS.length; i++) {
    const t = TEMPLATE_PROJECTS[i];
    assert.equal(t.name, expectedTemplates[i]);
    assert.ok(t.scenes.length >= 4);
    assert.ok(["16:9", "9:16", "1:1"].includes(t.aspectRatio));

    // Ensure all scene IDs within the template are unique
    const ids = new Set(t.scenes.map((s) => s.id));
    assert.equal(ids.size, t.scenes.length);
  }
});

test("Scene Editor: Scene addition, reordering, duplication, and deletion isolate state", () => {
  const initialScenes: SceneItem[] = [
    createDefaultScene("intro", "1"),
    createDefaultScene("code", "2"),
    createDefaultScene("outro", "3"),
  ];

  // 1. Addition
  const newScene = createDefaultScene("terminal", "4");
  const withAdded = [...initialScenes, newScene];
  assert.equal(withAdded.length, 4);
  assert.equal(withAdded[3].id, newScene.id);

  // 2. Reordering
  const reordered = [withAdded[1], withAdded[0], withAdded[2], withAdded[3]];
  assert.equal(reordered[0].type, "code");
  assert.equal(reordered[1].type, "intro");

  // 3. Duplication
  const target = reordered[0];
  const duplicated: SceneItem = {
    ...JSON.parse(JSON.stringify(target)),
    id: `scene-${target.type}-${Date.now()}`,
    title: `${target.title} (Copy)`,
  };
  const withDup = [reordered[0], duplicated, ...reordered.slice(1)];
  assert.equal(withDup.length, 5);
  assert.equal(withDup[1].title, `${target.title} (Copy)`);
  assert.notEqual(withDup[1].id, target.id);

  // 4. Deletion
  const withDel = withDup.filter((s) => s.id !== duplicated.id);
  assert.equal(withDel.length, 4);
  assert.ok(!withDel.some((s) => s.id === duplicated.id));
});

test("Scene Editor: StudioProject persists scenes and aspectRatio through export/import", () => {
  const customScenes = [
    createDefaultScene("intro", "custom-1"),
    createDefaultScene("architecture", "custom-2"),
  ];
  const customAspectRatio: AspectRatio = "9:16";

  const project = createNewProject(
    "Cloud Architecture Explainer",
    { compositionId: "DynamicProject" },
    customAspectRatio,
    customScenes
  );

  assert.equal(project.aspectRatio, "9:16");
  assert.equal(project.scenes?.length, 2);
  assert.equal(project.config.compositionId, "DynamicProject");

  // Clone project
  const duplicated = duplicateProject(project, "Cloud Architecture Explainer (Cloned)");
  assert.equal(duplicated.aspectRatio, "9:16");
  assert.equal(duplicated.scenes?.length, 2);
  assert.notEqual(duplicated.id, project.id);

  // Export to JSON and re-import
  const jsonStr = exportProjectToJson(project);
  const reimported = importProjectFromJson(jsonStr);

  assert.equal(reimported.aspectRatio, "9:16");
  assert.equal(reimported.scenes?.length, 2);
  assert.equal(reimported.scenes?.[0].type, "intro");
  assert.equal(reimported.scenes?.[1].type, "architecture");
});

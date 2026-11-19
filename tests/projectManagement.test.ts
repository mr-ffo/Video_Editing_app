import test from "node:test";
import assert from "node:assert";
import {
  createNewProject,
  duplicateProject,
  validateProjectSchema,
  sanitizeConfigForStorage,
  loadProjectsFromStorage,
  saveProjectsToStorage,
  exportProjectToJson,
  importProjectFromJson,
  PROJECTS_STORAGE_KEY,
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  type StorageAdapter,
} from "../src/lib/projectStorage";
import type { StudioProject } from "../src/types/project";

// Mock in-memory storage adapter simulating browser localStorage
const createMockStorage = (initialData: Record<string, string> = {}): StorageAdapter & { store: Record<string, string> } => {
  const store = { ...initialData };
  return {
    store,
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
};

test("Project: createNewProject initializes versioned StudioProject with clean IDs and timestamps", () => {
  const p = createNewProject("FinOps Deep Dive");
  assert.strictEqual(p.name, "FinOps Deep Dive");
  assert.strictEqual(p.schemaVersion, 1);
  assert.ok(p.id.startsWith("proj_"));
  assert.ok(p.createdAt);
  assert.ok(p.updatedAt);
  assert.strictEqual(p.config.compositionId, "VideoOverlay");
  assert.strictEqual(validateProjectSchema(p), true);
});

test("Project: duplicateProject creates deep clone without shared mutable references", () => {
  const original = createNewProject("Original Master", {
    speakerName: "Jane Doe",
    keywordCues: [{ id: "k1", keyword: "s3", startFrame: 30, durationFrames: 90 }],
  });

  const duplicate = duplicateProject(original);

  assert.notStrictEqual(duplicate.id, original.id, "Duplicate must receive a unique ID");
  assert.strictEqual(duplicate.name, "Original Master (Copy)");
  assert.strictEqual(duplicate.config.speakerName, "Jane Doe");

  // Mutate duplicate's keyword cues and verify original is unchanged
  duplicate.config.keywordCues.push({
    id: "k2",
    keyword: "glacier",
    startFrame: 60,
    durationFrames: 90,
  });
  duplicate.config.speakerName = "Changed Name";

  assert.strictEqual(original.config.keywordCues.length, 1, "Original cues must remain untouched");
  assert.strictEqual(duplicate.config.keywordCues.length, 2, "Duplicate cues updated");
  assert.strictEqual(original.config.speakerName, "Jane Doe");
});

test("Project: sanitizeConfigForStorage clears ephemeral blob: URLs", () => {
  const project = createNewProject("Blob URL Test", {
    videoUrl: "blob:http://localhost:3000/1234-5678-abcdef",
    videoFileName: "production-cut.mp4",
  });

  const sanitized = sanitizeConfigForStorage(project.config);
  assert.strictEqual(sanitized.videoUrl, "", "Blob URL must be stripped");
  assert.strictEqual(sanitized.videoFileName, "production-cut.mp4", "File name preserved");

  const normalProject = createNewProject("Normal URL Test", {
    videoUrl: "https://my-bucket.s3.amazonaws.com/video.mp4",
  });
  const normalSanitized = sanitizeConfigForStorage(normalProject.config);
  assert.strictEqual(normalSanitized.videoUrl, "https://my-bucket.s3.amazonaws.com/video.mp4");
});

test("Project: loadProjectsFromStorage migrates legacy syntax_ops_studio_config seamlessly", () => {
  const legacyConfig = {
    compositionId: "TechnicalExplainer",
    speakerName: "Legacy Speaker",
    speakerTitle: "Legacy Architect",
    episodeTitle: "Migrated Legacy Episode",
    durationMinutes: 3,
    playbackRate: 1.0,
    trimSilenceAndFillers: true,
    keywordCues: [],
  };

  const storage = createMockStorage({
    [LEGACY_STORAGE_KEY]: JSON.stringify(legacyConfig),
  });

  const { projects, activeProjectId } = loadProjectsFromStorage(storage);

  assert.strictEqual(projects.length, 1, "Legacy config must be migrated into exactly 1 project");
  const migrated = projects[0];
  assert.strictEqual(migrated.name, "Migrated Legacy Episode");
  assert.strictEqual(migrated.config.compositionId, "TechnicalExplainer");
  assert.strictEqual(migrated.config.speakerName, "Legacy Speaker");
  assert.strictEqual(activeProjectId, migrated.id);

  // Storage should now contain migrated projects_v1
  assert.ok(storage.store[PROJECTS_STORAGE_KEY]);
  assert.strictEqual(storage.store[ACTIVE_PROJECT_ID_STORAGE_KEY], migrated.id);
});

test("Project: Multiple projects coexist, persist, and isolate changes", () => {
  const storage = createMockStorage();

  const p1 = createNewProject("Project Alpha");
  const p2 = createNewProject("Project Beta");
  const p3 = createNewProject("Project Gamma");

  saveProjectsToStorage([p1, p2, p3], p2.id, storage);

  // Reload from storage
  const loaded = loadProjectsFromStorage(storage);
  assert.strictEqual(loaded.projects.length, 3);
  assert.strictEqual(loaded.activeProjectId, p2.id, "Active project must restore Project Beta");

  // Edit Project Alpha and save
  const updatedAlpha: StudioProject = {
    ...p1,
    name: "Project Alpha Renamed",
    config: { ...p1.config, episodeTitle: "Alpha Special Edition" },
  };

  saveProjectsToStorage([updatedAlpha, p2, p3], updatedAlpha.id, storage);

  const reloaded = loadProjectsFromStorage(storage);
  assert.strictEqual(reloaded.activeProjectId, updatedAlpha.id);
  const foundAlpha = reloaded.projects.find((p) => p.id === p1.id);
  const foundBeta = reloaded.projects.find((p) => p.id === p2.id);

  assert.strictEqual(foundAlpha?.name, "Project Alpha Renamed");
  assert.strictEqual(foundBeta?.name, "Project Beta", "Beta must remain untouched");
});

test("Project: Deleting a project isolates remaining projects", () => {
  const storage = createMockStorage();

  const p1 = createNewProject("P1");
  const p2 = createNewProject("P2");
  const p3 = createNewProject("P3");

  saveProjectsToStorage([p1, p2, p3], p2.id, storage);

  // Delete P2 (which is active)
  const remaining = [p1, p3];
  const newActiveId = p1.id;
  saveProjectsToStorage(remaining, newActiveId, storage);

  const reloaded = loadProjectsFromStorage(storage);
  assert.strictEqual(reloaded.projects.length, 2);
  assert.strictEqual(reloaded.activeProjectId, p1.id);
  assert.ok(!reloaded.projects.some((p) => p.id === p2.id));
});

test("Project: exportProjectToJson and importProjectFromJson preserve data integrity with new ID", () => {
  const original = createNewProject("Distributed Systems Masterclass", {
    episodeTitle: "Raft Consensus in Go",
    speakerName: "Alex Rivera",
    durationMinutes: 4,
  });

  const jsonStr = exportProjectToJson(original);
  assert.ok(jsonStr.includes("syntax_ops_project"), "Envelope header must be present");
  assert.ok(jsonStr.includes("Raft Consensus in Go"));

  const imported = importProjectFromJson(jsonStr);
  assert.strictEqual(imported.name, "Distributed Systems Masterclass");
  assert.strictEqual(imported.config.episodeTitle, "Raft Consensus in Go");
  assert.strictEqual(imported.config.speakerName, "Alex Rivera");
  assert.strictEqual(imported.config.durationMinutes, 4);

  // Must have a new unique ID to avoid overwriting existing project with same ID
  assert.notStrictEqual(imported.id, original.id);
  assert.strictEqual(validateProjectSchema(imported), true);
});

test("Project: importProjectFromJson rejects malformed or invalid projects safely", () => {
  assert.throws(() => {
    importProjectFromJson("not-valid-json");
  }, /Unexpected token|JSON/);

  assert.throws(() => {
    importProjectFromJson(JSON.stringify({ name: "Broken", schemaVersion: 99 }));
  }, /Invalid project structure/);
});

test("Project: loadProjectsFromStorage recovers gracefully from corrupted storage", () => {
  const storage = createMockStorage({
    [PROJECTS_STORAGE_KEY]: "corrupted-json-data",
  });

  const { projects, activeProjectId } = loadProjectsFromStorage(storage);
  assert.ok(projects.length >= 1, "Must fall back to default project on corrupted JSON");
  assert.ok(activeProjectId);
  assert.strictEqual(validateProjectSchema(projects[0]), true);
});

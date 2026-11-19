import { random } from "remotion";
import type { StudioConfig } from "../../app/components/SidebarControls";
import { demoKeywordCues } from "../data/scenePresets";
import {
  type StudioProject,
  type ProjectExportEnvelope,
  type AspectRatio,
  type SceneItem,
  PROJECT_SCHEMA_VERSION,
} from "../types/project";
import { TEMPLATE_PROJECTS } from "../data/sceneTemplates";

const generateUniqueId = (): string => {
  return `proj_${Date.now()}_${random(null).toString(36).substring(2, 8)}`;
};

export const PROJECTS_STORAGE_KEY = "syntax_ops_projects_v1";
export const ACTIVE_PROJECT_ID_STORAGE_KEY = "syntax_ops_active_project_id_v1";
export const LEGACY_STORAGE_KEY = "syntax_ops_studio_config";

export const defaultInitialConfig: StudioConfig = {
  compositionId: "VideoOverlay",
  videoUrl: "test-video.mp4",
  videoFileName: "test-video.mp4",
  speakerName: "Folarin Favour Olaoluwapo",
  speakerTitle: "Cloud Solutions Architect",
  episodeTitle: "Behind The Cloud • S3 Glacier & FinOps",
  durationMinutes: 1,
  playbackRate: 1.0,
  trimSilenceAndFillers: false,
  keywordCues: demoKeywordCues,
};

/**
 * Strips volatile/ephemeral blob: URLs before persistence.
 */
export const sanitizeConfigForStorage = (config: StudioConfig): StudioConfig => {
  return {
    ...config,
    videoUrl:
      typeof config.videoUrl === "string" && config.videoUrl.startsWith("blob:")
        ? ""
        : config.videoUrl,
  };
};

/**
 * Validates that an arbitrary JSON object conforms to the StudioProject schema.
 */
export const validateProjectSchema = (data: unknown): data is StudioProject => {
  if (!data || typeof data !== "object") return false;
  const p = data as Partial<StudioProject>;

  if (typeof p.id !== "string" || !p.id.trim()) return false;
  if (typeof p.name !== "string" || !p.name.trim()) return false;
  if (p.schemaVersion !== PROJECT_SCHEMA_VERSION) return false;
  if (typeof p.createdAt !== "string" || !p.createdAt) return false;
  if (typeof p.updatedAt !== "string" || !p.updatedAt) return false;

  // Validate config structure
  if (!p.config || typeof p.config !== "object") return false;
  const c = p.config as Partial<StudioConfig>;

  if (
    c.compositionId !== "VideoOverlay" &&
    c.compositionId !== "TechnicalExplainer" &&
    c.compositionId !== "DynamicProject"
  ) {
    return false;
  }

  if (
    typeof c.durationMinutes !== "number" ||
    c.durationMinutes < 1 ||
    c.durationMinutes > 5
  ) {
    return false;
  }

  return true;
};

/**
 * Creates a new blank project.
 */
export const createNewProject = (
  name: string = "Untitled Project",
  initialConfig?: Partial<StudioConfig>,
  aspectRatio: AspectRatio = "16:9",
  scenes?: SceneItem[]
): StudioProject => {
  const now = new Date().toISOString();
  const id = generateUniqueId();
  const defaultScenes = TEMPLATE_PROJECTS[0]?.scenes
    ? JSON.parse(JSON.stringify(TEMPLATE_PROJECTS[0].scenes))
    : [];

  return {
    id,
    name: name.trim() || "Untitled Project",
    schemaVersion: PROJECT_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    aspectRatio,
    scenes: scenes ? JSON.parse(JSON.stringify(scenes)) : defaultScenes,
    config: sanitizeConfigForStorage({
      ...defaultInitialConfig,
      ...initialConfig,
    }),
  };
};

/**
 * Deep clones a project with a new ID, name + " (Copy)", and updated timestamps.
 * Guarantees no mutable references are shared with the source project.
 */
export const duplicateProject = (
  source: StudioProject,
  customName?: string
): StudioProject => {
  const now = new Date().toISOString();
  const clonedConfig: StudioConfig = JSON.parse(JSON.stringify(source.config));
  const clonedScenes = source.scenes
    ? JSON.parse(JSON.stringify(source.scenes))
    : TEMPLATE_PROJECTS[0]?.scenes
    ? JSON.parse(JSON.stringify(TEMPLATE_PROJECTS[0].scenes))
    : [];

  return {
    id: generateUniqueId(),
    name: customName || `${source.name} (Copy)`,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    aspectRatio: source.aspectRatio || "16:9",
    scenes: clonedScenes,
    config: sanitizeConfigForStorage(clonedConfig),
  };
};

/**
 * LocalStorage Adapter with fallback for Node.js test environments.
 */
export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

const getDefaultStorage = (): StorageAdapter | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

/**
 * Retrieves all stored projects, applying legacy migration if needed.
 */
export const loadProjectsFromStorage = (
  storage: StorageAdapter | null = getDefaultStorage()
): { projects: StudioProject[]; activeProjectId: string } => {
  if (!storage) {
    const fallback = createNewProject("Behind The Cloud Ep. 1");
    return { projects: [fallback], activeProjectId: fallback.id };
  }

  try {
    const rawProjects = storage.getItem(PROJECTS_STORAGE_KEY);

    if (rawProjects) {
      const parsed = JSON.parse(rawProjects);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validProjects = parsed.filter(validateProjectSchema);
        if (validProjects.length > 0) {
          const hydratedProjects: StudioProject[] = validProjects.map((p) => ({
            ...p,
            aspectRatio: p.aspectRatio || "16:9",
            scenes:
              p.scenes && p.scenes.length > 0
                ? p.scenes
                : JSON.parse(JSON.stringify(TEMPLATE_PROJECTS[0]?.scenes || [])),
          }));

          const storedActiveId = storage.getItem(ACTIVE_PROJECT_ID_STORAGE_KEY);
          const activeProjectId =
            hydratedProjects.find((p) => p.id === storedActiveId)?.id ||
            hydratedProjects[0].id;

          return { projects: hydratedProjects, activeProjectId };
        }
      }
    }

    // Check for Legacy Migration from P0.4 (syntax_ops_studio_config)
    const legacyRaw = storage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      try {
        const legacyConfig = JSON.parse(legacyRaw);
        const migratedProject = createNewProject(
          legacyConfig.episodeTitle || "Behind The Cloud Ep. 1",
          legacyConfig
        );

        storage.setItem(
          PROJECTS_STORAGE_KEY,
          JSON.stringify([migratedProject])
        );
        storage.setItem(ACTIVE_PROJECT_ID_STORAGE_KEY, migratedProject.id);

        return {
          projects: [migratedProject],
          activeProjectId: migratedProject.id,
        };
      } catch {
        // Fall through to initial project
      }
    }

    // Default first-run project
    const defaultProject = createNewProject("Behind The Cloud Ep. 1");
    storage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([defaultProject]));
    storage.setItem(ACTIVE_PROJECT_ID_STORAGE_KEY, defaultProject.id);

    return { projects: [defaultProject], activeProjectId: defaultProject.id };
  } catch (error) {
    console.warn("Error reading projects from storage, falling back:", error);
    const fallback = createNewProject("Behind The Cloud Ep. 1");
    return { projects: [fallback], activeProjectId: fallback.id };
  }
};

/**
 * Persists projects and active project ID to storage.
 */
export const saveProjectsToStorage = (
  projects: StudioProject[],
  activeProjectId: string,
  storage: StorageAdapter | null = getDefaultStorage()
): void => {
  if (!storage) return;

  try {
    const sanitizedProjects = projects.map((p) => ({
      ...p,
      config: sanitizeConfigForStorage(p.config),
    }));

    storage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(sanitizedProjects));
    storage.setItem(ACTIVE_PROJECT_ID_STORAGE_KEY, activeProjectId);
  } catch (error) {
    console.error("Failed to persist projects to storage:", error);
  }
};

/**
 * Exports a project as an envelope JSON string.
 */
export const exportProjectToJson = (project: StudioProject): string => {
  const envelope: ProjectExportEnvelope = {
    type: "syntax_ops_project",
    version: PROJECT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    project: {
      ...project,
      config: sanitizeConfigForStorage(project.config),
    },
  };
  return JSON.stringify(envelope, null, 2);
};

/**
 * Parses and validates an imported project JSON string.
 * Supports both enveloped format and raw StudioProject format.
 */
export const importProjectFromJson = (jsonStr: string): StudioProject => {
  const parsed = JSON.parse(jsonStr);

  let candidate: unknown = parsed;
  if (parsed && typeof parsed === "object" && "project" in parsed) {
    candidate = parsed.project;
  }

  if (!validateProjectSchema(candidate)) {
    throw new Error(
      "Invalid project structure: Missing required project metadata or configuration fields."
    );
  }

  // Generate fresh unique ID on import to prevent collision with existing projects
  const cand = candidate as StudioProject;
  return {
    ...cand,
    id: generateUniqueId(),
    updatedAt: new Date().toISOString(),
    aspectRatio: cand.aspectRatio || "16:9",
    scenes:
      cand.scenes && cand.scenes.length > 0
        ? cand.scenes
        : JSON.parse(JSON.stringify(TEMPLATE_PROJECTS[0]?.scenes || [])),
    config: sanitizeConfigForStorage(cand.config),
  };
};

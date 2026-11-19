import type { StudioConfig } from "../../app/components/SidebarControls";
import type { AspectRatio, SceneItem } from "./scene";

export const PROJECT_SCHEMA_VERSION = 1 as const;

export interface StudioProject {
  id: string;
  name: string;
  schemaVersion: typeof PROJECT_SCHEMA_VERSION;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  config: StudioConfig;
  aspectRatio?: AspectRatio;
  scenes?: SceneItem[];
}

export interface ProjectExportEnvelope {
  type: "syntax_ops_project";
  version: typeof PROJECT_SCHEMA_VERSION;
  exportedAt: string;
  project: StudioProject;
}

export * from "./scene";

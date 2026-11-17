export type KeywordCategory =
  | "storage"
  | "archive"
  | "cost"
  | "security"
  | "business"
  | "compute"
  | "database"
  | "network"
  | "devops"
  | "general";

export interface KeywordDefinition {
  id: string;
  label: string;
  icon: string;
  category: KeywordCategory;
  color: string;
  badge?: string;
  keywords: string[];
}

export interface KeywordPosition {
  x?: string | number;
  y?: string | number;
}

export interface KeywordCue {
  id?: string;
  keyword: string;
  startFrame?: number;
  atSeconds?: number;
  durationFrames?: number;
  position?: KeywordPosition;
  customLabel?: string;
  customIcon?: string;
  badge?: string;
  color?: string;
}

export type SceneType =
  | "title"
  | "speaker"
  | "architecture"
  | "custom";

export interface SceneConfig<TProps = Record<string, unknown>> {
  id: string;
  name?: string;
  type: SceneType;
  startFrame: number;
  durationInFrames: number;
  props?: TProps;
}

export type SplitScreenMode =
  | "bottom"
  | "top"
  | "left"
  | "right"
  | "pip"
  | "focus";

export interface SplitScreenConfig {
  startFrame: number;
  durationInFrames?: number;
  mode?: SplitScreenMode;
  targetScale?: number;
  translateY?: number;
  translateX?: number;
  damping?: number;
}

export interface SplitScreenInterval {
  startFrame: number;
  restoreFrame: number;
  mode?: SplitScreenMode;
}

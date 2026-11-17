import { timing } from "../theme/timing";
import type { SceneConfig } from "../types/timeline";

/**
 * Standard scene manifest for the default VideoOverlay composition.
 * Preserves the exact approved timeline landmarks:
 * - Frame 0-90: TitleCard
 * - Frame 100-220: LowerThird
 * - Frame 600-1050: Split-screen transition and Architecture Diagram
 */
export const defaultVideoOverlayScenes: SceneConfig[] = [
  {
    id: "title-scene",
    name: "TitleCard",
    type: "title",
    startFrame: 0,
    durationInFrames: timing.scenes.titleCardDuration,
    props: {
      title: "Behind The Cloud",
    },
  },
  {
    id: "speaker-scene",
    name: "LowerThird",
    type: "speaker",
    startFrame: timing.scenes.lowerThirdStart,
    durationInFrames: timing.scenes.lowerThirdDuration,
    props: {
      name: "Folarin Favour Olaoluwapo",
      title: "Cloud Engineer",
    },
  },
  {
    id: "architecture-scene",
    name: "CloudDiagram",
    type: "architecture",
    startFrame: timing.scenes.splitScreenStart,
    durationInFrames: timing.scenes.cloudDiagramDuration,
    props: {
      title: "AWS Core Architecture",
      leftNode: "IAM 🛡️",
      rightNode: "Amazon S3 🪣",
    },
  },
];

/**
 * Example speech-synced keyword cues matching the user's S3/Glacier/Cost scenario:
 * "S3 has different ways to reduce money based on business requirements, we use S3 Glacier..."
 */
export const demoKeywordCues = [
  {
    id: "cue-s3",
    keyword: "s3",
    startFrame: 360, // 12.0s
    durationFrames: 110,
    position: { x: "68%", y: "20%" },
  },
  {
    id: "cue-cost",
    keyword: "reduce money",
    startFrame: 410, // 13.6s
    durationFrames: 100,
    position: { x: "68%", y: "20%" },
  },
  {
    id: "cue-biz",
    keyword: "business requirement",
    startFrame: 460, // 15.3s
    durationFrames: 90,
    position: { x: "68%", y: "20%" },
  },
  {
    id: "cue-glacier",
    keyword: "s3 glacier",
    startFrame: 510, // 17.0s (holds until split-screen at frame 600)
    durationFrames: 85,
    position: { x: "68%", y: "20%" },
  },
];


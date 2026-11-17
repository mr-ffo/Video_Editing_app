import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BackgroundVideo } from "./components/video/BackgroundVideo";
import { SplitScreenContainer } from "./components/video/SplitScreenContainer";
import { KeywordOverlay } from "./components/callouts/KeywordOverlay";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { SpeakerScene } from "./scenes/SpeakerScene";
import { TitleScene } from "./scenes/TitleScene";
import { timing } from "./theme/timing";
import type { KeywordCue } from "./types/callout";

export interface VideoOverlayProps {
  keywordCues?: KeywordCue[];
}

/**
 * Master VideoOverlay composition coordinated via modular scene architecture.
 * Preserves 100% baseline visual fidelity, frame landmarks, and broadcast split-screen physics.
 * Supports speech-synced kinetic keyword callouts via keywordCues prop.
 */
export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  keywordCues,
}) => {
  return (
    <AbsoluteFill>
      {/* Background video layer wrapped in reusable broadcast split-screen container */}
      <SplitScreenContainer
        startFrame={timing.scenes.splitScreenStart}
        restoreFrame={
          timing.scenes.splitScreenStart + timing.scenes.cloudDiagramDuration
        }
        mode="bottom"
      >
        <BackgroundVideo
          src="test-video.mp4"
          durationInFrames={timing.scenes.totalDuration}
          objectFit="cover"
        />
      </SplitScreenContainer>

      {/* Scene 1: Title presentation at frame 0 */}
      <Sequence
        durationInFrames={timing.scenes.titleCardDuration}
        name="TitleCard"
      >
        <TitleScene title="Behind The Cloud" />
      </Sequence>

      {/* Scene 2: Speaker lower-third at frame 100 */}
      <Sequence
        from={timing.scenes.lowerThirdStart}
        durationInFrames={timing.scenes.lowerThirdDuration}
        name="LowerThird"
      >
        <SpeakerScene
          name="Folarin Favour Olaoluwapo"
          title="Cloud Engineer"
        />
      </Sequence>

      {/* Scene 3: Cloud architecture diagram at frame 600 */}
      <Sequence
        from={timing.scenes.splitScreenStart}
        durationInFrames={timing.scenes.cloudDiagramDuration}
        name="CloudDiagram"
      >
        <ArchitectureScene
          leftNode="IAM 🛡️"
          rightNode="Amazon S3 🪣"
          title="AWS Core Architecture"
        />
      </Sequence>

      {/* Scene 4: Dynamic kinetic spoken keyword callouts */}
      {keywordCues && keywordCues.length > 0 && (
        <KeywordOverlay cues={keywordCues} />
      )}
    </AbsoluteFill>
  );
};

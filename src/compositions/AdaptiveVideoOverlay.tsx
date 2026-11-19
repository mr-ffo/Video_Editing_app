import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { KeywordOverlay } from "../components/callouts/KeywordOverlay";
import { BackgroundVideo } from "../components/video/BackgroundVideo";
import { SmartVideo } from "../components/video/SmartVideo";
import { SplitScreenContainer } from "../components/video/SplitScreenContainer";
import { getTimelineForDuration, type VideoDurationMinutes } from "../data/timelinePresets";
import { ArchitectureScene } from "../scenes/ArchitectureScene";
import { MetricsScene } from "../scenes/MetricsScene";
import { SpeakerScene } from "../scenes/SpeakerScene";
import { TerminalScene } from "../scenes/TerminalScene";
import { TitleScene } from "../scenes/TitleScene";
import type { KeywordCue } from "../types/callout";

export interface AdaptiveVideoOverlayProps {
  durationMinutes?: VideoDurationMinutes;
  videoSrc?: string;
  customKeywordCues?: KeywordCue[];
  episodeTitle?: string;
  speakerName?: string;
  speakerTitle?: string;
  playbackRate?: number;
  trimSilenceAndFillers?: boolean;
}

/**
 * AdaptiveVideoOverlay coordinates broadcast motion graphics across 1 to 5 minute videos.
 * Intelligently spaces out TitleCard, SpeakerLowerThird, KeywordCallouts, SplitScreen Diagrams,
 * Live Terminal Demos, Telemetry Metrics, and Outro cards according to total runtime.
 */
export const AdaptiveVideoOverlay: React.FC<AdaptiveVideoOverlayProps> = ({
  durationMinutes = 1,
  videoSrc = "test-video.mp4",
  customKeywordCues,
  episodeTitle,
  speakerName,
  speakerTitle,
  playbackRate = 1.0,
  trimSilenceAndFillers = false,
}) => {
  const schedule = getTimelineForDuration(durationMinutes);
  const { scenes, splitScreenIntervals, keywordCues, totalDurationFrames } = schedule;

  return (
    <AbsoluteFill>
      {/* Background Video wrapped in Multi-Interval SplitScreenContainer */}
      <SplitScreenContainer intervals={splitScreenIntervals}>
        {trimSilenceAndFillers ? (
          <SmartVideo
            src={videoSrc}
            totalDurationInFrames={totalDurationFrames}
            playbackRate={playbackRate}
            punchInOnCuts={true}
          />
        ) : (
          <BackgroundVideo
            src={videoSrc}
            durationInFrames={totalDurationFrames}
            playbackRate={playbackRate}
            objectFit="cover"
          />
        )}
      </SplitScreenContainer>

      {/* Kinetic Spoken Keyword Callouts */}
      <KeywordOverlay cues={customKeywordCues ?? keywordCues} />

      {/* 1. Opening Title Scene */}
      {scenes.titleIntro && (
        <Sequence
          from={scenes.titleIntro.startFrame}
          durationInFrames={scenes.titleIntro.durationFrames}
          name="TitleCard"
        >
          <TitleScene title={episodeTitle || scenes.titleIntro.title} />
        </Sequence>
      )}

      {/* 2. Speaker Lower-Third */}
      {scenes.speakerLowerThird && (
        <Sequence
          from={scenes.speakerLowerThird.startFrame}
          durationInFrames={scenes.speakerLowerThird.durationFrames}
          name="SpeakerLowerThird"
        >
          <SpeakerScene
            name={speakerName || scenes.speakerLowerThird.name}
            title={speakerTitle || scenes.speakerLowerThird.title}
          />
        </Sequence>
      )}

      {/* 3. Primary Architecture Diagram */}
      {scenes.architecture1 && (
        <Sequence
          from={scenes.architecture1.startFrame}
          durationInFrames={scenes.architecture1.durationFrames}
          name="ArchitectureDiagram1"
        >
          <ArchitectureScene
            title={scenes.architecture1.title}
            leftNode={scenes.architecture1.leftNode}
            rightNode={scenes.architecture1.rightNode}
            config={scenes.architecture1.config}
          />
        </Sequence>
      )}

      {/* 4. Live Terminal / IaC Demo */}
      {scenes.terminalDemo && (
        <Sequence
          from={scenes.terminalDemo.startFrame}
          durationInFrames={scenes.terminalDemo.durationFrames}
          name="TerminalDemo"
        >
          <TerminalScene
            heading={scenes.terminalDemo.heading}
            title={scenes.terminalDemo.title}
          />
        </Sequence>
      )}

      {/* 5. Production Telemetry & Metrics */}
      {scenes.metricsDashboard && (
        <Sequence
          from={scenes.metricsDashboard.startFrame}
          durationInFrames={scenes.metricsDashboard.durationFrames}
          name="MetricsDashboard"
        >
          <MetricsScene
            title={scenes.metricsDashboard.title}
            subtitle={scenes.metricsDashboard.subtitle}
          />
        </Sequence>
      )}

      {/* 6. Secondary Architecture Deep-Dive */}
      {scenes.architecture2 && (
        <Sequence
          from={scenes.architecture2.startFrame}
          durationInFrames={scenes.architecture2.durationFrames}
          name="ArchitectureDiagram2"
        >
          <ArchitectureScene
            title={scenes.architecture2.title}
            config={scenes.architecture2.config}
          />
        </Sequence>
      )}

      {/* 7. Outro / Call-to-Action Card */}
      {scenes.outroCard && (
        <Sequence
          from={scenes.outroCard.startFrame}
          durationInFrames={scenes.outroCard.durationFrames}
          name="OutroCard"
        >
          <TitleScene title={episodeTitle ? `${episodeTitle} • Complete` : scenes.outroCard.title} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

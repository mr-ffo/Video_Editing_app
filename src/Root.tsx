import React from "react";
import { Composition } from "remotion";
import { CloudDiagram } from "./CloudDiagram";
import { TechnicalExplainer } from "./compositions/TechnicalExplainer";
import { AdaptiveVideoOverlay } from "./compositions/AdaptiveVideoOverlay";
import { LowerThird } from "./LowerThird";
import { MetricsScene } from "./scenes/MetricsScene";
import { TerminalScene } from "./scenes/TerminalScene";
import { TitleCard } from "./TitleCard";
import { KeywordOverlay } from "./components/callouts/KeywordOverlay";
import { demoKeywordCues } from "./data/scenePresets";
import { timing } from "./theme/timing";

import { DynamicSceneComposition } from "./compositions/DynamicSceneComposition";
import { TEMPLATE_PROJECTS } from "./data/sceneTemplates";
import { calculateTotalScenesDuration } from "./types/scene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 0. Dynamic Multi-Scene Project Composition */}
      <Composition
        id="DynamicProject"
        component={DynamicSceneComposition}
        calculateMetadata={({ props }) => {
          const typedProps = props as { aspectRatio?: string; scenes?: typeof TEMPLATE_PROJECTS[0]["scenes"] };
          const width =
            typedProps.aspectRatio === "9:16" ? 1080 : typedProps.aspectRatio === "1:1" ? 1080 : 1920;
          const height =
            typedProps.aspectRatio === "9:16" ? 1920 : typedProps.aspectRatio === "1:1" ? 1080 : 1080;
          const totalFrames = calculateTotalScenesDuration(typedProps.scenes || []);
          return {
            durationInFrames: Math.max(30, totalFrames),
            width,
            height,
            fps: 30,
          };
        }}
        durationInFrames={1260}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          scenes: TEMPLATE_PROJECTS[0].scenes,
          aspectRatio: "16:9" as const,
        }}
      />
      {/* 1. Master Video Overlay Composition (Canonical AdaptiveVideoOverlay engine) */}
      <Composition
        id="VideoOverlay"
        component={AdaptiveVideoOverlay}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          durationMinutes: 1,
          videoSrc: "test-video.mp4",
          episodeTitle: "Behind The Cloud",
          speakerName: "Folarin Favour Olaoluwapo",
          speakerTitle: "Cloud Solutions Architect",
          playbackRate: 1.0,
          trimSilenceAndFillers: false,
        }}
      />

      {/* 2. Standalone Technical Explainer Template (Data-driven educational video) */}
      <Composition
        id="TechnicalExplainer"
        component={TechnicalExplainer}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          episodeTitle: "Serverless Architecture Deep Dive",
          speakerName: "Folarin Favour Olaoluwapo",
          speakerTitle: "Cloud Solutions Architect",
        }}
      />

      {/* 3. Cloud Architecture Diagram (Preserves original baseline & props) */}
      <Composition
        id="CloudDiagram"
        component={CloudDiagram}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          leftNode: "IAM 🛡️",
          rightNode: "Amazon S3 🪣",
          title: "AWS Core Architecture",
        }}
      />

      {/* 4. Speaker Lower Third (Preserves original baseline & props) */}
      <Composition
        id="LowerThird"
        component={LowerThird}
        durationInFrames={timing.scenes.lowerThirdDuration}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          name: "Folarin Favour Olaoluwapo",
          title: "Cloud Engineer",
        }}
      />

      {/* 5. Title Card (Preserves original baseline & props) */}
      <Composition
        id="TitleCard"
        component={TitleCard}
        durationInFrames={timing.scenes.titleCardDuration}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Behind The Cloud",
        }}
      />

      {/* 6. Terminal Demo Showcase */}
      <Composition
        id="TerminalDemo"
        component={TerminalScene}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          heading: "Cloud Infrastructure Deployment",
          title: "bash ~ aws-cdk",
          prompt: "$",
        }}
      />

      {/* 7. Telemetry & Metrics Dashboard Showcase */}
      <Composition
        id="MetricsDashboard"
        component={MetricsScene}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Cloud Workload Telemetry",
          subtitle: "Real-time performance and availability telemetry",
        }}
      />

      {/* 8. Kinetic Keyword Callouts Showcase */}
      <Composition
        id="KeywordCallouts"
        component={KeywordOverlay}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          cues: demoKeywordCues.map((c) => ({
            ...c,
            startFrame: c.startFrame - 330,
          })),
        }}
      />

      {/* 9. Adaptive 2-Minute Broadcast Video Overlay */}
      <Composition
        id="VideoOverlay-2min"
        component={AdaptiveVideoOverlay}
        durationInFrames={3600}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ durationMinutes: 2 }}
      />

      {/* 10. Adaptive 3-Minute Broadcast Video Overlay */}
      <Composition
        id="VideoOverlay-3min"
        component={AdaptiveVideoOverlay}
        durationInFrames={5400}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ durationMinutes: 3 }}
      />

      {/* 11. Adaptive 4-Minute Broadcast Video Overlay */}
      <Composition
        id="VideoOverlay-4min"
        component={AdaptiveVideoOverlay}
        durationInFrames={7200}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ durationMinutes: 4 }}
      />

      {/* 12. Adaptive 5-Minute Broadcast Video Overlay */}
      <Composition
        id="VideoOverlay-5min"
        component={AdaptiveVideoOverlay}
        durationInFrames={9000}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ durationMinutes: 5 }}
      />
    </>
  );
};

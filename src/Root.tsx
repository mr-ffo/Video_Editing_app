import React from "react";
import { Composition } from "remotion";
import { CloudDiagram } from "./CloudDiagram";
import { TechnicalExplainer } from "./compositions/TechnicalExplainer";
import { AdaptiveVideoOverlay } from "./compositions/AdaptiveVideoOverlay";
import { LowerThird } from "./LowerThird";
import { MetricsScene } from "./scenes/MetricsScene";
import { TerminalScene } from "./scenes/TerminalScene";
import { TitleCard } from "./TitleCard";
import { VideoOverlay } from "./VideoOverlay";
import { KeywordOverlay } from "./components/callouts/KeywordOverlay";
import { demoKeywordCues } from "./data/scenePresets";
import { timing } from "./theme/timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Master Video Overlay Composition (Preserves original baseline) */}
      <Composition
        id="VideoOverlay"
        component={VideoOverlay}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 2. Standalone Technical Explainer Template (Data-driven educational video) */}
      <Composition
        id="TechnicalExplainer"
        component={TechnicalExplainer}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
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

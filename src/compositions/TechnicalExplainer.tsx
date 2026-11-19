import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CinematicTransition } from "../components/transitions/CinematicTransition";
import { SectionProgress } from "../components/progress/SectionProgress";
import { ArchitectureScene } from "../scenes/ArchitectureScene";
import { MetricsScene } from "../scenes/MetricsScene";
import { SpeakerScene } from "../scenes/SpeakerScene";
import { TerminalScene } from "../scenes/TerminalScene";
import { TitleScene } from "../scenes/TitleScene";
import { colors } from "../theme/colors";
import type { DiagramConfig } from "../types/diagram";

const serverlessArchitectureConfig: DiagramConfig = {
  title: "Event-Driven Microservices Architecture",
  nodes: [
    {
      id: "api-gw",
      label: "API Gateway",
      subtitle: "REST Endpoint",
      icon: "🌐",
      provider: "aws",
      status: "healthy",
      delayFrames: 15,
    },
    {
      id: "lambda",
      label: "Order Handler",
      subtitle: "Node.js 22 Lambda",
      icon: "⚡",
      provider: "aws",
      status: "active",
      delayFrames: 45,
    },
    {
      id: "dynamo",
      label: "Orders Table",
      subtitle: "Amazon DynamoDB",
      icon: "🗄️",
      provider: "aws",
      status: "healthy",
      delayFrames: 75,
    },
  ],
  connections: [
    {
      id: "c1",
      sourceId: "api-gw",
      targetId: "lambda",
      label: "HTTP POST",
      startDelayFrames: 30,
      drawDurationFrames: 20,
    },
    {
      id: "c2",
      sourceId: "lambda",
      targetId: "dynamo",
      label: "PutItem Document",
      startDelayFrames: 60,
      drawDurationFrames: 20,
    },
  ],
};

export interface TechnicalExplainerProps {
  episodeTitle?: string;
  speakerName?: string;
  speakerTitle?: string;
}

/**
 * TechnicalExplainer: Reusable educational motion graphics composition
 * for software engineering tutorials without requiring external background video.
 */
export const TechnicalExplainer: React.FC<TechnicalExplainerProps> = ({
  episodeTitle = "Serverless Architecture Deep Dive",
  speakerName = "Folarin Favour Olaoluwapo",
  speakerTitle = "Cloud Solutions Architect",
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.surfaces.background,
        backgroundImage: `radial-gradient(circle at 50% 30%, rgba(37, 99, 235, 0.15) 0%, ${colors.surfaces.background} 75%)`,
      }}
    >
      {/* Chapter 1: Introduction Title [0 - 105] (15-frame cross-dissolve overlap) */}
      <Sequence durationInFrames={105} name="IntroTitle">
        <CinematicTransition type="fade" durationInFrames={15} exitDurationFrames={15}>
          <SectionProgress
            currentSection={1}
            totalSections={4}
            sectionTitle="Introduction"
            durationInFrames={105}
          />
          <TitleScene title={episodeTitle} />
        </CinematicTransition>
      </Sequence>

      {/* Chapter 2: Speaker Intro [90 - 225] (15-frame cross-dissolve overlap) */}
      <Sequence from={90} durationInFrames={135} name="SpeakerIntro">
        <CinematicTransition type="fade" durationInFrames={15} exitDurationFrames={15}>
          <SectionProgress
            currentSection={1}
            totalSections={4}
            sectionTitle="Instructor Profile"
            durationInFrames={135}
          />
          <SpeakerScene
            name={speakerName}
            title={speakerTitle}
          />
        </CinematicTransition>
      </Sequence>

      {/* Chapter 3: Architecture Walkthrough [210 - 585] (15-frame cross-dissolve overlap) */}
      <Sequence from={210} durationInFrames={375} name="ArchitectureWalkthrough">
        <CinematicTransition type="fade" durationInFrames={15} exitDurationFrames={15}>
          <SectionProgress
            currentSection={2}
            totalSections={4}
            sectionTitle="Event-Driven Microservices"
            durationInFrames={375}
          />
          <ArchitectureScene config={serverlessArchitectureConfig} />
        </CinematicTransition>
      </Sequence>

      {/* Chapter 4: Live Terminal Deployment [570 - 885] (15-frame cross-dissolve overlap) */}
      <Sequence from={570} durationInFrames={315} name="TerminalDemo">
        <CinematicTransition type="fade" durationInFrames={15} exitDurationFrames={15}>
          <SectionProgress
            currentSection={3}
            totalSections={4}
            sectionTitle="Infrastructure as Code Deployment"
            durationInFrames={315}
          />
          <TerminalScene
            heading="Deploying AWS CDK Stack"
            title="cdk deploy --require-approval never"
            commands={[
              {
                command: "cdk deploy ServerlessOrdersStack",
                output: [
                  "✨  Synthesizing CloudFormation template...",
                  "🚀  ServerlessOrdersStack: deploying...",
                  "✅  ServerlessOrdersStack: deployed in 8.4s",
                  "Outputs: ApiEndpoint = https://api.syntax-ops.cloud/orders",
                ],
                typingDelayFrames: 15,
                typingSpeed: 2,
                outputDelayFrames: 12,
              },
            ]}
          />
        </CinematicTransition>
      </Sequence>

      {/* Chapter 5: Telemetry & Production Metrics [870 - 1155] (15-frame cross-dissolve overlap) */}
      <Sequence from={870} durationInFrames={285} name="TelemetryDashboard">
        <CinematicTransition type="fade" durationInFrames={15} exitDurationFrames={15}>
          <SectionProgress
            currentSection={4}
            totalSections={4}
            sectionTitle="Telemetry & SLA Validation"
            durationInFrames={285}
          />
          <MetricsScene
            title="Production Workload Telemetry"
            subtitle="Real-time latency and throughput verification"
          />
        </CinematicTransition>
      </Sequence>

      {/* Conclusion [1140 - 1200] (fades in cleanly over Chapter 5 exit) */}
      <Sequence from={1140} durationInFrames={60} name="Conclusion">
        <CinematicTransition type="fade" durationInFrames={15} exitDurationFrames={15}>
          <TitleScene title="Behind The Cloud • Next Episode" />
        </CinematicTransition>
      </Sequence>
    </AbsoluteFill>
  );
};

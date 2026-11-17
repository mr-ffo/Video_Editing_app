import test from "node:test";
import assert from "node:assert";
import React from "react";
import path from "node:path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ReactDOMServer = require("react-dom/server");

// Internal Remotion contexts for testing components in Node
const remotionDir = path.join(process.cwd(), "node_modules/remotion/dist/cjs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CanUseRemotionHooks } = require(path.join(remotionDir, "CanUseRemotionHooks.js"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { VideoContext } = require(path.join(remotionDir, "use-video.js"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TimelineContext } = require(path.join(remotionDir, "TimelineContext.js"));

import { TitleCard } from "../src/TitleCard";
import { LowerThird } from "../src/LowerThird";
import { CloudDiagram } from "../src/CloudDiagram";
import { ArchitectureDiagram } from "../src/components/diagrams/ArchitectureDiagram";
import { TerminalWindow } from "../src/components/terminal/TerminalWindow";
import { SplitScreenContainer } from "../src/components/video/SplitScreenContainer";
import { Spotlight } from "../src/components/effects/Spotlight";
import { StatusBadge } from "../src/components/status/StatusBadge";
import { SectionProgress } from "../src/components/progress/SectionProgress";
import { MetricCard } from "../src/components/metrics/MetricCard";
import { CinematicTransition } from "../src/components/transitions/CinematicTransition";
import { TechnicalExplainer } from "../src/compositions/TechnicalExplainer";
import { TerminalScene } from "../src/scenes/TerminalScene";
import { MetricsScene } from "../src/scenes/MetricsScene";

const renderRemotionComponent = (
  component: React.ReactElement,
  compId: string = "testComp",
  frame: number = 0,
  durationInFrames: number = 450
): string => {
  const tree = React.createElement(
    CanUseRemotionHooks.Provider,
    { value: true },
    React.createElement(
      VideoContext.Provider,
      {
        value: {
          id: compId,
          width: 1920,
          height: 1080,
          fps: 30,
          durationInFrames,
        },
      },
      React.createElement(
        TimelineContext.Provider,
        { value: { frame: { [compId]: frame }, isInsideFreeze: false } },
        component
      )
    )
  );
  return ReactDOMServer.renderToStaticMarkup(tree);
};

test("Integration: TitleCard renders heading and accent bar in HTML markup", () => {
  const html = renderRemotionComponent(<TitleCard title="Behind The Cloud" />, "TitleCard", 15, 90);
  assert.ok(html.includes("Behind The Cloud"), "Title text missing from TitleCard HTML");
  assert.ok(html.includes("rgb(26, 26, 46)") || html.includes("#1a1a2e"), "Background missing");
});

test("Integration: LowerThird renders speaker name, role, and gold indicator", () => {
  const html = renderRemotionComponent(
    <LowerThird name="Folarin Favour Olaoluwapo" title="Cloud Engineer" />,
    "LowerThird",
    25,
    120
  );
  assert.ok(html.includes("Folarin Favour Olaoluwapo"), "Speaker name missing");
  assert.ok(html.includes("Cloud Engineer"), "Speaker role missing");
});

test("Integration: CloudDiagram renders IAM node, connector SVG, and S3 node", () => {
  const html = renderRemotionComponent(
    <CloudDiagram leftNode="IAM 🛡️" rightNode="Amazon S3 🪣" title="AWS Core Architecture" />,
    "CloudDiagram",
    55,
    450
  );
  assert.ok(html.includes("IAM 🛡️"), "IAM node label missing");
  assert.ok(html.includes("Amazon S3 🪣"), "S3 node label missing");
  assert.ok(html.includes("AWS Core Architecture"), "Title missing");
  assert.ok(html.includes("<svg"), "SVG connector line missing");
  assert.ok(html.includes("Permits Access"), "Connector label missing");
});

test("Integration: ArchitectureDiagram renders vertical and custom positioned layouts", () => {
  const verticalHtml = renderRemotionComponent(
    <ArchitectureDiagram
      title="Vertical Pipeline"
      layout={{ orientation: "vertical" }}
      nodes={[
        { id: "n1", label: "Step 1" },
        { id: "n2", label: "Step 2" },
      ]}
      connections={[{ id: "c1", sourceId: "n1", targetId: "n2", label: "Next" }]}
    />,
    "ArchVertical",
    30,
    300
  );
  assert.ok(verticalHtml.includes("Vertical Pipeline"));
  assert.ok(verticalHtml.includes("flex-direction:column"));

  const customHtml = renderRemotionComponent(
    <ArchitectureDiagram
      title="Custom Canvas"
      layout={{ orientation: "custom" }}
      nodes={[
        { id: "node-x", label: "Origin", position: { x: 50, y: 100 } },
        { id: "node-y", label: "Target", position: { x: 400, y: 100 } },
      ]}
      connections={[{ id: "c-xy", sourceId: "node-x", targetId: "node-y" }]}
    />,
    "ArchCustom",
    30,
    300
  );
  assert.ok(customHtml.includes("Custom Canvas"));
  assert.ok(customHtml.includes("position:relative"));
});

test("Integration: All six SplitScreenContainer modes render valid CSS transforms", () => {
  const modes = ["bottom", "top", "left", "right", "pip", "focus"] as const;

  for (const mode of modes) {
    const html = renderRemotionComponent(
      <SplitScreenContainer mode={mode} startFrame={0}>
        <div id="video-mock" />
      </SplitScreenContainer>,
      `split-${mode}`,
      40,
      300
    );
    assert.ok(html.includes("transform:scale("), `Transform scale missing for mode ${mode}`);
    assert.ok(html.includes("video-mock"), `Children missing in mode ${mode}`);
  }
});

test("Integration: TerminalWindow renders progressive typing and CLI prompt", () => {
  const html = renderRemotionComponent(
    <TerminalWindow
      title="cloud-shell"
      prompt="$"
      commands={[
        {
          command: "aws s3 ls",
          output: ["bucket-alpha", "bucket-beta"],
          typingDelayFrames: 10,
          typingSpeed: 2,
        },
      ]}
    />,
    "Terminal",
    40,
    300
  );
  assert.ok(html.includes("cloud-shell"), "Terminal title missing");
  assert.ok(html.includes("$"), "Terminal prompt missing");
});

test("Integration: Spotlight renders radial gradient mask", () => {
  const html = renderRemotionComponent(
    <Spotlight x="50%" y="35%" radius={200} startFrame={0} durationInFrames={100} />,
    "Spotlight",
    20,
    100
  );
  assert.ok(html.includes("radial-gradient"), "Radial gradient missing from spotlight");
});

test("Integration: StatusBadge renders operational and error status indicators", () => {
  const healthyHtml = renderRemotionComponent(<StatusBadge status="healthy" />, "BadgeHealthy", 10, 100);
  assert.ok(healthyHtml.includes("Healthy"));

  const errorHtml = renderRemotionComponent(<StatusBadge status="error" />, "BadgeError", 10, 100);
  assert.ok(errorHtml.includes("Critical"));
});

test("Integration: SectionProgress renders chapter indicator and progress bar", () => {
  const html = renderRemotionComponent(
    <SectionProgress currentSection={2} totalSections={5} sectionTitle="Database Configuration" />,
    "SectionProgress",
    50,
    200
  );
  assert.ok(html.includes("Part 02 / 05"));
  assert.ok(html.includes("Database Configuration"));
});

test("Integration: MetricCard renders KPI value, trend, and suffix", () => {
  const html = renderRemotionComponent(
    <MetricCard label="Latency" to={14} suffix=" ms" trend="down" trendLabel="-6ms" />,
    "MetricCard",
    30,
    100
  );
  assert.ok(html.includes("Latency"));
  assert.ok(html.includes("ms"));
  assert.ok(html.includes("-6ms"));
});

test("Integration: CinematicTransition renders wipe and slide elements", () => {
  const wipeHtml = renderRemotionComponent(
    <CinematicTransition type="wipe" durationInFrames={20}>
      <div id="content" />
    </CinematicTransition>,
    "Wipe",
    10,
    100
  );
  assert.ok(wipeHtml.includes("clip-path:polygon"));

  const slideHtml = renderRemotionComponent(
    <CinematicTransition type="slide" direction="left" durationInFrames={20}>
      <div id="slide-content" />
    </CinematicTransition>,
    "Slide",
    10,
    100
  );
  assert.ok(slideHtml.includes("transform:translate("));
});

test("Integration: TerminalScene and MetricsScene render complex composite scenes", () => {
  const termHtml = renderRemotionComponent(<TerminalScene />, "TerminalScene", 30, 300);
  assert.ok(termHtml.includes("Infrastructure CLI"));

  const metricsHtml = renderRemotionComponent(<MetricsScene />, "MetricsScene", 30, 300);
  assert.ok(metricsHtml.includes("System Telemetry"));
  assert.ok(metricsHtml.includes("System Availability"));
});

test("Integration: Standalone TechnicalExplainer composition mounts successfully across multiple timeline chapters", () => {
  // Test chapter 1 (Intro): frame 45
  const ch1 = renderRemotionComponent(<TechnicalExplainer />, "TechnicalExplainer", 45, 1200);
  assert.ok(ch1.length > 500, "Chapter 1 render too small");

  // Test chapter 2 (Speaker): frame 150
  const ch2 = renderRemotionComponent(<TechnicalExplainer />, "TechnicalExplainer", 150, 1200);
  assert.ok(ch2.length > 500, "Chapter 2 render too small");

  // Test chapter 3 (Architecture): frame 350
  const ch3 = renderRemotionComponent(<TechnicalExplainer />, "TechnicalExplainer", 350, 1200);
  assert.ok(ch3.includes("Event-Driven Microservices Architecture"), "Architecture title missing from ch3");
  assert.ok(ch3.includes("API Gateway"), "API Gateway node missing from ch3");

  // Test chapter 4 (Terminal): frame 650
  const ch4 = renderRemotionComponent(<TechnicalExplainer />, "TechnicalExplainer", 650, 1200);
  assert.ok(ch4.includes("Deploying AWS CDK Stack"), "Terminal title missing from ch4");

  // Test chapter 5 (Telemetry): frame 950
  const ch5 = renderRemotionComponent(<TechnicalExplainer />, "TechnicalExplainer", 950, 1200);
  assert.ok(ch5.includes("Production Workload Telemetry"), "Telemetry title missing from ch5");
});

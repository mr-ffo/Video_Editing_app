/* eslint-disable @remotion/non-pure-animation */
import type { DiagramNode, DiagramConnection, DiagramContainer } from "./diagram";
import type { TerminalCommand } from "../components/terminal/TerminalWindow";
import type { MetricItem } from "../scenes/MetricsScene";
import type { ElementTransform, ElementTypography, ElementAnimationConfig } from "./element";

export type AspectRatio = "16:9" | "9:16" | "1:1";

export interface AspectRatioConfig {
  width: number;
  height: number;
  label: string;
  icon: string;
}

export const ASPECT_RATIOS: Record<AspectRatio, AspectRatioConfig> = {
  "16:9": { width: 1920, height: 1080, label: "16:9 Landscape (YouTube / Desktop)", icon: "🖥️" },
  "9:16": { width: 1080, height: 1920, label: "9:16 Portrait (TikTok / Shorts / Reels)", icon: "📱" },
  "1:1": { width: 1080, height: 1080, label: "1:1 Square (LinkedIn / Instagram)", icon: "⏹️" },
};

export type SceneTransitionType = "cut" | "crossfade" | "fade-black" | "slide" | "zoom" | "wipe" | "flip";

export interface SceneTransition {
  type: SceneTransitionType;
  durationInFrames: number;
  durationFrames?: number;
  direction?: "left" | "right" | "top" | "bottom";
}

export type SceneType =
  | "intro"
  | "presenter"
  | "architecture"
  | "terminal"
  | "code"
  | "metrics"
  | "callout"
  | "outro";

export interface BaseSceneItem {
  id: string;
  type: SceneType;
  title: string;
  durationInFrames: number;
  transition?: SceneTransition;
  hidden?: boolean;
  transform?: ElementTransform;
  typography?: ElementTypography;
  animation?: ElementAnimationConfig;
}

export interface IntroSceneItem extends BaseSceneItem {
  type: "intro";
  subtitle?: string;
  badge?: string;
  accentColor?: string;
}

export interface PresenterSceneItem extends BaseSceneItem {
  type: "presenter";
  videoUrl?: string;
  speakerName: string;
  speakerTitle: string;
  layoutMode: "full" | "pip-bottom-right" | "pip-top-right" | "split-left" | "split-right";
}

export interface ArchitectureSceneItem extends BaseSceneItem {
  type: "architecture";
  layout?: "horizontal" | "vertical" | "custom";
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  containers?: DiagramContainer[];
}

export interface TerminalSceneItem extends BaseSceneItem {
  type: "terminal";
  heading?: string;
  prompt: string;
  commands: TerminalCommand[];
  theme: "dark" | "glass" | "matrix";
}

export interface CodeSceneItem extends BaseSceneItem {
  type: "code";
  language: "typescript" | "python" | "yaml" | "json" | "bash" | "dockerfile";
  code: string;
  activeLine?: number;
  highlightedLines?: number[];
  fontSize?: number;
  theme?: "dark" | "cyber" | "clean";
}

export interface MetricsSceneItem extends BaseSceneItem {
  type: "metrics";
  subtitle?: string;
  metrics: MetricItem[];
}

export interface CalloutSceneItem extends BaseSceneItem {
  type: "callout";
  keyword: string;
  badge?: string;
  explanation: string;
  color?: string;
}

export interface OutroSceneItem extends BaseSceneItem {
  type: "outro";
  subtitle?: string;
  ctaText?: string;
  speakerName?: string;
  speakerHandle?: string;
}

export type SceneItem =
  | IntroSceneItem
  | PresenterSceneItem
  | ArchitectureSceneItem
  | TerminalSceneItem
  | CodeSceneItem
  | MetricsSceneItem
  | CalloutSceneItem
  | OutroSceneItem;

/**
 * Calculates total composition duration from active (non-hidden) scenes.
 */
export function calculateTotalScenesDuration(scenes: SceneItem[] = []): number {
  const active = scenes.filter((s) => !s.hidden);
  if (active.length === 0) return 90; // Fallback minimum 3 seconds
  return active.reduce((sum, s) => sum + (s.durationInFrames || 90), 0);
}

/**
 * Creates a default scene of the specified type with rich defaults.
 */
export function createDefaultScene<T extends SceneType>(
  type: T,
  idSuffix: string = "default"
): Extract<SceneItem, { type: T }> {
  const id = `scene-${type}-${idSuffix}`;
  let item: SceneItem;
  switch (type) {
    case "intro":
      item = {
        id,
        type: "intro",
        title: "Building Resilient Cloud Systems",
        subtitle: "Production Architecture & Infrastructure as Code",
        badge: "AWS & DEVOPS MASTERCLASS",
        accentColor: "#3b82f6",
        durationInFrames: 120, // 4 seconds
        transition: { type: "crossfade", durationInFrames: 15 },
      };
      break;
    case "presenter":
      item = {
        id,
        type: "presenter",
        title: "Presenter Overview",
        speakerName: "Folarin Favour Olaoluwapo",
        speakerTitle: "Cloud Solutions Architect",
        layoutMode: "pip-bottom-right",
        durationInFrames: 180, // 6 seconds
        transition: { type: "slide", direction: "left", durationInFrames: 15 },
      };
      break;
    case "architecture":
      item = {
        id,
        type: "architecture",
        title: "Serverless Event Architecture",
        layout: "horizontal",
        durationInFrames: 210, // 7 seconds
        transition: { type: "crossfade", durationInFrames: 15 },
        nodes: [
          {
            id: "api-gw",
            label: "API Gateway 🚪",
            subtitle: "REST API Endpoint",
            variant: "primary",
            status: "healthy",
            delayFrames: 10,
          },
          {
            id: "lambda-fn",
            label: "AWS Lambda ⚡",
            subtitle: "Event Compute",
            variant: "accent",
            status: "active",
            delayFrames: 40,
          },
          {
            id: "dynamo-db",
            label: "DynamoDB 🗄️",
            subtitle: "NoSQL Database",
            variant: "highlight",
            status: "healthy",
            delayFrames: 70,
          },
        ],
        containers: [
          {
            id: "vpc-main",
            label: "AWS Cloud (af-south-1)",
            type: "vpc",
            x: 60,
            y: 80,
            width: 720,
            height: 420,
            borderColor: "#3b82f6",
          },
        ],
        connections: [
          {
            id: "c1",
            sourceId: "api-gw",
            targetId: "lambda-fn",
            label: "Triggers handler",
            showArrow: true,
            animatedDataFlow: true,
            startDelayFrames: 30,
            drawDurationFrames: 20,
            lineStyle: "curved",
          },
          {
            id: "c2",
            sourceId: "lambda-fn",
            targetId: "dynamo-db",
            label: "PutItem record",
            showArrow: true,
            animatedDataFlow: true,
            startDelayFrames: 60,
            drawDurationFrames: 20,
            lineStyle: "curved",
          },
        ],
      };
      break;
    case "terminal":
      item = {
        id,
        type: "terminal",
        title: "Cloud Infrastructure Deployment",
        heading: "Deploying CDK Stack to AWS",
        prompt: "$",
        theme: "dark",
        durationInFrames: 240, // 8 seconds
        transition: { type: "crossfade", durationInFrames: 15 },
        commands: [
          {
            command: "cdk deploy --require-approval never",
            output: [
              "✨  Synthesizing CloudFormation template...",
              "🚀  Deploying SyntaxOps-ProdStack to af-south-1",
              "✅  SyntaxOps-ProdStack: deployment complete in 18.4s",
              "Outputs: https://api.syntaxops.dev/v1/health",
            ],
            typingDelayFrames: 15,
            typingSpeed: 2,
            outputDelayFrames: 10,
          },
        ],
      };
      break;
    case "code":
      item = {
        id,
        type: "code",
        title: "handler.ts",
        language: "typescript",
        durationInFrames: 210, // 7 seconds
        activeLine: 4,
        highlightedLines: [3, 4, 5],
        fontSize: 16,
        theme: "dark",
        transition: { type: "crossfade", durationInFrames: 15 },
        code: `import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

export const handler: APIGatewayProxyHandler = async (event) => {
  const payload = JSON.parse(event.body || '{}');
  // High-performance serverless event processing
  console.log('Received event from API Gateway:', payload.id);
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};`,
      };
      break;
    case "metrics":
      item = {
        id,
        type: "metrics",
        title: "Workload Performance Telemetry",
        subtitle: "Production AWS Environment Metrics",
        durationInFrames: 180, // 6 seconds
        transition: { type: "crossfade", durationInFrames: 15 },
        metrics: [
          {
            label: "API Availability",
            to: 99.99,
            suffix: "%",
            decimals: 2,
            trend: "up",
            trendLabel: "SLA OK",
            variant: "success",
            icon: "⚡",
          },
          {
            label: "Throughput",
            to: 45000,
            suffix: " req/s",
            trend: "up",
            trendLabel: "+24%",
            variant: "primary",
            icon: "📊",
          },
          {
            label: "P99 Latency",
            to: 12,
            suffix: " ms",
            trend: "down",
            trendLabel: "-4ms",
            variant: "accent",
            icon: "⏱️",
          },
        ],
      };
      break;
    case "callout":
      item = {
        id,
        type: "callout",
        title: "Key Takeaway",
        keyword: "Idempotency",
        badge: "BEST PRACTICE",
        explanation: "Always make Lambda handlers idempotent with deduplication tokens to handle retries safely.",
        color: "#10b981",
        durationInFrames: 150, // 5 seconds
        transition: { type: "zoom", durationInFrames: 15 },
      };
      break;
    case "outro":
      item = {
        id,
        type: "outro",
        title: "Subscribe for More Cloud & DevOps",
        subtitle: "Weekly AWS Architectures, Docker, and Kubernetes Tutorials",
        ctaText: "Check GitHub Repository • SyntaxOps",
        speakerName: "Folarin Favour Olaoluwapo",
        speakerHandle: "@syntaxops",
        durationInFrames: 150, // 5 seconds
        transition: { type: "fade-black", durationInFrames: 20 },
      };
      break;
  }
  return item as Extract<SceneItem, { type: T }>;
}

export * from "./element";

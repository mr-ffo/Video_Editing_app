import type { KeywordCue } from "../types/callout";
import type { DiagramConfig } from "../types/diagram";
import type { SplitScreenInterval } from "../types/timeline";
import { demoKeywordCues } from "./scenePresets";

export type VideoDurationMinutes = 1 | 2 | 3 | 4 | 5;

export interface ScenePlacement<TProps = Record<string, unknown>> {
  startFrame: number;
  durationFrames: number;
  props?: TProps;
}

export interface TimelineSchedule {
  durationMinutes: VideoDurationMinutes;
  totalDurationFrames: number;
  splitScreenIntervals: SplitScreenInterval[];
  keywordCues: KeywordCue[];
  scenes: {
    titleIntro?: { startFrame: number; durationFrames: number; title: string };
    speakerLowerThird?: { startFrame: number; durationFrames: number; name: string; title: string };
    architecture1?: { startFrame: number; durationFrames: number; title: string; leftNode?: string; rightNode?: string; config?: DiagramConfig };
    terminalDemo?: { startFrame: number; durationFrames: number; heading?: string; title?: string };
    metricsDashboard?: { startFrame: number; durationFrames: number; title?: string; subtitle?: string };
    architecture2?: { startFrame: number; durationFrames: number; title: string; config?: DiagramConfig };
    outroCard?: { startFrame: number; durationFrames: number; title: string };
  };
}

/**
 * Returns a typed broadcast motion graphics schedule tailored to video runtime.
 * Guarantees 100% baseline fidelity for 1-minute videos, and dynamically paces
 * multi-scene graphics across 2, 3, 4, and 5-minute technical tutorials.
 */
export const getTimelineForDuration = (
  minutes: VideoDurationMinutes = 1
): TimelineSchedule => {
  switch (minutes) {
    case 1:
      return {
        durationMinutes: 1,
        totalDurationFrames: 1800,
        splitScreenIntervals: [
          { startFrame: 600, restoreFrame: 1050, mode: "bottom" },
        ],
        keywordCues: demoKeywordCues,
        scenes: {
          titleIntro: { startFrame: 0, durationFrames: 110, title: "Behind The Cloud" },
          speakerLowerThird: { startFrame: 100, durationFrames: 210, name: "Folarin Favour Olaoluwapo", title: "Cloud Engineer" },
          architecture1: { startFrame: 600, durationFrames: 450, title: "AWS Core Architecture", leftNode: "IAM 🛡️", rightNode: "Amazon S3 🪣" },
        },
      };

    case 2:
      return {
        durationMinutes: 2,
        totalDurationFrames: 3600,
        splitScreenIntervals: [
          { startFrame: 900, restoreFrame: 1500, mode: "bottom" },
          { startFrame: 2250, restoreFrame: 3150, mode: "bottom" },
        ],
        keywordCues: demoKeywordCues,
        scenes: {
          titleIntro: { startFrame: 0, durationFrames: 110, title: "Behind The Cloud • AWS Deep Dive" },
          speakerLowerThird: { startFrame: 120, durationFrames: 210, name: "Folarin Favour Olaoluwapo", title: "Cloud Engineer" },
          architecture1: { startFrame: 900, durationFrames: 600, title: "AWS Storage & Identity", leftNode: "IAM 🛡️", rightNode: "Amazon S3 🪣" },
          terminalDemo: { startFrame: 2250, durationFrames: 900, heading: "Infrastructure as Code", title: "cdk deploy ServerlessStack" },
          outroCard: { startFrame: 3450, durationFrames: 150, title: "Behind The Cloud • Next Episode" },
        },
      };

    case 3:
      return {
        durationMinutes: 3,
        totalDurationFrames: 5400,
        splitScreenIntervals: [
          { startFrame: 1200, restoreFrame: 1950, mode: "bottom" },
          { startFrame: 2700, restoreFrame: 3750, mode: "bottom" },
          { startFrame: 4200, restoreFrame: 4950, mode: "bottom" },
        ],
        keywordCues: [
          ...demoKeywordCues,
          { id: "c-lambda", keyword: "lambda", startFrame: 2100, durationFrames: 90, position: { x: "68%", y: "20%" } },
          { id: "c-dynamo", keyword: "dynamodb", startFrame: 2200, durationFrames: 90, position: { x: "68%", y: "20%" } },
        ],
        scenes: {
          titleIntro: { startFrame: 0, durationFrames: 110, title: "Serverless Architecture & FinOps" },
          speakerLowerThird: { startFrame: 120, durationFrames: 210, name: "Folarin Favour Olaoluwapo", title: "Cloud Solutions Architect" },
          architecture1: { startFrame: 1200, durationFrames: 750, title: "AWS Microservices Architecture", leftNode: "IAM 🛡️", rightNode: "Amazon S3 🪣" },
          terminalDemo: { startFrame: 2700, durationFrames: 1050, heading: "Production CDK Stack", title: "aws cloudformation deploy" },
          metricsDashboard: { startFrame: 4200, durationFrames: 750, title: "Production Workload Telemetry", subtitle: "99.99% Availability & Latency SLAs" },
          outroCard: { startFrame: 5100, durationFrames: 300, title: "Behind The Cloud • Subscribe & Follow" },
        },
      };

    case 4:
      return {
        durationMinutes: 4,
        totalDurationFrames: 7200,
        splitScreenIntervals: [
          { startFrame: 1350, restoreFrame: 2400, mode: "bottom" },
          { startFrame: 3300, restoreFrame: 4500, mode: "bottom" },
          { startFrame: 4800, restoreFrame: 6000, mode: "bottom" },
        ],
        keywordCues: [
          ...demoKeywordCues,
          { id: "c-k8s", keyword: "kubernetes", startFrame: 2600, durationFrames: 90, position: { x: "68%", y: "20%" } },
          { id: "c-docker", keyword: "docker", startFrame: 2700, durationFrames: 90, position: { x: "68%", y: "20%" } },
        ],
        scenes: {
          titleIntro: { startFrame: 0, durationFrames: 110, title: "Enterprise Cloud Systems Architecture" },
          speakerLowerThird: { startFrame: 120, durationFrames: 210, name: "Folarin Favour Olaoluwapo", title: "Principal Cloud Architect" },
          architecture1: { startFrame: 1350, durationFrames: 1050, title: "Core AWS Infrastructure", leftNode: "IAM 🛡️", rightNode: "Amazon S3 🪣" },
          terminalDemo: { startFrame: 3300, durationFrames: 1200, heading: "Kubernetes Cluster Provisioning", title: "terraform apply -auto-approve" },
          metricsDashboard: { startFrame: 4800, durationFrames: 1200, title: "Distributed Cluster Observability", subtitle: "Real-time metrics, memory, and RPS" },
          outroCard: { startFrame: 6900, durationFrames: 300, title: "Behind The Cloud • Next Episode" },
        },
      };

    case 5:
      return {
        durationMinutes: 5,
        totalDurationFrames: 9000,
        splitScreenIntervals: [
          { startFrame: 1800, restoreFrame: 3000, mode: "bottom" },
          { startFrame: 4050, restoreFrame: 5400, mode: "bottom" },
          { startFrame: 6300, restoreFrame: 7500, mode: "bottom" },
          { startFrame: 7500, restoreFrame: 8550, mode: "bottom" },
        ],
        keywordCues: [
          ...demoKeywordCues,
          { id: "c-iam-5", keyword: "iam", startFrame: 1400, durationFrames: 100, position: { x: "68%", y: "20%" } },
          { id: "c-sec-5", keyword: "security", startFrame: 1520, durationFrames: 100, position: { x: "68%", y: "20%" } },
          { id: "c-cdk-5", keyword: "iac", startFrame: 3700, durationFrames: 100, position: { x: "68%", y: "20%" } },
        ],
        scenes: {
          titleIntro: { startFrame: 0, durationFrames: 110, title: "Cloud Architecture Masterclass" },
          speakerLowerThird: { startFrame: 120, durationFrames: 240, name: "Folarin Favour Olaoluwapo", title: "Lead Solutions Architect" },
          architecture1: { startFrame: 1800, durationFrames: 1200, title: "Foundation: IAM & Storage Hierarchy", leftNode: "IAM 🛡️", rightNode: "Amazon S3 🪣" },
          terminalDemo: { startFrame: 4050, durationFrames: 1350, heading: "Infrastructure as Code Pipeline", title: "cdk deploy --all" },
          metricsDashboard: { startFrame: 6300, durationFrames: 1200, title: "Production SLA & Telemetry", subtitle: "Global latency and throughput validation" },
          architecture2: { startFrame: 7500, durationFrames: 1050, title: "Final Production Architecture" },
          outroCard: { startFrame: 8700, durationFrames: 300, title: "Behind The Cloud • Thank You For Watching" },
        },
      };
  }
};

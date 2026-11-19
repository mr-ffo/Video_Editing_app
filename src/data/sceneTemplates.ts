import type { AspectRatio, SceneItem } from "../types/scene";
import { createDefaultScene } from "../types/scene";

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  aspectRatio: AspectRatio;
  category: "AWS & Cloud" | "DevOps" | "Security" | "Social & Shorts";
  scenes: SceneItem[];
}

export const TEMPLATE_PROJECTS: ProjectTemplate[] = [
  {
    id: "template-aws-serverless",
    name: "AWS Serverless Deep Dive",
    description: "Multi-scene architectural breakdown: Intro, Presenter overview, API Gateway -> Lambda -> DynamoDB diagram, CLI deploy, and telemetry metrics.",
    aspectRatio: "16:9",
    category: "AWS & Cloud",
    scenes: [
      createDefaultScene("intro", "t1-1"),
      {
        ...createDefaultScene("presenter", "t1-2"),
        title: "Architecture Walkthrough",
        layoutMode: "pip-bottom-right",
      },
      createDefaultScene("architecture", "t1-3"),
      createDefaultScene("code", "t1-4"),
      createDefaultScene("terminal", "t1-5"),
      createDefaultScene("metrics", "t1-6"),
      createDefaultScene("outro", "t1-7"),
    ],
  },
  {
    id: "template-devops-cicd",
    name: "DevOps CI/CD Automation",
    description: "Automated pipeline showcase featuring infrastructure code, automated test runners, terminal release commands, and telemetry.",
    aspectRatio: "16:9",
    category: "DevOps",
    scenes: [
      {
        ...createDefaultScene("intro", "t2-1"),
        title: "Automated GitOps & CI/CD Pipelines",
        subtitle: "Zero-Downtime Deployment with GitHub Actions & AWS",
        badge: "DEVOPS ARCHITECTURE",
        accentColor: "#10b981",
      },
      {
        ...createDefaultScene("code", "t2-2"),
        title: "deploy-pipeline.yml",
        language: "yaml",
        code: `name: Production Deployment
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-region: af-south-1
      - name: CDK Synth & Deploy
        run: npm run deploy:prod`,
      },
      {
        ...createDefaultScene("terminal", "t2-3"),
        title: "GitHub Actions Runner",
        heading: "Automated CI/CD Deployment",
        commands: [
          {
            command: "git push origin main",
            output: [
              "Enumerating objects: 14, done.",
              "remote: Resolving deltas: 100% (6/6)",
              "To github.com/syntaxops/cloud-service.git",
              "   38fa91..d9841c  main -> main",
              "🚀 Triggered workflow: 'Production Deployment #441'",
              "✅ All 84 integration checks passed",
            ],
            typingDelayFrames: 15,
            typingSpeed: 2,
            outputDelayFrames: 10,
          },
        ],
      },
      {
        ...createDefaultScene("metrics", "t2-4"),
        title: "CI/CD Deployment Telemetry",
        subtitle: "Pipeline metrics and cycle velocity",
        metrics: [
          {
            label: "Build & Deploy Duration",
            to: 84,
            suffix: "s",
            trend: "down",
            trendLabel: "-35s faster",
            variant: "success",
            icon: "⚡",
          },
          {
            label: "Deployment Frequency",
            to: 18,
            suffix: " / day",
            trend: "up",
            trendLabel: "+40%",
            variant: "primary",
            icon: "🚀",
          },
          {
            label: "Rollback Rate",
            to: 0.0,
            suffix: "%",
            decimals: 1,
            trend: "down",
            trendLabel: "Zero failures",
            variant: "accent",
            icon: "🛡️",
          },
        ],
      },
      createDefaultScene("outro", "t2-5"),
    ],
  },
  {
    id: "template-cloud-security",
    name: "Cloud Security & Zero-Trust IAM",
    description: "Deep dive into least-privilege IAM policies, KMS encryption keys, and S3 secure bucket access.",
    aspectRatio: "16:9",
    category: "Security",
    scenes: [
      {
        ...createDefaultScene("intro", "t3-1"),
        title: "Zero-Trust IAM & Cloud Security",
        subtitle: "Enforcing Least Privilege in Multi-Account AWS Environments",
        badge: "CLOUD SECURITY",
        accentColor: "#f59e0b",
      },
      {
        ...createDefaultScene("architecture", "t3-2"),
        title: "Least Privilege IAM Access Path",
        nodes: [
          {
            id: "iam-role",
            label: "IAM Role 🛡️",
            subtitle: "Scoped Session",
            variant: "primary",
            status: "healthy",
            delayFrames: 10,
          },
          {
            id: "kms-key",
            label: "AWS KMS 🔑",
            subtitle: "Envelope Encryption",
            variant: "accent",
            status: "active",
            delayFrames: 40,
          },
          {
            id: "s3-vault",
            label: "Amazon S3 Vault 🪣",
            subtitle: "Encrypted at Rest",
            variant: "highlight",
            status: "healthy",
            delayFrames: 70,
          },
        ],
        connections: [
          {
            id: "sec-c1",
            sourceId: "iam-role",
            targetId: "kms-key",
            label: "kms:Decrypt allowed",
            showArrow: true,
            animatedDataFlow: true,
            startDelayFrames: 30,
            drawDurationFrames: 20,
          },
          {
            id: "sec-c2",
            sourceId: "kms-key",
            targetId: "s3-vault",
            label: "s3:GetObject permitted",
            showArrow: true,
            animatedDataFlow: true,
            startDelayFrames: 60,
            drawDurationFrames: 20,
          },
        ],
      },
      createDefaultScene("callout", "t3-3"),
      createDefaultScene("outro", "t3-4"),
    ],
  },
  {
    id: "template-shorts-terminal-tip",
    name: "Quick Terminal Tip (Shorts / 9:16)",
    description: "Fast-paced portrait video designed for YouTube Shorts, Reels and TikTok explaining essential CLI shortcuts.",
    aspectRatio: "9:16",
    category: "Social & Shorts",
    scenes: [
      {
        ...createDefaultScene("intro", "t4-1"),
        title: "AWS CLI Superpower You Need",
        subtitle: "Query JSON output 10x faster with JMESPath",
        badge: "60-SECOND PRO TIP",
        accentColor: "#ec4899",
        durationInFrames: 90,
      },
      {
        ...createDefaultScene("terminal", "t4-2"),
        title: "aws-cli ~ zsh",
        heading: "Fast JMESPath Filtering",
        durationInFrames: 210,
        commands: [
          {
            command: "aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name]'",
            output: [
              "[",
              '  ["i-0a817bca891", "running"],',
              '  ["i-0b921cdf992", "stopped"]',
              "]",
            ],
            typingDelayFrames: 15,
            typingSpeed: 2,
            outputDelayFrames: 15,
          },
        ],
      },
      {
        ...createDefaultScene("callout", "t4-3"),
        title: "Pro Tip",
        keyword: "--output text",
        badge: "SHELL AUTOMATION",
        explanation: "Pipe JMESPath queries directly to xargs or jq for automated bash pipelines.",
        color: "#8b5cf6",
        durationInFrames: 120,
      },
      {
        ...createDefaultScene("outro", "t4-4"),
        title: "Follow for Daily Cloud Tips",
        subtitle: "SyntaxOps • Infrastructure & Engineering",
        ctaText: "Like & Subscribe 🚀",
        durationInFrames: 90,
      },
    ],
  },
];

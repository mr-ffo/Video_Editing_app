# Syntax Ops Graphics: Motion Graphics Engineering Guide

This guide documents the architecture, component system, design tokens, animation engine, and composition workflows for the **Behind The Cloud** video motion graphics platform.

---

## 1. Project Architecture

The system is structured into eight decoupled, single-responsibility layers:

```
src/
├── theme/              # Centralized design tokens (colors, typography, spacing, timing)
├── animations/         # Deterministic frame animation engine (spring presets, curves, interpolators)
├── types/              # Strict TypeScript definitions for diagrams, timelines, and animations
├── components/         # Atomic UI primitives, containers, diagrams, terminal, metrics, and video wrappers
├── scenes/             # Composable educational scenes (Title, Speaker, Architecture, Terminal, Metrics)
├── data/               # Strongly typed timeline manifests and architecture configurations
├── compositions/       # Top-level full-video templates (VideoOverlay, TechnicalExplainer)
└── Root.tsx            # Composition registration & Remotion Studio schemas
```

---

## 2. Folder Structure & Key Files

| Directory / File | Description |
| :--- | :--- |
| [`src/Root.tsx`](src/Root.tsx) | Composition registry declaring 1920×1080 @ 30fps compositions. |
| [`src/theme/`](src/theme/) | Design token modules (`colors.ts`, `typography.ts`, `spacing.ts`, `timing.ts`, `index.ts`). |
| [`src/animations/`](src/animations/) | Pure physics & calculation functions (`springPresets.ts`, `easing.ts`, `presets.ts`). |
| [`src/types/`](src/types/) | Domain interfaces (`diagram.ts`, `timeline.ts`, `animation.ts`). |
| [`src/components/containers/GlassPanel.tsx`](src/components/containers/GlassPanel.tsx) | Frosted glass panel container with backdrop blur, borders, and depth shadows. |
| [`src/components/diagrams/ArchitectureDiagram.tsx`](src/components/diagrams/ArchitectureDiagram.tsx) | Generic data-driven diagram engine supporting arbitrary node topologies. |
| [`src/components/diagrams/DiagramNode.tsx`](src/components/diagrams/DiagramNode.tsx) | Technical card node with spring pop-in, provider badges, and health states. |
| [`src/components/diagrams/ConnectionLine.tsx`](src/components/diagrams/ConnectionLine.tsx) | Animated SVG vector connector with pulse packets and directional arrowheads. |
| [`src/components/diagrams/providerRegistry.ts`](src/components/diagrams/providerRegistry.ts) | Provider-neutral visual identity registry (AWS, Azure, GCP, K8s, Linux, etc.). |
| [`src/components/terminal/TerminalWindow.tsx`](src/components/terminal/TerminalWindow.tsx) | Deterministic frame-based typing CLI window with progressive line output. |
| [`src/components/video/SplitScreenContainer.tsx`](src/components/video/SplitScreenContainer.tsx) | Reusable broadcast video transformation (bottom, top, left, right, pip, focus). |
| [`src/components/video/BackgroundVideo.tsx`](src/components/video/BackgroundVideo.tsx) | Deterministic video layer using Remotion's `OffthreadVideo`. |
| [`src/components/metrics/MetricCard.tsx`](src/components/metrics/MetricCard.tsx) | Animated metric counters with KPI deltas and trend indicators. |
| [`src/components/effects/Spotlight.tsx`](src/components/effects/Spotlight.tsx) | Radial illumination overlay that dims background elements. |
| [`src/components/progress/SectionProgress.tsx`](src/components/progress/SectionProgress.tsx) | Chapter progress bar and part indicator for long tutorials. |
| [`src/components/transitions/CinematicTransition.tsx`](src/components/transitions/CinematicTransition.tsx) | Fade, slide, scale, wipe, and zoom transitions. |

---

## 3. Theme & Design Tokens

Tokens are imported from `src/theme` or modular sub-paths:

```tsx
import { colors, typography, spacing, timing } from "./theme";

// Brand Colors
colors.brand.primary;      // #2563eb
colors.brand.accent;       // #f59e0b
colors.surfaces.background;// #1a1a2e
colors.surfaces.glass;     // rgba(26, 26, 46, 0.82)
colors.status.success;     // #10b981

// Timing at 30 FPS
timing.fadeIn;             // 15 frames (0.5s)
timing.slideIn;            // 25 frames (0.83s)
timing.hold;               // 60 frames (2.0s)
timing.fadeOut;            // 15 frames (0.5s)
```

---

## 4. Animation Presets & Spring Physics

Standardized springs ensure visual consistency:

```tsx
import { calculateSpring, springPresets } from "./animations/springPresets";
import { calculateFade, calculateSlideX } from "./animations/presets";

// 1. Snappy pop-in for diagram nodes
const nodeScale = calculateSpring({ frame, fps, delay: 15, preset: "snappy" });

// 2. Smooth clamped fade-in / hold / fade-out
const opacity = calculateFade(frame, durationInFrames, {
  fadeInFrames: 15,
  fadeOutFrames: 15,
});

// 3. Smooth slide-in
const translateX = calculateSlideX(frame, durationInFrames, {
  startDistance: -120,
});
```

---

## 5. How to Create Reusable UI Components

Wrap content in `GlassPanel` or use semantic design tokens:

```tsx
import React from "react";
import { GlassPanel } from "./components/containers/GlassPanel";
import { colors } from "./theme/colors";

export const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <GlassPanel width={400} height={200} padding="16px 24px">
    <h3 style={{ margin: 0, color: colors.typography.primary }}>{title}</h3>
    <div style={{ marginTop: 12, color: colors.typography.secondary }}>
      {children}
    </div>
  </GlassPanel>
);
```

---

## 6. How to Create Modular Scenes

Scenes receive frame counts local to their `<Sequence>` (starting at `frame = 0`):

```tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { TitleCard } from "../TitleCard";

export const CustomIntroScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <TitleCard title="Kubernetes Networking" />
    </AbsoluteFill>
  );
};
```

---

## 7. How to Configure Timelines

Use `src/data/scenePresets.ts` to declaratively schedule sequences:

```tsx
import { Sequence } from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { ArchitectureScene } from "./scenes/ArchitectureScene";

export const MyComposition = () => (
  <>
    <Sequence durationInFrames={90} name="Intro">
      <TitleScene title="Cloud Migration" />
    </Sequence>

    <Sequence from={90} durationInFrames={360} name="Architecture">
      <ArchitectureScene />
    </Sequence>
  </>
);
```

---

## 8. How to Create Two-Node Diagrams

Use `CloudDiagram` or `ArchitectureDiagram`:

```tsx
import { CloudDiagram } from "./CloudDiagram";

export const IAMtoS3 = () => (
  <CloudDiagram
    leftNode="IAM 🛡️"
    rightNode="Amazon S3 🪣"
    title="AWS Core Security"
  />
);
```

---

## 9. How to Create Multi-Node Diagrams (3+ Nodes)

Pass a declarative `nodes` array:

```tsx
import { ArchitectureDiagram } from "./components/diagrams/ArchitectureDiagram";

export const ThreeTierArchitecture = () => (
  <ArchitectureDiagram
    title="3-Tier Cloud Workflow"
    nodes={[
      { id: "alb", label: "Application Load Balancer", subtitle: "Public Subnet", variant: "primary", delayFrames: 15 },
      { id: "ecs", label: "ECS Fargate", subtitle: "Private App Tier", variant: "accent", delayFrames: 45 },
      { id: "rds", label: "Amazon Aurora", subtitle: "Data Tier", variant: "primary", delayFrames: 75 },
    ]}
    connections={[
      { id: "c1", sourceId: "alb", targetId: "ecs", label: "Forward :443", startDelayFrames: 30 },
      { id: "c2", sourceId: "ecs", targetId: "rds", label: "SQL Query :5432", startDelayFrames: 60 },
    ]}
  />
);
```

---

## 10. How to Create Branching Architecture Diagrams

Set explicit coordinates or custom layouts:

```tsx
import { ArchitectureDiagram } from "./components/diagrams/ArchitectureDiagram";

export const BranchingWorkflow = () => (
  <ArchitectureDiagram
    title="Event Fan-Out Pattern"
    layout={{ orientation: "custom", panelHeight: "70%" }}
    nodes={[
      { id: "sns", label: "SNS Topic 📢", position: { x: 100, y: 150 }, variant: "primary", delayFrames: 15 },
      { id: "sqs1", label: "Orders Queue 📥", position: { x: 500, y: 80 }, variant: "accent", delayFrames: 40 },
      { id: "sqs2", label: "Analytics Queue 📊", position: { x: 500, y: 220 }, variant: "accent", delayFrames: 55 },
    ]}
    connections={[
      { id: "c1", sourceId: "sns", targetId: "sqs1", label: "Publish", startDelayFrames: 25 },
      { id: "c2", sourceId: "sns", targetId: "sqs2", label: "Publish", startDelayFrames: 35 },
    ]}
  />
);
```

---

## 11. Cloud Provider Visual Identities

Set `provider` on any node to automatically inherit brand colors and badges:

```tsx
{
  id: "k8s-pod",
  label: "Payment Pod",
  provider: "kubernetes", // Applies Kubernetes blue #326ce5 and ☸️ badge
  status: "healthy",
}
```

Supported providers: `"aws"`, `"azure"`, `"gcp"`, `"kubernetes"`, `"docker"`, `"linux"`, `"networking"`, `"database"`, `"cicd"`, `"generic"`.

---

## 12. Animated Terminal CLI Component

Simulate real bash / cloud CLI typing:

```tsx
import { TerminalWindow } from "./components/terminal/TerminalWindow";

export const DeployTerminal = () => (
  <TerminalWindow
    title="bash ~ terraform apply"
    commands={[
      {
        command: "terraform apply -auto-approve",
        output: [
          "aws_vpc.main: Creating...",
          "aws_vpc.main: Creation complete after 3s [id=vpc-0a1b2c3d]",
          "Apply complete! Resources: 1 added, 0 changed, 0 destroyed.",
        ],
        typingDelayFrames: 15,
        typingSpeed: 2,
        outputDelayFrames: 10,
      },
    ]}
  />
);
```

---

## 13. Spotlight & Focus Highlighting

Dim surrounding scene elements to spotlight a specific coordinate:

```tsx
import { Spotlight } from "./components/effects/Spotlight";

export const SpotlightDemo = () => (
  <Spotlight
    x="50%"
    y="35%"
    radius={220}
    intensity={0.75}
    startFrame={60}
    durationInFrames={120}
  />
);
```

---

## 14. Animated Metrics & Telemetry Counters

Render animated counters with trend indicators:

```tsx
import { MetricCard } from "./components/metrics/MetricCard";

export const RequestsMetric = () => (
  <MetricCard
    label="API Requests"
    to={1500000}
    suffix=" / min"
    trend="up"
    trendLabel="+24% vs baseline"
    variant="primary"
    durationInFrames={45}
  />
);
```

---

## 15. Broadcast Split-Screen Layouts

Wrap video layers in `SplitScreenContainer`:

```tsx
import { SplitScreenContainer } from "./components/video/SplitScreenContainer";
import { BackgroundVideo } from "./components/video/BackgroundVideo";

export const SplitVideo = () => (
  <SplitScreenContainer startFrame={600} mode="bottom">
    <BackgroundVideo src="test-video.mp4" />
  </SplitScreenContainer>
);
```

Supported modes: `"bottom"`, `"top"`, `"left"`, `"right"`, `"pip"`, `"focus"`.

---

## 16. How to Add New Compositions

Register compositions in [`src/Root.tsx`](src/Root.tsx):

```tsx
<Composition
  id="CustomExplainer"
  component={MyComponent}
  durationInFrames={900}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{ ... }}
/>
```

---

## 17. How to Run Tests

Execute the zero-dependency test suite:

```bash
npm test
```

Runs all test suites (`animations`, `diagram`, `timeline`, `phase6`, `transitions`) in under 200ms using Node's native `node:test` runner.

---

## 18. How to Render Videos

- **Interactive Preview (Remotion Studio)**:
  ```bash
  npm run dev
  ```
- **Bundle Verification**:
  ```bash
  npm run build
  ```
- **CLI Video Export**:
  ```bash
  npx remotion render VideoOverlay out/video.mp4
  ```

---

## 19. Remotion Development Rules

1. **Deterministic Frames**: Always derive motion from `useCurrentFrame()` and `interpolate()` / `spring()`. Never use `setTimeout`, `setInterval`, or CSS keyframes.
2. **Local Sequence Coordinates**: Remotion `<Sequence from={X}>` offsets child frames to `0`. Never subtract `X` twice.
3. **Clamping**: Always pass `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }` to prevent out-of-bounds frame bleeding.
4. **No Unused Imports**: TypeScript is configured with `noUnusedLocals: true`. Clean unused imports before committing.

---

## 20. Troubleshooting & Known Limitations

- **Headless Chrome in Sandboxed Containers**: When running in isolated Linux container sandboxes without X11/GPU or IPC crashpad permissions, headless still image exports require host system access. However, bundling (`remotion bundle`), unit tests, and Remotion Studio preview work without restrictions.
- **Rspack Compatibility**: All styling is driven by pure React inline styles and SVG, bypassing PostCSS or CSS-in-JS runtime overhead.

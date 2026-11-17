# Syntax Ops Graphics: Cloud Motion Graphics System

A modular, reusable, and deterministic video motion graphics framework built with **Remotion**, **React 19**, and **TypeScript**, specifically designed for technical education, cloud engineering tutorials, and infrastructure walkthroughs.

## Core Features

- **Decoupled Architecture**: Strictly separates design tokens, physics presets, visual primitives, modular scenes, and timeline manifests.
- **Generic Architecture Diagram Engine**: Supports arbitrary node counts, branching topologies, provider themes (AWS, Azure, GCP, Kubernetes, Docker, Linux), directional SVG lines, and data packets.
- **Deterministic Animated Terminal**: Frame-accurate CLI window with progressive command typing, cursor blinking, and staggered output reveal.
- **Broadcast Split-Screen Engine**: Reusable video transformations supporting bottom, top, left, right, picture-in-picture, and focus modes.
- **Telemetry & KPI Metrics**: Frame-based count-up animations, percentages, and trend indicators.
- **Zero External UI Dependencies**: Pure React inline styles and SVG vector graphics optimized for Rspack and Chromium rendering.

---

## Registered Compositions (1920 × 1080 @ 30 FPS)

| Composition ID | Duration | Description |
| :--- | :--- | :--- |
| **`VideoOverlay`** | 1800 frames (60s) | Master broadcast composition layering video, TitleCard, LowerThird, and split-screen CloudDiagram. |
| **`TechnicalExplainer`** | 1200 frames (40s) | Standalone educational template with chapter progress, speaker intro, architecture flow, live CLI deployment, and telemetry. |
| **`CloudDiagram`** | 450 frames (15s) | Core 2-node architecture diagram component (IAM ➔ S3) with full backward compatibility. |
| **`LowerThird`** | 120 frames (4s) | Speaker identification overlay with sliding accent bar and typography hierarchy. |
| **`TitleCard`** | 90 frames (3s) | Centered branded heading with spring overshoot bounce and ambient glow. |
| **`TerminalDemo`** | 300 frames (10s) | Interactive terminal window showcase with real-time command typing simulation. |
| **`MetricsDashboard`** | 300 frames (10s) | High-availability workload metrics and SLA compliance counters. |

---

## Development Scripts

```bash
# Start the Next.js Web Studio & Player dashboard
npm run dev

# Start standalone Remotion Studio preview (timeline inspector)
npm run studio

# Run full unit and integration test suites (42 tests passing)
npm test

# Run linter and strict TypeScript compilation check
npm run lint

# Build Next.js production app (for Vercel deployment)
npm run build

# Build standalone Remotion bundle
npm run build:remotion
```

---

## AWS Lambda & S3 Setup (Fast Cloud Rendering)

Render 1080p 60fps/30fps videos in parallel across ~100 AWS Lambda workers without straining your local CPU:

### 1. Configure AWS Environment
Copy `.env.example` to `.env.local` (or configure in Vercel):
```bash
cp .env.example .env.local
```

### 2. Deploy Remotion Lambda Function
```bash
npx remotion lambda functions deploy --memory=3008 --disk=2048 --timeout=120
```
*Note the returned function name (e.g. `remotion-render-...`) and paste it as `REMOTION_FUNCTION_NAME` in your `.env.local`.*

### 3. Deploy Remotion S3 Site Bundle
```bash
npx remotion lambda sites create src/index.ts --site-name=syntax-ops-site
```
*Note the returned Serve URL and paste it as `REMOTION_SERVE_URL` in your `.env.local`.*

---

## Deploy to Vercel

1. Push your repository to GitHub or GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Settings ➔ Environment Variables**, add:
   - `REMOTION_AWS_ACCESS_KEY_ID`
   - `REMOTION_AWS_SECRET_ACCESS_KEY`
   - `REMOTION_AWS_REGION`
   - `REMOTION_BUCKET_NAME`
   - `REMOTION_FUNCTION_NAME`
   - `REMOTION_SERVE_URL`
4. Click **Deploy**. Vercel will automatically build the Next.js frontend with Turbopack!

---

## Documentation

For the complete technical guide, architectural diagrams, and component usage examples, refer to [**`MOTION_GRAPHICS_GUIDE.md`**](MOTION_GRAPHICS_GUIDE.md).

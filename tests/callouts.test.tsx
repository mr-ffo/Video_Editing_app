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

import { resolveKeyword } from "../src/components/callouts/keywordDictionary";
import { KeywordCallout } from "../src/components/callouts/KeywordCallout";
import { KeywordOverlay } from "../src/components/callouts/KeywordOverlay";
import type { KeywordCue } from "../src/types/callout";

const renderRemotionComponent = (
  component: React.ReactElement,
  compId: string = "testComp",
  frame: number = 0,
  durationInFrames: number = 300
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

test("Keyword Dictionary resolves cloud, cost, storage and business aliases accurately", () => {
  // S3 Resolution
  const s3 = resolveKeyword("s3");
  assert.strictEqual(s3.label, "Amazon S3");
  assert.strictEqual(s3.icon, "🪣");
  assert.strictEqual(s3.category, "storage");

  // Glacier Resolution
  const glacier = resolveKeyword("glacier");
  assert.strictEqual(glacier.label, "S3 Glacier");
  assert.strictEqual(glacier.icon, "🧊");
  assert.strictEqual(glacier.category, "archive");

  // Cost Savings Resolution
  const cost = resolveKeyword("reduce money");
  assert.strictEqual(cost.label, "Cost Optimization");
  assert.strictEqual(cost.icon, "💰");
  assert.strictEqual(cost.category, "cost");

  // Business Requirements Resolution
  const biz = resolveKeyword("business requirement");
  assert.strictEqual(biz.label, "Business Requirements");
  assert.strictEqual(biz.icon, "📋");
  assert.strictEqual(biz.category, "business");

  // Security Resolution
  const iam = resolveKeyword("iam");
  assert.strictEqual(iam.label, "IAM & Security");
  assert.strictEqual(iam.icon, "🛡️");
  assert.strictEqual(iam.category, "security");

  // Fallback for unknown custom query
  const fallback = resolveKeyword("Edge Computing Optimization");
  assert.strictEqual(fallback.label, "Edge Computing Optimization");
  assert.strictEqual(fallback.icon, "💡");
  assert.strictEqual(fallback.category, "general");
});

test("KeywordCallout renders icon, label, badge and glassmorphism styling", () => {
  const html = renderRemotionComponent(
    <KeywordCallout keyword="s3" durationInFrames={75} />,
    "CalloutS3",
    20,
    75
  );

  assert.ok(html.includes("Amazon S3"), "Label missing from Callout HTML");
  assert.ok(html.includes("🪣"), "Icon missing from Callout HTML");
  assert.ok(html.includes("OBJECT STORAGE") || html.includes("Object Storage"), "Badge missing from Callout HTML");
  assert.ok(html.includes("backdrop-filter:blur(16px)"), "Glassmorphism blur missing");
});

test("KeywordOverlay mounts multiple cues and supports overlapping vertical stacking", () => {
  const cues: KeywordCue[] = [
    { id: "c1", keyword: "s3", startFrame: 0, durationFrames: 60 },
    { id: "c2", keyword: "glacier", startFrame: 10, durationFrames: 60 },
    { id: "c3", keyword: "reduce money", startFrame: 20, durationFrames: 60 },
  ];

  const html = renderRemotionComponent(
    <KeywordOverlay cues={cues} />,
    "CalloutOverlay",
    15,
    100
  );

  // Both c1 and c2 should be mounted in HTML at frame 15
  assert.ok(html.includes("Amazon S3"), "Amazon S3 missing from overlay");
  assert.ok(html.includes("S3 Glacier"), "S3 Glacier missing from overlay");
});

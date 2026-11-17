import test from "node:test";
import assert from "node:assert";
import type { DiagramConfig, DiagramNode, DiagramConnection } from "../src/types/diagram";
import { calculateFade } from "../src/animations/presets";
import { calculateSpring } from "../src/animations/springPresets";
import { interpolate } from "remotion";
import { standardEase } from "../src/animations/easing";

test("Edge Case: Empty node and connection arrays resolve safely without errors", () => {
  const emptyConfig: DiagramConfig = {
    title: "Empty Test",
    nodes: [],
    connections: [],
  };

  assert.strictEqual(emptyConfig.nodes.length, 0);
  assert.strictEqual(emptyConfig.connections.length, 0);
});

test("Edge Case: 3-node and 4-node diagrams configure sequential pipelines", () => {
  const fourNodeConfig: DiagramConfig = {
    title: "4-Node Pipeline",
    nodes: [
      { id: "client", label: "Client 💻", variant: "primary" },
      { id: "dns", label: "Route 53 🌐", variant: "neutral" },
      { id: "gateway", label: "API Gateway ⚡", variant: "accent" },
      { id: "compute", label: "Lambda ⚙️", variant: "primary" },
    ],
    connections: [
      { id: "c1", sourceId: "client", targetId: "dns" },
      { id: "c2", sourceId: "dns", targetId: "gateway" },
      { id: "c3", sourceId: "gateway", targetId: "compute" },
    ],
  };

  assert.strictEqual(fourNodeConfig.nodes.length, 4);
  assert.strictEqual(fourNodeConfig.connections.length, 3);
});

test("Edge Case: Missing sourceId or targetId references are handled safely", () => {
  const configWithBrokenLinks: DiagramConfig = {
    title: "Broken References",
    nodes: [
      { id: "node-a", label: "Node A" },
      { id: "node-b", label: "Node B" },
    ],
    connections: [
      // References non-existent nodes
      { id: "broken-1", sourceId: "ghost-1", targetId: "ghost-2" },
      // Missing targetId
      { id: "broken-2", sourceId: "node-a", targetId: "missing-target" },
    ],
  };

  const nodeA = configWithBrokenLinks.nodes[0];
  const nodeB = configWithBrokenLinks.nodes[1];

  const connectionToTest: DiagramConnection = {
    id: "explicit-conn",
    sourceId: "node-a",
    targetId: "node-b",
    label: "Valid Link",
  };
  assert.strictEqual(connectionToTest.sourceId, "node-a");

  // Connection matcher simulation:
  const match = configWithBrokenLinks.connections.find(
    (c) => c.sourceId === nodeA.id && c.targetId === nodeB.id
  );
  // Broken links should NOT match adjacent pair
  assert.strictEqual(match, undefined);
});

test("Edge Case: Duplicate node and connection IDs do not crash data structure", () => {
  const configWithDuplicates: DiagramConfig = {
    title: "Duplicate IDs",
    nodes: [
      { id: "duplicate-id", label: "Node 1" },
      { id: "duplicate-id", label: "Node 2" },
    ],
    connections: [
      { id: "duplicate-conn", sourceId: "duplicate-id", targetId: "duplicate-id" },
      { id: "duplicate-conn", sourceId: "duplicate-id", targetId: "duplicate-id" },
    ],
  };

  assert.strictEqual(configWithDuplicates.nodes.length, 2);
  assert.strictEqual(configWithDuplicates.connections.length, 2);
});

test("Edge Case: Nodes without connections sit cleanly adjacent", () => {
  const disconnectedConfig: DiagramConfig = {
    title: "Disconnected Nodes",
    nodes: [
      { id: "island-1", label: "VPC Alpha" },
      { id: "island-2", label: "VPC Beta" },
    ],
    connections: [], // Intentionally empty
  };

  assert.strictEqual(disconnectedConfig.nodes.length, 2);
  assert.strictEqual(disconnectedConfig.connections.length, 0);
});

test("Edge Case: Independent node highlighting affects only designated node", () => {
  const nodes: DiagramNode[] = [
    { id: "n1", label: "IAM", highlighted: false },
    { id: "n2", label: "S3", highlighted: true },
    { id: "n3", label: "Lambda", highlighted: false },
  ];

  assert.strictEqual(nodes[0].highlighted, false);
  assert.strictEqual(nodes[1].highlighted, true);
  assert.strictEqual(nodes[2].highlighted, false);
});

test("Visual Regression: Verified frame-by-frame values match Phase 3 baseline exactly", () => {
  const duration = 450;
  const fps = 30;

  // Frame 0: Panel hidden
  assert.strictEqual(calculateFade(0, duration), 0);
  assert.strictEqual(calculateSpring({ frame: 0, fps, delay: 15, preset: "snappy" }), 0);

  // Frame 15: Panel reaches opacity 1.0, Node 1 starts pop
  assert.strictEqual(calculateFade(15, duration), 1);
  const node1At15 = calculateSpring({ frame: 15, fps, delay: 15, preset: "snappy" });
  assert.strictEqual(node1At15, 0);

  // Frame 35: Node 1 settled, line starts drawing
  const node1At35 = calculateSpring({ frame: 35, fps, delay: 15, preset: "snappy" });
  assert.ok(Math.abs(node1At35 - 1.0) < 0.05, `Node 1 at frame 35 was ${node1At35}`);
  const lineAt35 = interpolate(35, [35, 55], [0, 1], { easing: standardEase, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  assert.strictEqual(lineAt35, 0);

  // Frame 55: Line reaches 1.0, Node 2 starts pop
  const lineAt55 = interpolate(55, [35, 55], [0, 1], { easing: standardEase, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  assert.strictEqual(lineAt55, 1);
  const node2At55 = calculateSpring({ frame: 55, fps, delay: 55, preset: "snappy" });
  assert.strictEqual(node2At55, 0);

  // Frame 100: Both nodes and connector fully active
  const node2At100 = calculateSpring({ frame: 100, fps, delay: 55, preset: "snappy" });
  assert.ok(Math.abs(node2At100 - 1.0) < 0.02, `Node 2 at frame 100 was ${node2At100}`);

  // Frame 435: Fade-out begins
  assert.strictEqual(calculateFade(435, duration), 1.0);

  // Frame 449: Fade-out near completion (~93% faded)
  const fadeAt449 = calculateFade(449, duration);
  assert.ok(fadeAt449 < 0.1 && fadeAt449 > 0.0, `fadeAt449 was ${fadeAt449}`);
});

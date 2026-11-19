import test from "node:test";
import assert from "node:assert/strict";
import {
  screenToComposition,
  compositionToScreen,
  calculateAlignment,
  calculateSnapping,
  type BoundingBox,
} from "../src/lib/coordinateUtils";
import type { DiagramContainer } from "../src/types/diagram";
import { createDefaultScene, type ArchitectureSceneItem, type SceneTransition } from "../src/types/scene";

test("Precision Editing: screenToComposition and compositionToScreen 1:1 mapping", () => {
  // 16:9 Composition: 1920 x 1080 rendered on a 960 x 540 container rect
  const containerRect = {
    left: 100,
    top: 50,
    width: 960,
    height: 540,
  };

  // Screen click at container top-left (100, 50) -> comp (0, 0)
  const compOrigin = screenToComposition(100, 50, containerRect, 1920, 1080);
  assert.equal(compOrigin.x, 0);
  assert.equal(compOrigin.y, 0);

  // Screen click at center (100 + 480 = 580, 50 + 270 = 320) -> comp (960, 540)
  const compCenter = screenToComposition(580, 320, containerRect, 1920, 1080);
  assert.equal(compCenter.x, 960);
  assert.equal(compCenter.y, 540);

  // Invert with compositionToScreen
  const screenCenter = compositionToScreen(960, 540, containerRect, 1920, 1080);
  assert.equal(screenCenter.x, 580);
  assert.equal(screenCenter.y, 320);

  // 9:16 Mobile format: 1080 x 1920 rendered on 360 x 640 container
  const mobileRect = { left: 0, top: 0, width: 360, height: 640 };
  const mobileComp = screenToComposition(180, 320, mobileRect, 1080, 1920);
  assert.equal(mobileComp.x, 540);
  assert.equal(mobileComp.y, 960);

  // 1:1 Square format: 1080 x 1080 rendered on 400 x 400 container
  const squareRect = { left: 0, top: 0, width: 400, height: 400 };
  const squareComp = screenToComposition(200, 200, squareRect, 1080, 1080);
  assert.equal(squareComp.x, 540);
  assert.equal(squareComp.y, 540);
});

test("Precision Editing: calculateAlignment correctly aligns single bounding box against canvas", () => {
  const compW = 1920;
  const compH = 1080;
  const box: BoundingBox = { x: 500, y: 300, width: 200, height: 100 };

  // Align Left -> x = 0
  const [leftAligned] = calculateAlignment("left", [box], compW, compH);
  assert.equal(leftAligned.x, 0);
  assert.equal(leftAligned.y, 300);

  // Align Center-H -> x = (1920 - 200) / 2 = 860
  const [centerHAligned] = calculateAlignment("center-h", [box], compW, compH);
  assert.equal(centerHAligned.x, 860);

  // Align Right -> x = 1920 - 200 = 1720
  const [rightAligned] = calculateAlignment("right", [box], compW, compH);
  assert.equal(rightAligned.x, 1720);

  // Align Top -> y = 0
  const [topAligned] = calculateAlignment("top", [box], compW, compH);
  assert.equal(topAligned.y, 0);

  // Align Center-V -> y = (1080 - 100) / 2 = 490
  const [centerVAligned] = calculateAlignment("center-v", [box], compW, compH);
  assert.equal(centerVAligned.y, 490);

  // Align Bottom -> y = 1080 - 100 = 980
  const [bottomAligned] = calculateAlignment("bottom", [box], compW, compH);
  assert.equal(bottomAligned.y, 980);

  // Align Center Canvas -> x = 860, y = 490
  const [canvasCentered] = calculateAlignment("center-canvas", [box], compW, compH);
  assert.equal(canvasCentered.x, 860);
  assert.equal(canvasCentered.y, 490);
});

test("Precision Editing: calculateAlignment correctly aligns and distributes multiple boxes", () => {
  const compW = 1920;
  const compH = 1080;

  const boxes: BoundingBox[] = [
    { x: 100, y: 100, width: 100, height: 50 },
    { x: 400, y: 300, width: 100, height: 50 },
    { x: 900, y: 200, width: 100, height: 50 },
  ];

  // Align Left: All should align to minX (100)
  const leftMulti = calculateAlignment("left", boxes, compW, compH);
  assert.equal(leftMulti[0].x, 100);
  assert.equal(leftMulti[1].x, 100);
  assert.equal(leftMulti[2].x, 100);

  // Distribute Horizontally: between 100 and 900
  const distMulti = calculateAlignment("distribute-h", boxes, compW, compH);
  // Total span: (900 + 100) - 100 = 900. Total item width: 300. Remaining gap space: 600. Gap: 300.
  // Box 0: 100
  // Box 1: 100 + 100 + 300 = 500
  // Box 2: 500 + 100 + 300 = 900
  assert.equal(distMulti[0].x, 100);
  assert.equal(distMulti[1].x, 500);
  assert.equal(distMulti[2].x, 900);
});

test("Precision Editing: calculateSnapping detects nearby edges and centers within threshold", () => {
  const targetBoxes: BoundingBox[] = [
    { x: 200, y: 200, width: 100, height: 100 },
  ];

  // Moving box: at x = 196 (within 10px threshold of target left = 200)
  const candidateBox: BoundingBox = { x: 196, y: 200, width: 100, height: 100 };
  const snapResult = calculateSnapping(candidateBox, targetBoxes, 1920, 1080, 10);

  // x should snap to 200
  assert.equal(snapResult.x, 200);
  assert.ok(snapResult.guides.length > 0);
  const vGuide = snapResult.guides.find((g) => g.orientation === "vertical");
  assert.ok(vGuide);
  assert.equal(vGuide.position, 200);
});

test("Precision Editing: DiagramContainer and freeform connection models", () => {
  const container: DiagramContainer = {
    id: "vpc-prod",
    label: "Production VPC",
    type: "vpc",
    x: 100,
    y: 100,
    width: 800,
    height: 500,
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  };

  assert.equal(container.type, "vpc");
  assert.equal(container.width, 800);
  assert.equal(container.height, 500);

  const archScene = createDefaultScene("architecture", "arch-1") as ArchitectureSceneItem;
  assert.ok(Array.isArray(archScene.containers));
  assert.ok(archScene.containers.length >= 1);
  assert.equal(archScene.containers[0].id, "vpc-main");
  assert.ok(archScene.connections.length >= 1);

  // Check connection line styles
  const conn = archScene.connections[0];
  assert.ok(["straight", "curved", "orthogonal"].includes(conn.lineStyle || "curved"));
});

test("Precision Editing: Scene duration trimming and transition editing", () => {
  const scene = createDefaultScene("code", "code-trim");
  assert.equal(scene.durationInFrames, 210);

  // Trim duration to 120 frames
  const newDuration = Math.max(15, Math.min(1800, 120));
  const trimmed = { ...scene, durationInFrames: newDuration };
  assert.equal(trimmed.durationInFrames, 120);

  // Minimum duration constraint (15 frames)
  const underflow = Math.max(15, Math.min(1800, 5));
  assert.equal(underflow, 15);

  // Transition update
  const newTransition: SceneTransition = {
    type: "wipe",
    durationInFrames: 20,
    direction: "top",
  };
  const withTransition = { ...trimmed, transition: newTransition };
  assert.equal(withTransition.transition.type, "wipe");
  assert.equal(withTransition.transition.durationInFrames, 20);
});

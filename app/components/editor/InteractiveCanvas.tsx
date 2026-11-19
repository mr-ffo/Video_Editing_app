"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { AspectRatio, SceneItem, ArchitectureSceneItem } from "../../../src/types/scene";
import { ASPECT_RATIOS } from "../../../src/types/scene";
import type { SnappingGuide } from "../../../src/types/element";
import {
  screenToComposition,
  calculateSnapping,
  type BoundingBox,
} from "../../../src/lib/coordinateUtils";

interface InteractiveCanvasProps {
  scene: SceneItem;
  aspectRatio: AspectRatio;
  selectedElementId: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateScene?: (updated: Partial<SceneItem>) => void;
  onRecordHistory?: () => void;
  snappingEnabled?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

type DragMode = "move" | "resize" | "none";
type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  scene,
  aspectRatio,
  selectedElementId,
  onSelectElement,
  onUpdateScene,
  onRecordHistory,
  snappingEnabled = true,
  canvasWidth: customWidth,
  canvasHeight: customHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<DragMode>("none");
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [initialBox, setInitialBox] = useState<BoundingBox | null>(null);
  const [activeGuides, setActiveGuides] = useState<SnappingGuide[]>([]);

  const compDims = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS["16:9"];
  const compWidth = customWidth || compDims.width;
  const compHeight = customHeight || compDims.height;

  // Determine if active scene is an architecture diagram
  const isArchitecture = scene.type === "architecture";
  const archScene = isArchitecture ? (scene as ArchitectureSceneItem) : null;

  // Resolve bounding box of selected element
  const getSelectedBox = useCallback((): BoundingBox | null => {
    if (!selectedElementId) return null;

    if (isArchitecture && archScene) {
      // Check node
      const node = archScene.nodes.find((n) => n.id === selectedElementId);
      if (node) {
        const x = typeof node.position?.x === "number" ? node.position.x : 100;
        const y = typeof node.position?.y === "number" ? node.position.y : 100;
        return {
          x,
          y,
          width: node.width || 170,
          height: node.height || 74,
        };
      }
      // Check container
      const container = archScene.containers?.find((c) => c.id === selectedElementId);
      if (container) {
        return {
          x: container.x,
          y: container.y,
          width: container.width,
          height: container.height,
        };
      }
    }

    // Default primary scene transform box
    if (selectedElementId === scene.id || selectedElementId === "main-container") {
      const transform = scene.transform;
      return {
        x: transform?.x || 0,
        y: transform?.y || 0,
        width: transform?.width || (aspectRatio === "9:16" ? 900 : 1200),
        height: transform?.height || (aspectRatio === "9:16" ? 1100 : 640),
      };
    }

    return null;
  }, [selectedElementId, isArchitecture, archScene, scene, aspectRatio]);

  const selectedBox = getSelectedBox();

  // Commit updated box back to scene state
  const commitBoxUpdate = useCallback(
    (newBox: BoundingBox) => {
      if (!selectedElementId) return;

      if (isArchitecture && archScene) {
        // Is it a node?
        if (archScene.nodes.some((n) => n.id === selectedElementId)) {
          const updatedNodes = archScene.nodes.map((n) =>
            n.id === selectedElementId
              ? {
                  ...n,
                  position: { x: newBox.x, y: newBox.y },
                  width: newBox.width,
                  height: newBox.height,
                }
              : n
          );
          onUpdateScene?.({ nodes: updatedNodes, layout: "custom" });
          return;
        }

        // Is it a container?
        if (archScene.containers?.some((c) => c.id === selectedElementId)) {
          const updatedContainers = (archScene.containers || []).map((c) =>
            c.id === selectedElementId
              ? {
                  ...c,
                  x: newBox.x,
                  y: newBox.y,
                  width: newBox.width,
                  height: newBox.height,
                }
              : c
          );
          onUpdateScene?.({ containers: updatedContainers });
          return;
        }
      }

      // Main scene transform
      onUpdateScene?.({
        transform: {
          ...(scene.transform || {}),
          x: newBox.x,
          y: newBox.y,
          width: newBox.width,
          height: newBox.height,
        },
      });
    },
    [selectedElementId, isArchitecture, archScene, scene, onUpdateScene]
  );

  // Pointer Down to Start Dragging or Resizing
  const handlePointerDown = (
    e: React.PointerEvent,
    mode: DragMode,
    handle?: ResizeHandle
  ) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    if (!selectedBox || !containerRef.current) return;

    onRecordHistory?.();

    const rect = containerRef.current.getBoundingClientRect();
    const compPos = screenToComposition(
      e.clientX,
      e.clientY,
      rect,
      compWidth,
      compHeight
    );

    setDragMode(mode);
    setResizeHandle(handle || null);
    setDragStartPos(compPos);
    setInitialBox({ ...selectedBox });
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragMode === "none" || !dragStartPos || !initialBox || !containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const currentCompPos = screenToComposition(
      e.clientX,
      e.clientY,
      rect,
      compWidth,
      compHeight
    );

    const deltaX = currentCompPos.x - dragStartPos.x;
    const deltaY = currentCompPos.y - dragStartPos.y;

    const proposed: BoundingBox = { ...initialBox };

    if (dragMode === "move") {
      proposed.x = initialBox.x + deltaX;
      proposed.y = initialBox.y + deltaY;

      // Apply Snapping if enabled
      if (snappingEnabled) {
        const otherBoxes: BoundingBox[] = [];
        if (isArchitecture && archScene) {
          archScene.nodes
            .filter((n) => n.id !== selectedElementId)
            .forEach((n) => {
              if (typeof n.position?.x === "number" && typeof n.position?.y === "number") {
                otherBoxes.push({
                  x: n.position.x,
                  y: n.position.y,
                  width: n.width || 170,
                  height: n.height || 74,
                });
              }
            });
        }

        const snapResult = calculateSnapping(
          proposed,
          otherBoxes,
          compWidth,
          compHeight
        );
        proposed.x = snapResult.x;
        proposed.y = snapResult.y;
        setActiveGuides(snapResult.guides);
      }
    } else if (dragMode === "resize" && resizeHandle) {
      // Resize handling
      const minSize = 40;

      if (resizeHandle.includes("e")) {
        proposed.width = Math.max(minSize, initialBox.width + deltaX);
      }
      if (resizeHandle.includes("s")) {
        proposed.height = Math.max(minSize, initialBox.height + deltaY);
      }
      if (resizeHandle.includes("w")) {
        const newWidth = Math.max(minSize, initialBox.width - deltaX);
        proposed.x = initialBox.x + (initialBox.width - newWidth);
        proposed.width = newWidth;
      }
      if (resizeHandle.includes("n")) {
        const newHeight = Math.max(minSize, initialBox.height - deltaY);
        proposed.y = initialBox.y + (initialBox.height - newHeight);
        proposed.height = newHeight;
      }

      // Preserve aspect ratio if shift key is pressed
      if (e.shiftKey || scene.transform?.aspectRatioLocked) {
        const ratio = initialBox.width / initialBox.height;
        if (resizeHandle.includes("e") || resizeHandle.includes("w")) {
          proposed.height = Math.round(proposed.width / ratio);
        } else {
          proposed.width = Math.round(proposed.height * ratio);
        }
      }
    }

    commitBoxUpdate(proposed);
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setDragMode("none");
    setResizeHandle(null);
    setDragStartPos(null);
    setInitialBox(null);
    setActiveGuides([]);
  };

  // Keyboard Navigation: Nudge, Delete, Deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (!selectedElementId || !selectedBox) return;

      const step = e.shiftKey ? 10 : 1;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        commitBoxUpdate({ ...selectedBox, x: selectedBox.x - step });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        commitBoxUpdate({ ...selectedBox, x: selectedBox.x + step });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        commitBoxUpdate({ ...selectedBox, y: selectedBox.y - step });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        commitBoxUpdate({ ...selectedBox, y: selectedBox.y + step });
      } else if (e.key === "Escape") {
        e.preventDefault();
        onSelectElement?.(null);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // Delete element if in architecture graph
        if (isArchitecture && archScene) {
          e.preventDefault();
          const filteredNodes = archScene.nodes.filter((n) => n.id !== selectedElementId);
          const filteredConnections = archScene.connections.filter(
            (c) => c.sourceId !== selectedElementId && c.targetId !== selectedElementId
          );
          const filteredContainers = (archScene.containers || []).filter(
            (c) => c.id !== selectedElementId
          );
          onUpdateScene?.({
            nodes: filteredNodes,
            connections: filteredConnections,
            containers: filteredContainers,
          });
          onSelectElement?.(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedElementId,
    selectedBox,
    commitBoxUpdate,
    onSelectElement,
    isArchitecture,
    archScene,
    onUpdateScene,
  ]);

  // Convert bounding box to percentage styles relative to composition canvas
  const toPercent = (box: BoundingBox) => ({
    left: `${(box.x / compWidth) * 100}%`,
    top: `${(box.y / compHeight) * 100}%`,
    width: `${(box.width / compWidth) * 100}%`,
    height: `${(box.height / compHeight) * 100}%`,
  });

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => onSelectElement?.(null)}
      className="absolute inset-0 z-20 pointer-events-auto cursor-crosshair select-none overflow-hidden"
    >
      {/* Alignment / Snapping Guides */}
      {activeGuides.map((guide, idx) => {
        if (guide.orientation === "vertical") {
          const leftPct = `${(guide.position / compWidth) * 100}%`;
          return (
            <div
              key={`guide-v-${idx}`}
              style={{ left: leftPct }}
              className="absolute top-0 bottom-0 z-30 w-px bg-cyan-400 shadow-[0_0_8px_#22d3ee] pointer-events-none"
            >
              {guide.label && (
                <span className="absolute top-2 left-1 rounded bg-cyan-900/90 px-1 py-0.5 text-[9px] font-bold text-cyan-200">
                  {guide.label}
                </span>
              )}
            </div>
          );
        }

        const topPct = `${(guide.position / compHeight) * 100}%`;
        return (
          <div
            key={`guide-h-${idx}`}
            style={{ top: topPct }}
            className="absolute left-0 right-0 z-30 h-px bg-cyan-400 shadow-[0_0_8px_#22d3ee] pointer-events-none"
          >
            {guide.label && (
              <span className="absolute left-2 -top-4 rounded bg-cyan-900/90 px-1 py-0.5 text-[9px] font-bold text-cyan-200">
                {guide.label}
              </span>
            )}
          </div>
        );
      })}

      {/* Selectable Architecture Nodes Hitboxes */}
      {isArchitecture &&
        archScene?.nodes.map((node) => {
          const x = typeof node.position?.x === "number" ? node.position.x : 100;
          const y = typeof node.position?.y === "number" ? node.position.y : 100;
          const w = node.width || 170;
          const h = node.height || 74;
          const isSelected = selectedElementId === node.id;

          const box: BoundingBox = { x, y, width: w, height: h };
          const pStyle = toPercent(box);

          return (
            <div
              key={`node-hit-${node.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement?.(node.id);
              }}
              style={pStyle}
              className={`absolute cursor-move transition-all ${
                isSelected
                  ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 rounded-xl"
                  : "hover:ring-1 hover:ring-blue-400/60 rounded-xl"
              }`}
            />
          );
        })}

      {/* Selectable Architecture Containers Hitboxes */}
      {isArchitecture &&
        archScene?.containers?.map((c) => {
          const isSelected = selectedElementId === c.id;
          const box: BoundingBox = { x: c.x, y: c.y, width: c.width, height: c.height };
          const pStyle = toPercent(box);

          return (
            <div
              key={`cont-hit-${c.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement?.(c.id);
              }}
              style={pStyle}
              className={`absolute cursor-move transition-all ${
                isSelected
                  ? "ring-2 ring-amber-500 rounded-2xl"
                  : "hover:ring-1 hover:ring-amber-400/40 rounded-2xl"
              }`}
            />
          );
        })}

      {/* Selected Element Bounding Box & 8 Resize Handles */}
      {selectedBox && (
        <div
          style={toPercent(selectedBox)}
          onPointerDown={(e) => handlePointerDown(e, "move")}
          onClick={(e) => e.stopPropagation()}
          className="absolute border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-move z-40"
        >
          {/* Position & Dimension Badge */}
          <div className="absolute -top-7 left-0 flex items-center gap-1.5 rounded-md bg-slate-950/95 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-400 border border-slate-700 shadow pointer-events-none whitespace-nowrap">
            <span>X:{Math.round(selectedBox.x)} Y:{Math.round(selectedBox.y)}</span>
            <span className="text-slate-500">|</span>
            <span>{Math.round(selectedBox.width)}×{Math.round(selectedBox.height)}</span>
          </div>

          {/* 8 Corner and Edge Handles */}
          {(
            [
              { id: "nw", class: "-top-1.5 -left-1.5 cursor-nwse-resize" },
              { id: "n", class: "-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
              { id: "ne", class: "-top-1.5 -right-1.5 cursor-nesw-resize" },
              { id: "e", class: "top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize" },
              { id: "se", class: "-bottom-1.5 -right-1.5 cursor-nwse-resize" },
              { id: "s", class: "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
              { id: "sw", class: "-bottom-1.5 -left-1.5 cursor-nesw-resize" },
              { id: "w", class: "top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize" },
            ] as const
          ).map((h) => (
            <div
              key={h.id}
              onPointerDown={(e) => handlePointerDown(e, "resize", h.id)}
              className={`absolute h-3 w-3 rounded-full bg-white border-2 border-blue-600 shadow-md transition-transform hover:scale-125 z-50 ${h.class}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

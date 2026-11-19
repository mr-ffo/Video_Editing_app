import type { AlignmentType, SnappingGuide } from "../types/element";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Converts mouse/pointer event coordinates relative to a container into
 * absolute composition pixel coordinates (e.g. 1920x1080).
 */
export function screenToComposition(
  clientX: number,
  clientY: number,
  containerRect: { left: number; top: number; width: number; height: number },
  compWidth: number,
  compHeight: number
): { x: number; y: number } {
  if (containerRect.width === 0 || containerRect.height === 0) {
    return { x: 0, y: 0 };
  }

  const relativeX = clientX - containerRect.left;
  const relativeY = clientY - containerRect.top;

  const scaleX = compWidth / containerRect.width;
  const scaleY = compHeight / containerRect.height;

  return {
    x: Math.round(relativeX * scaleX),
    y: Math.round(relativeY * scaleY),
  };
}

/**
 * Converts composition pixel coordinates (e.g. 1920x1080) to screen pixel
 * coordinates relative to the preview container.
 */
export function compositionToScreen(
  compX: number,
  compY: number,
  containerRect: { width: number; height: number; left?: number; top?: number },
  compWidth: number,
  compHeight: number
): { x: number; y: number } {
  if (compWidth === 0 || compHeight === 0) {
    return { x: 0, y: 0 };
  }

  const scaleX = containerRect.width / compWidth;
  const scaleY = containerRect.height / compHeight;
  const offsetX = containerRect.left ?? 0;
  const offsetY = containerRect.top ?? 0;

  return {
    x: Math.round(offsetX + compX * scaleX),
    y: Math.round(offsetY + compY * scaleY),
  };
}

/**
 * Aligns and distributes an array of bounding boxes based on the specified alignment action.
 */
export function calculateAlignment(
  type: AlignmentType,
  boxes: BoundingBox[],
  canvasWidth: number,
  canvasHeight: number
): BoundingBox[] {
  if (boxes.length === 0) return [];

  // Single-box actions (or center on canvas)
  if (type === "center-canvas") {
    return boxes.map((box) => ({
      ...box,
      x: Math.round((canvasWidth - box.width) / 2),
      y: Math.round((canvasHeight - box.height) / 2),
    }));
  }

  if (boxes.length === 1) {
    const box = boxes[0];
    switch (type) {
      case "left":
        return [{ ...box, x: 0 }];
      case "center-h":
        return [{ ...box, x: Math.round((canvasWidth - box.width) / 2) }];
      case "right":
        return [{ ...box, x: canvasWidth - box.width }];
      case "top":
        return [{ ...box, y: 0 }];
      case "center-v":
        return [{ ...box, y: Math.round((canvasHeight - box.height) / 2) }];
      case "bottom":
        return [{ ...box, y: canvasHeight - box.height }];
      default:
        return [box];
    }
  }

  // Multi-box collective bounding box
  const minX = Math.min(...boxes.map((b) => b.x));
  const maxX = Math.max(...boxes.map((b) => b.x + b.width));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxY = Math.max(...boxes.map((b) => b.y + b.height));

  const collectiveCenterX = (minX + maxX) / 2;
  const collectiveCenterY = (minY + maxY) / 2;

  switch (type) {
    case "left":
      return boxes.map((b) => ({ ...b, x: minX }));

    case "center-h":
      return boxes.map((b) => ({
        ...b,
        x: Math.round(collectiveCenterX - b.width / 2),
      }));

    case "right":
      return boxes.map((b) => ({ ...b, x: maxX - b.width }));

    case "top":
      return boxes.map((b) => ({ ...b, y: minY }));

    case "center-v":
      return boxes.map((b) => ({
        ...b,
        y: Math.round(collectiveCenterY - b.height / 2),
      }));

    case "bottom":
      return boxes.map((b) => ({ ...b, y: maxY - b.height }));

    case "distribute-h": {
      if (boxes.length <= 2) return boxes;
      const sorted = [...boxes].sort((a, b) => a.x - b.x);
      const totalElementsWidth = sorted.reduce((sum, b) => sum + b.width, 0);
      const span = maxX - minX;
      const totalGap = span - totalElementsWidth;
      const gap = totalGap / (sorted.length - 1);

      let currentX = minX;
      const result = sorted.map((b) => {
        const updated = { ...b, x: Math.round(currentX) };
        currentX += b.width + gap;
        return updated;
      });
      return result;
    }

    case "distribute-v": {
      if (boxes.length <= 2) return boxes;
      const sorted = [...boxes].sort((a, b) => a.y - b.y);
      const totalElementsHeight = sorted.reduce((sum, b) => sum + b.height, 0);
      const span = maxY - minY;
      const totalGap = span - totalElementsHeight;
      const gap = totalGap / (sorted.length - 1);

      let currentY = minY;
      const result = sorted.map((b) => {
        const updated = { ...b, y: Math.round(currentY) };
        currentY += b.height + gap;
        return updated;
      });
      return result;
    }

    default:
      return boxes;
  }
}

/**
 * Calculates snapping against canvas centers, edges, and other target elements.
 */
export function calculateSnapping(
  proposed: BoundingBox,
  otherBoxes: BoundingBox[],
  canvasWidth: number,
  canvasHeight: number,
  threshold: number = 10
): { x: number; y: number; guides: SnappingGuide[] } {
  let snappedX = proposed.x;
  let snappedY = proposed.y;
  const guides: SnappingGuide[] = [];

  const propCenterX = proposed.x + proposed.width / 2;
  const propRight = proposed.x + proposed.width;
  const propCenterY = proposed.y + proposed.height / 2;
  const propBottom = proposed.y + proposed.height;

  // 1. Horizontal Snapping (X axis)
  // Check Canvas Center X
  const canvasCenterX = canvasWidth / 2;
  if (Math.abs(propCenterX - canvasCenterX) <= threshold) {
    snappedX = canvasCenterX - proposed.width / 2;
    guides.push({ orientation: "vertical", position: canvasCenterX, label: "Center" });
  } else if (Math.abs(proposed.x) <= threshold) {
    snappedX = 0;
    guides.push({ orientation: "vertical", position: 0, label: "Left Edge" });
  } else if (Math.abs(propRight - canvasWidth) <= threshold) {
    snappedX = canvasWidth - proposed.width;
    guides.push({ orientation: "vertical", position: canvasWidth, label: "Right Edge" });
  } else {
    // Check other boxes
    for (const other of otherBoxes) {
      const otherCenterX = other.x + other.width / 2;
      const otherRight = other.x + other.width;

      if (Math.abs(proposed.x - other.x) <= threshold) {
        snappedX = other.x;
        guides.push({ orientation: "vertical", position: other.x });
        break;
      }
      if (Math.abs(propCenterX - otherCenterX) <= threshold) {
        snappedX = otherCenterX - proposed.width / 2;
        guides.push({ orientation: "vertical", position: otherCenterX });
        break;
      }
      if (Math.abs(propRight - otherRight) <= threshold) {
        snappedX = otherRight - proposed.width;
        guides.push({ orientation: "vertical", position: otherRight });
        break;
      }
    }
  }

  // 2. Vertical Snapping (Y axis)
  // Check Canvas Center Y
  const canvasCenterY = canvasHeight / 2;
  if (Math.abs(propCenterY - canvasCenterY) <= threshold) {
    snappedY = canvasCenterY - proposed.height / 2;
    guides.push({ orientation: "horizontal", position: canvasCenterY, label: "Center" });
  } else if (Math.abs(proposed.y) <= threshold) {
    snappedY = 0;
    guides.push({ orientation: "horizontal", position: 0, label: "Top Edge" });
  } else if (Math.abs(propBottom - canvasHeight) <= threshold) {
    snappedY = canvasHeight - proposed.height;
    guides.push({ orientation: "horizontal", position: canvasHeight, label: "Bottom Edge" });
  } else {
    // Check other boxes
    for (const other of otherBoxes) {
      const otherCenterY = other.y + other.height / 2;
      const otherBottom = other.y + other.height;

      if (Math.abs(proposed.y - other.y) <= threshold) {
        snappedY = other.y;
        guides.push({ orientation: "horizontal", position: other.y });
        break;
      }
      if (Math.abs(propCenterY - otherCenterY) <= threshold) {
        snappedY = otherCenterY - proposed.height / 2;
        guides.push({ orientation: "horizontal", position: otherCenterY });
        break;
      }
      if (Math.abs(propBottom - otherBottom) <= threshold) {
        snappedY = otherBottom - proposed.height;
        guides.push({ orientation: "horizontal", position: otherBottom });
        break;
      }
    }
  }

  return {
    x: Math.round(snappedX),
    y: Math.round(snappedY),
    guides,
  };
}

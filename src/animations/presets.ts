import { interpolate } from "remotion";
import { timing } from "../theme/timing";
import { standardEase } from "./easing";
import { calculateSpring } from "./springPresets";
import type {
  FadeAnimationOptions,
  ScaleAnimationOptions,
  SlideAnimationOptions,
} from "../types/animation";

/**
 * Calculates a standard fade-in, hold, and fade-out opacity curve.
 * Clamped on both boundaries to prevent frame bleeding.
 */
export const calculateFade = (
  frame: number,
  durationInFrames: number,
  options?: FadeAnimationOptions
): number => {
  const fadeInFrames = options?.fadeInFrames ?? timing.fadeIn;
  const fadeOutFrames = options?.fadeOutFrames ?? timing.fadeOut;
  const fadeOutStart = durationInFrames - fadeOutFrames;

  return interpolate(
    frame,
    [0, fadeInFrames, fadeOutStart, durationInFrames],
    [
      options?.initialOpacity ?? 0,
      options?.targetOpacity ?? 1,
      options?.targetOpacity ?? 1,
      options?.initialOpacity ?? 0,
    ],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
};

/**
 * Calculates a smooth horizontal slide-in from left and subtle exit slide.
 */
export const calculateSlideX = (
  frame: number,
  durationInFrames: number,
  options?: SlideAnimationOptions
): number => {
  const slideInFrames = options?.slideInFrames ?? timing.slideIn;
  const slideOutFrames = options?.slideOutFrames ?? timing.fadeOut;
  const fadeOutStart = durationInFrames - slideOutFrames;
  const startDistance = options?.startDistance ?? -120;
  const exitDistance = options?.exitDistance ?? -60;

  return interpolate(
    frame,
    [0, slideInFrames, fadeOutStart, durationInFrames],
    [startDistance, 0, 0, exitDistance],
    {
      easing: options?.easing ?? standardEase,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
};

/**
 * Calculates a spring scale pop-in using standardized spring presets.
 */
export const calculateScalePop = (
  frame: number,
  fps: number,
  options?: ScaleAnimationOptions
): number => {
  return calculateSpring({
    frame,
    fps,
    preset: "bouncy",
    config: options?.springConfig,
    from: options?.initialScale ?? 0,
    to: options?.targetScale ?? 1,
  });
};

/**
 * Calculates broadcast split-screen transform parameters starting at a specified frame.
 */
export const calculateSplitScreenTransition = (
  frame: number,
  startFrame: number = timing.scenes.splitScreenStart,
  fps: number = timing.fps
) => {
  const progress = calculateSpring({
    frame: frame - startFrame,
    fps,
    preset: "smooth",
    config: { damping: 14 },
  });

  const scale = interpolate(progress, [0, 1], [1, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(progress, [0, 1], [0, 250], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    progress,
    scale,
    translateY,
    transform: `scale(${scale}) translateY(${translateY}px)`,
  };
};

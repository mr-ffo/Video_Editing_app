export const timing = {
  // Standard frame rate
  fps: 30,

  // Animation durations (in frames at 30fps) - strictly preserves existing tokens
  fadeIn: 15,
  slideIn: 25,
  hold: 60,
  fadeOut: 15,

  // Stagger intervals (in frames)
  stagger: {
    fast: 8,
    medium: 15,
    slow: 20,
    nodeEntranceDelay: 15,
    lineDrawStartDelay: 35,
    lineDrawDuration: 20,
    targetNodeDelay: 55,
  },

  // Scene landmarks (in frames)
  scenes: {
    titleCardDuration: 110,
    lowerThirdStart: 100,
    lowerThirdDuration: 210,
    splitScreenStart: 600,
    cloudDiagramDuration: 450,
    totalDuration: 1800,
  },
} as const;

export type Timing = typeof timing;

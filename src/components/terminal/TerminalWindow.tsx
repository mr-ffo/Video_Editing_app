import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

export interface TerminalCommand {
  command: string;
  output?: string | string[];
  typingDelayFrames?: number;
  typingSpeed?: number; // frames per character (default: 2)
  outputDelayFrames?: number;
}

export interface TerminalWindowProps {
  title?: string;
  commands?: TerminalCommand[];
  prompt?: string;
  width?: string | number;
  height?: string | number;
  startFrame?: number;
  theme?: "dark" | "glass" | "matrix";
  style?: React.CSSProperties;
}

/**
 * Deterministic frame-based animated terminal window.
 * Computes progressive character typing, command execution, and progressive
 * output rendering strictly from useCurrentFrame().
 */
export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  title = "cloud-shell ~ bash",
  commands = [
    {
      command: "aws s3 ls",
      output: [
        "2026-11-12 10:30:00 efarm-course-content",
        "2026-11-12 10:32:15 behind-the-cloud-assets",
        "2026-11-12 10:35:42 production-artifacts-v1",
      ],
      typingDelayFrames: 15,
      typingSpeed: 2,
      outputDelayFrames: 10,
    },
  ],
  prompt = "$",
  width = 720,
  height = 420,
  startFrame = 0,
  theme = "dark",
  style,
}) => {
  const currentFrame = useCurrentFrame();
  const localFrame = Math.max(0, currentFrame - startFrame);

  // Blinking cursor: toggles every 15 frames (0.5s at 30fps)
  const isCursorVisible = Math.floor(localFrame / 15) % 2 === 0;

  // Window background and styling
  const isGlass = theme === "glass";
  const isMatrix = theme === "matrix";

  const terminalBg = isGlass
    ? "rgba(15, 23, 42, 0.85)"
    : isMatrix
      ? "#0a0f0a"
      : "#0f172a";

  const textColor = isMatrix ? "#22c55e" : "#f8fafc";
  const promptColor = isMatrix ? "#4ade80" : colors.brand.accent;

  // Window entrance fade/scale
  const windowOpacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const windowScale = interpolate(localFrame, [0, 10], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: terminalBg,
        backdropFilter: isGlass ? "blur(16px)" : undefined,
        WebkitBackdropFilter: isGlass ? "blur(16px)" : undefined,
        border: `1px solid ${colors.borders.subtle}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(37, 99, 235, 0.2)",
        fontFamily: typography.fonts.mono,
        opacity: windowOpacity,
        transform: `scale(${windowScale})`,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Title Bar with Window Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#f59e0b", display: "inline-block" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }} />
        </div>
        <div
          style={{
            fontSize: 12,
            color: colors.typography.muted,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </div>
        <div style={{ width: 45 }} />
      </div>

      {/* Terminal Body */}
      <div
        style={{
          padding: "18px 24px",
          color: textColor,
          fontSize: 14,
          lineHeight: 1.6,
          overflowY: "hidden",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {commands.map((cmdItem, cmdIndex) => {
          const typingStart = cmdItem.typingDelayFrames ?? 15;
          const typingSpeed = cmdItem.typingSpeed ?? 2;
          const totalTypingFrames = cmdItem.command.length * typingSpeed;
          const typingEnd = typingStart + totalTypingFrames;

          // How many characters have been typed by localFrame
          const charsTyped =
            localFrame < typingStart
              ? 0
              : Math.min(
                  cmdItem.command.length,
                  Math.floor((localFrame - typingStart) / typingSpeed)
                );

          const displayedCommand = cmdItem.command.slice(0, charsTyped);
          const isCurrentlyTyping =
            localFrame >= typingStart && localFrame < typingEnd;

          // Output handling
          const outputStart = typingEnd + (cmdItem.outputDelayFrames ?? 10);
          const outputLines = Array.isArray(cmdItem.output)
            ? cmdItem.output
            : cmdItem.output
              ? [cmdItem.output]
              : [];

          // Progressive reveal of output lines (staggered by 6 frames per line)
          const visibleOutputLines = outputLines.filter((_, lineIdx) => {
            return localFrame >= outputStart + lineIdx * 6;
          });

          return (
            <div key={`cmd-${cmdIndex}`} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Command Line */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: promptColor, fontWeight: 700 }}>{prompt}</span>
                <span>{displayedCommand}</span>
                {isCurrentlyTyping && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 16,
                      backgroundColor: promptColor,
                      opacity: isCursorVisible ? 1 : 0,
                      marginLeft: 2,
                    }}
                  />
                )}
              </div>

              {/* Progressive Output Lines */}
              {visibleOutputLines.length > 0 && (
                <div
                  style={{
                    color: isMatrix ? "#86efac" : "rgba(255, 255, 255, 0.75)",
                    paddingLeft: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  {visibleOutputLines.map((line, lIdx) => (
                    <div key={`out-${cmdIndex}-${lIdx}`}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Resting cursor when all commands finish */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <span style={{ color: promptColor, fontWeight: 700 }}>{prompt}</span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 16,
              backgroundColor: promptColor,
              opacity: isCursorVisible ? 1 : 0,
            }}
          />
        </div>
      </div>
    </div>
  );
};

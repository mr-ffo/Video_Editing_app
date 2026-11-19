import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { typography } from "../../theme/typography";
import { standardEase } from "../../animations/easing";

export interface CodeEditorSceneProps {
  title?: string;
  language?: "typescript" | "python" | "yaml" | "json" | "bash" | "dockerfile";
  code?: string;
  activeLine?: number;
  highlightedLines?: number[];
  fontSize?: number;
  theme?: "dark" | "cyber" | "clean";
  width?: string | number;
  height?: string | number;
}

/**
 * Lightweight deterministic syntax highlighter tokenizing keywords, strings, comments, and identifiers.
 */
function highlightCodeTokens(line: string, language: string): React.ReactNode[] {
  const keywords = new Set([
    "import", "export", "from", "const", "let", "var", "function", "return",
    "async", "await", "if", "else", "for", "while", "class", "interface",
    "type", "new", "try", "catch", "throw", "def", "lambda", "with", "as",
    "name:", "on:", "jobs:", "runs-on:", "steps:", "uses:", "run:",
  ]);

  // Match comments first
  if (line.trim().startsWith("//") || line.trim().startsWith("#")) {
    return [
      <span key="c-all" style={{ color: "#64748b", fontStyle: "italic" }}>
        {line}
      </span>,
    ];
  }

  // Split line preserving whitespace and punctuation
  const parts = line.split(/([a-zA-Z0-9_$:-]+|"[^"]*"|'[^']*'|`[^`]*`|\s+|[{}()[\],;.])/g).filter(Boolean);

  return parts.map((part, idx) => {
    // Strings
    if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'")) || (part.startsWith("`") && part.endsWith("`"))) {
      return (
        <span key={idx} style={{ color: "#34d399" }}>
          {part}
        </span>
      );
    }
    // Keywords
    if (keywords.has(part) || (language === "yaml" && part.endsWith(":"))) {
      return (
        <span key={idx} style={{ color: "#f43f5e", fontWeight: 600 }}>
          {part}
        </span>
      );
    }
    // Numbers
    if (/^\d+(\.\d+)?$/.test(part)) {
      return (
        <span key={idx} style={{ color: "#fbbf24" }}>
          {part}
        </span>
      );
    }
    // Types or uppercase constants
    if (/^[A-Z][a-zA-Z0-9_]*$/.test(part)) {
      return (
        <span key={idx} style={{ color: "#38bdf8", fontWeight: 500 }}>
          {part}
        </span>
      );
    }
    // Function calls
    if (idx + 1 < parts.length && parts[idx + 1] === "(") {
      return (
        <span key={idx} style={{ color: "#818cf8" }}>
          {part}
        </span>
      );
    }

    return (
      <span key={idx} style={{ color: "#e2e8f0" }}>
        {part}
      </span>
    );
  });
}

export const CodeEditorScene: React.FC<CodeEditorSceneProps> = ({
  title = "handler.ts",
  language = "typescript",
  code = `import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};`,
  activeLine = 4,
  highlightedLines = [4],
  fontSize = 17,
  theme = "dark",
  width = 960,
  height = 560,
}) => {
  const frame = useCurrentFrame();

  // Entrance spring-like fade & slide up
  const entranceOpacity = interpolate(frame, [0, 20], [0, 1], {
    easing: standardEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const entranceY = interpolate(frame, [0, 20], [25, 0], {
    easing: standardEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lines = code.split("\n");

  // Determine language icon badge
  const getLangBadge = () => {
    switch (language) {
      case "typescript":
        return { label: "TS", color: "#3178c6" };
      case "python":
        return { label: "PY", color: "#3572A5" };
      case "yaml":
        return { label: "YML", color: "#cb171e" };
      case "json":
        return { label: "JSON", color: "#f59e0b" };
      case "bash":
        return { label: "SH", color: "#4ade80" };
      case "dockerfile":
        return { label: "DOCKER", color: "#38bdf8" };
      default:
        return { label: "CODE", color: "#818cf8" };
    }
  };

  const badge = getLangBadge();

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        fontFamily: typography.fonts.sans,
      }}
    >
      <div
        style={{
          width,
          maxWidth: "96%",
          height,
          maxHeight: "92%",
          backgroundColor: theme === "cyber" ? "#030712" : "#0b0f19",
          borderRadius: 16,
          border: theme === "cyber" ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow:
            theme === "cyber"
              ? "0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(56, 189, 248, 0.2)"
              : "0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(59, 130, 246, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          opacity: entranceOpacity,
          transform: `translateY(${entranceY}px)`,
        }}
      >
        {/* Editor Titlebar */}
        <div
          style={{
            height: 48,
            backgroundColor: "#080c16",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
          }}
        >
          {/* macOS Window Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ef4444" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#10b981" }} />
          </div>

          {/* Active File Tab */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 8,
              padding: "4px 14px",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 4,
                backgroundColor: `${badge.color}20`,
                color: badge.color,
                border: `1px solid ${badge.color}40`,
              }}
            >
              {badge.label}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#f1f5f9",
                fontFamily: typography.fonts.mono,
              }}
            >
              {title}
            </span>
          </div>

          {/* Environment Indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                boxShadow: "0 0 8px #3b82f6",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "#64748b",
                fontFamily: typography.fonts.mono,
                textTransform: "uppercase",
              }}
            >
              {language}
            </span>
          </div>
        </div>

        {/* Code Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 0",
            fontFamily: typography.fonts.mono,
            fontSize,
            lineHeight: 1.6,
          }}
        >
          {lines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightedLines.includes(lineNum);
            const isActive = activeLine === lineNum;

            // Progressive line reveal calculation: lines reveal every 3 frames
            const lineRevealFrame = 12 + idx * 3;
            const lineOpacity = interpolate(frame, [lineRevealFrame, lineRevealFrame + 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "2px 20px",
                  opacity: lineOpacity,
                  backgroundColor: isActive
                    ? "rgba(59, 130, 246, 0.16)"
                    : isHighlighted
                    ? "rgba(255, 255, 255, 0.04)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #3b82f6"
                    : isHighlighted
                    ? "3px solid rgba(255, 255, 255, 0.2)"
                    : "3px solid transparent",
                }}
              >
                {/* Line Number */}
                <span
                  style={{
                    width: 44,
                    userSelect: "none",
                    color: isActive ? "#93c5fd" : "#475569",
                    fontSize: fontSize - 2,
                    textAlign: "right",
                    marginRight: 24,
                  }}
                >
                  {lineNum}
                </span>

                {/* Line Code Tokens */}
                <div style={{ flex: 1, whiteSpace: "pre" }}>
                  {highlightCodeTokens(lineText, language)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

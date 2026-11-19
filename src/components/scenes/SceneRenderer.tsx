import React from "react";
import { AbsoluteFill } from "remotion";
import type { AspectRatio, SceneItem } from "../../types/scene";
import { CinematicTransition } from "../transitions/CinematicTransition";
import { ArchitectureDiagram } from "../diagrams/ArchitectureDiagram";
import { TerminalScene } from "../../scenes/TerminalScene";
import { MetricsScene } from "../../scenes/MetricsScene";
import { CodeEditorScene } from "../code/CodeEditorScene";
import { TitleCard } from "../../TitleCard";
import { LowerThird } from "../../LowerThird";
import { SplitScreenContainer } from "../video/SplitScreenContainer";
import { SmartVideo } from "../video/SmartVideo";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

interface SceneRendererProps {
  scene: SceneItem;
  aspectRatio?: AspectRatio;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  scene,
  aspectRatio = "16:9",
}) => {
  const isPortrait = aspectRatio === "9:16";

  // Transition mapping
  const transitionType = scene.transition?.type || "crossfade";
  const transitionDuration = scene.transition?.durationInFrames || 15;
  const transitionDirection = scene.transition?.direction || "left";

  const renderSceneContent = () => {
    switch (scene.type) {
      case "intro":
        return (
          <AbsoluteFill
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              background: `radial-gradient(circle at 50% 40%, rgba(30, 58, 138, 0.45) 0%, rgba(8, 13, 26, 0.95) 75%), ${colors.background}`,
              fontFamily: typography.fonts.sans,
              padding: isPortrait ? "80px 40px" : "40px 80px",
              textAlign: "center",
            }}
          >
            {scene.badge && (
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 18px",
                  borderRadius: 9999,
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  color: "#60a5fa",
                  fontSize: isPortrait ? 13 : 15,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 24,
                }}
              >
                {scene.badge}
              </div>
            )}

            <TitleCard title={scene.title} />

            {scene.subtitle && (
              <p
                style={{
                  marginTop: 24,
                  fontSize: isPortrait ? 22 : 28,
                  fontWeight: 500,
                  color: colors.typography.secondary,
                  maxWidth: isPortrait ? 800 : 1100,
                  lineHeight: 1.4,
                }}
              >
                {scene.subtitle}
              </p>
            )}
          </AbsoluteFill>
        );

      case "presenter":
        return (
          <AbsoluteFill
            style={{
              backgroundColor: colors.background,
              overflow: "hidden",
            }}
          >
            {/* Background or PiP Video */}
            {scene.layoutMode === "full" ? (
              <SmartVideo
                src={scene.videoUrl || "test-video.mp4"}
                playbackRate={1.0}
              />
            ) : scene.layoutMode === "split-left" || scene.layoutMode === "split-right" ? (
              <SplitScreenContainer
                mode={scene.layoutMode === "split-left" ? "left" : "right"}
              >
                <SmartVideo
                  src={scene.videoUrl || "test-video.mp4"}
                  playbackRate={1.0}
                />
              </SplitScreenContainer>
            ) : (
              // PiP Mode
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse at 50% 50%, #1e293b 0%, #080d1a 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: scene.layoutMode === "pip-bottom-right" ? 50 : "auto",
                    top: scene.layoutMode === "pip-top-right" ? 50 : "auto",
                    right: 50,
                    width: isPortrait ? 400 : 480,
                    height: isPortrait ? 225 : 270,
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "2px solid rgba(59, 130, 246, 0.5)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                  }}
                >
                  <SmartVideo
                    src={scene.videoUrl || "test-video.mp4"}
                    playbackRate={1.0}
                  />
                </div>
              </>
            )}

            {/* Speaker Lower Third */}
            <LowerThird
              name={scene.speakerName || "Presenter"}
              title={scene.speakerTitle || "Cloud Engineer"}
            />
          </AbsoluteFill>
        );

      case "architecture":
        return (
          <AbsoluteFill
            style={{
              backgroundColor: colors.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArchitectureDiagram
              title={scene.title}
              nodes={scene.nodes}
              connections={scene.connections}
              containers={scene.containers}
              layout={{
                orientation:
                  scene.layout || (isPortrait ? "vertical" : "horizontal"),
                panelWidth: isPortrait ? "90%" : 1400,
                panelHeight: isPortrait ? "85%" : 700,
              }}
            />
          </AbsoluteFill>
        );

      case "terminal":
        return (
          <AbsoluteFill
            style={{
              backgroundColor: colors.background,
            }}
          >
            <TerminalScene
              title={scene.title}
              heading={scene.heading}
              commands={scene.commands}
              prompt={scene.prompt}
            />
          </AbsoluteFill>
        );

      case "code":
        return (
          <AbsoluteFill
            style={{
              backgroundColor: colors.background,
            }}
          >
            <CodeEditorScene
              title={scene.title}
              language={scene.language}
              code={scene.code}
              activeLine={scene.activeLine}
              highlightedLines={scene.highlightedLines}
              fontSize={scene.fontSize || (isPortrait ? 15 : 17)}
              theme={scene.theme || "dark"}
              width={isPortrait ? 880 : 1200}
              height={isPortrait ? 1200 : 640}
            />
          </AbsoluteFill>
        );

      case "metrics":
        return (
          <AbsoluteFill
            style={{
              backgroundColor: colors.background,
            }}
          >
            <MetricsScene
              title={scene.title}
              subtitle={scene.subtitle}
              metrics={scene.metrics}
            />
          </AbsoluteFill>
        );

      case "callout":
        return (
          <AbsoluteFill
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.background,
              fontFamily: typography.fonts.sans,
              padding: 40,
            }}
          >
            <div
              style={{
                maxWidth: isPortrait ? 780 : 900,
                padding: "48px 56px",
                borderRadius: 24,
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                border: `2px solid ${scene.color || "#3b82f6"}`,
                boxShadow: `0 25px 60px rgba(0,0,0,0.8), 0 0 50px ${(scene.color || "#3b82f6")}33`,
                textAlign: "center",
              }}
            >
              {scene.badge && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 14px",
                    borderRadius: 9999,
                    backgroundColor: `${scene.color || "#3b82f6"}22`,
                    color: scene.color || "#3b82f6",
                    border: `1px solid ${scene.color || "#3b82f6"}55`,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 20,
                  }}
                >
                  {scene.badge}
                </span>
              )}

              <h2
                style={{
                  margin: "0 0 16px 0",
                  fontSize: isPortrait ? 38 : 48,
                  fontWeight: 900,
                  color: colors.typography.primary,
                  letterSpacing: "-0.02em",
                }}
              >
                {scene.keyword}
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: isPortrait ? 22 : 26,
                  color: colors.typography.secondary,
                  lineHeight: 1.5,
                }}
              >
                {scene.explanation}
              </p>
            </div>
          </AbsoluteFill>
        );

      case "outro":
        return (
          <AbsoluteFill
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              background: `radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.25) 0%, rgba(8, 13, 26, 0.95) 70%), ${colors.background}`,
              fontFamily: typography.fonts.sans,
              textAlign: "center",
              padding: 40,
            }}
          >
            <h2
              style={{
                fontSize: isPortrait ? 40 : 54,
                fontWeight: 900,
                color: colors.typography.primary,
                letterSpacing: "-0.03em",
                margin: "0 0 16px 0",
              }}
            >
              {scene.title}
            </h2>

            {scene.subtitle && (
              <p
                style={{
                  fontSize: isPortrait ? 20 : 26,
                  color: colors.typography.secondary,
                  maxWidth: 800,
                  margin: "0 0 36px 0",
                  lineHeight: 1.4,
                }}
              >
                {scene.subtitle}
              </p>
            )}

            {scene.ctaText && (
              <div
                style={{
                  padding: "16px 36px",
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                  boxShadow: "0 12px 30px rgba(37, 99, 235, 0.4)",
                  color: "#ffffff",
                  fontSize: isPortrait ? 18 : 22,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  marginBottom: 30,
                }}
              >
                {scene.ctaText}
              </div>
            )}

            {scene.speakerName && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: colors.typography.muted,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                <span>{scene.speakerName}</span>
                {scene.speakerHandle && (
                  <span style={{ color: "#60a5fa" }}>{scene.speakerHandle}</span>
                )}
              </div>
            )}
          </AbsoluteFill>
        );

      default:
        return (
          <AbsoluteFill
            style={{
              backgroundColor: colors.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.typography.secondary,
            }}
          >
            Scene: {(scene as SceneItem).title}
          </AbsoluteFill>
        );
    }
  };

  const transformedContent = scene.transform ? (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `translate(${scene.transform.x || 0}px, ${scene.transform.y || 0}px) scale(${scene.transform.scale ?? 1}) rotate(${scene.transform.rotation || 0}deg)`,
        opacity: scene.transform.opacity ?? 1,
      }}
    >
      {renderSceneContent()}
    </div>
  ) : (
    renderSceneContent()
  );

  // Wrap with transition if configured
  if (transitionType === "cut") {
    return <AbsoluteFill>{transformedContent}</AbsoluteFill>;
  }

  const mappedType =
    transitionType === "slide"
      ? "slide"
      : transitionType === "zoom"
      ? "zoom"
      : "fade";

  return (
    <CinematicTransition
      type={mappedType}
      direction={transitionDirection}
      durationInFrames={transitionDuration}
      exitDurationFrames={transitionDuration}
    >
      {transformedContent}
    </CinematicTransition>
  );
};

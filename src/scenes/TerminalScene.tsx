import React from "react";
import { AbsoluteFill } from "remotion";
import {
  TerminalWindow,
  type TerminalCommand,
} from "../components/terminal/TerminalWindow";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

export interface TerminalSceneProps {
  title?: string;
  heading?: string;
  commands?: TerminalCommand[];
  prompt?: string;
}

export const TerminalScene: React.FC<TerminalSceneProps> = ({
  title = "Infrastructure CLI",
  heading = "Deploying Cloud Architecture",
  commands,
  prompt = "$",
}) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        fontFamily: typography.fonts.sans,
      }}
    >
      {heading && (
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 800,
              color: colors.typography.primary,
              letterSpacing: "-0.02em",
            }}
          >
            {heading}
          </h2>
        </div>
      )}

      <TerminalWindow
        title={title}
        commands={commands}
        prompt={prompt}
        width={840}
        height={460}
      />
    </AbsoluteFill>
  );
};

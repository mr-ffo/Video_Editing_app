import React from "react";
import { LowerThird } from "../LowerThird";

export interface SpeakerSceneProps {
  name?: string;
  title?: string;
  avatarUrl?: string;
}

/**
 * Modular SpeakerScene coordinating speaker identification.
 * Delegates to LowerThird to guarantee 100% visual baseline compatibility.
 */
export const SpeakerScene: React.FC<SpeakerSceneProps> = ({
  name = "Folarin Favour Olaoluwapo",
  title = "Cloud Engineer",
}) => {
  return <LowerThird name={name} title={title} />;
};

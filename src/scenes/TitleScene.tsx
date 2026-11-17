import React from "react";
import { TitleCard } from "../TitleCard";

export interface TitleSceneProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

/**
 * Modular TitleScene coordinating introductory branding and titles.
 * Delegates to TitleCard to guarantee 100% visual baseline compatibility.
 */
export const TitleScene: React.FC<TitleSceneProps> = ({
  title = "Behind The Cloud",
}) => {
  return <TitleCard title={title} />;
};

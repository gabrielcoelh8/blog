"use client";

import type { SceneId } from "@/lib/chapters";
import { SCENES, type SceneMode } from "./scenes";

/**
 * Renders the contents of a scene INSIDE the Canvas created by SceneFrame.
 * mode "background" → the scene's Background component (or nothing);
 * otherwise the scene's Main component framed as a cover or banner.
 */
export default function SceneRenderer({
  sceneId,
  mode,
}: {
  sceneId: SceneId;
  mode: SceneMode;
  animate?: boolean;
}) {
  const scene = SCENES[sceneId];
  if (!scene) return null;

  if (mode === "background") {
    const Bg = scene.Background;
    return Bg ? <Bg /> : null;
  }

  const Main = scene.Main;
  return <Main mode={mode} />;
}

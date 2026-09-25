"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Experience3D = dynamic(() => import("@/components/scene/Experience3D"), {
  ssr: false,
  loading: () => null,
});

/**
 * Mounts the WebGL valley once for the whole app, the first time the home is
 * visited: a content page opened directly never downloads three.js. After
 * that, on any route other than the home the scene is hidden and its render
 * loop paused, so coming back is instant instead of rebuilding terrain and
 * shaders.
 */
export function SceneHost() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [wanted, setWanted] = useState(home);
  if (home && !wanted) setWanted(true);
  return wanted ? <Experience3D active={home} /> : null;
}

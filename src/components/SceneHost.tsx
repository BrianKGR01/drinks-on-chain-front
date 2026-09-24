"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Experience3D = dynamic(() => import("@/components/scene/Experience3D"), {
  ssr: false,
  loading: () => null,
});

/**
 * Mounts the WebGL valley once for the whole app. On any route other than the
 * home the scene is hidden and its render loop paused, so coming back from a
 * parcel page is instant instead of rebuilding terrain and shaders.
 */
export function SceneHost() {
  const pathname = usePathname();
  return <Experience3D active={pathname === "/"} />;
}

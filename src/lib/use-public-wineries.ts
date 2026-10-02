"use client";

import { useEffect, useSyncExternalStore } from "react";
import { directoryStore, type PublicWinery } from "./public-wineries";

const noProfiles = () => null;

/**
 * Public profiles of the API, or null while there is no good answer (the page then
 * shows the directory of `src/content`). The server and the first paint always get
 * null, so the HTML never depends on the API; the answer arrives after hydration.
 *
 * `enabled` is false when the site was built without `API_ORIGIN`: nothing is asked.
 */
export function usePublicWineries(enabled: boolean): PublicWinery[] | null {
  const profiles = useSyncExternalStore(directoryStore.subscribe, directoryStore.getSnapshot, noProfiles);
  useEffect(() => {
    if (enabled) void directoryStore.refresh();
  }, [enabled]);
  return enabled ? profiles : null;
}

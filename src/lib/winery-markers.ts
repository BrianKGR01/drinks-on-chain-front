/**
 * Bridge between the WebGL scene and the DOM markers of the winery seats.
 *
 * The HUD renders one plain button per seat (components/hud/WineryMarkers)
 * and registers it here; the scene (components/scene/WineryAnchors)
 * projects each seat to the screen every frame and moves the button with a
 * transform. No React state per frame and no extra React roots.
 */
export const wineryMarkerEls = new Map<string, HTMLElement>();

export function registerWineryMarker(id: string, el: HTMLElement | null) {
  if (el) wineryMarkerEls.set(id, el);
  else wineryMarkerEls.delete(id);
}

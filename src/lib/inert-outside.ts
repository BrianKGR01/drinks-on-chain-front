/**
 * Makes everything outside `el` inert (no focus, no clicks, hidden from
 * assistive tech) by walking up to <body> and marking the siblings of every
 * ancestor. Returns the undo. Used by the age gate so Tab never leaves the
 * dialog for links hidden behind it. Elements that were already inert are
 * left alone, so their owners keep control of them.
 */
export function inertOutside(el: HTMLElement): () => void {
  const touched: Element[] = [];
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;
    for (const sibling of Array.from(parent.children)) {
      if (sibling === node || sibling.hasAttribute("inert") || sibling.tagName === "SCRIPT") continue;
      sibling.setAttribute("inert", "");
      touched.push(sibling);
    }
    node = parent;
  }
  return () => {
    for (const sibling of touched) sibling.removeAttribute("inert");
  };
}

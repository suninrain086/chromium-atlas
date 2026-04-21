// Minimal DOM helpers — keeps the framework-free codebase legible.

type AttrMap = Record<string, string | boolean | number | null | undefined> & {
  on?: Record<string, EventListener>;
};

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: AttrMap | null,
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "on" && typeof v === "object" && v !== null) {
        for (const [evt, handler] of Object.entries(v as Record<string, EventListener>)) {
          el.addEventListener(evt, handler);
        }
        continue;
      }
      if (v === false || v == null) continue;
      if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, String(v));
    }
  }
  for (const c of children) {
    if (c == null || c === false) continue;
    el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return el;
}

export function clear(el: HTMLElement): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function on<E extends keyof HTMLElementEventMap>(
  el: HTMLElement | Document | Window,
  evt: E | string,
  handler: EventListener,
  opts?: AddEventListenerOptions,
): () => void {
  el.addEventListener(evt, handler, opts);
  return () => el.removeEventListener(evt, handler, opts);
}

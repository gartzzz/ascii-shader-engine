// FILE: src/vanilla/autoInit.ts
import { createAsciiShader } from "./createAsciiShader";

function parseDataset(el: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(el.dataset)) if (v !== undefined) out[k] = v;
  return out;
}

export function initAsciiShaders(root: ParentNode = document): void {
  const nodes = root.querySelectorAll<HTMLElement>("[data-ascii-shader]");
  nodes.forEach((el) => {
    if ((el as unknown as { _asciiInit?: boolean })._asciiInit) return;
    (el as unknown as { _asciiInit: boolean })._asciiInit = true;
    const ds = parseDataset(el);
    const src = ds.src || ds.asciiShader || el.getAttribute("data-src") || "";
    if (!src) { console.warn("[ascii-shader] data-src missing", el); return; }
    const opts: Record<string, unknown> = { src, target: el };
    if (ds.preset) opts.preset = ds.preset;
    if (ds.charset) opts.charset = ds.charset;
    if (ds.charsetPreset) opts.charsetPreset = ds.charsetPreset;
    if (ds.preset) opts.preset = ds.preset;
    if (ds.colorMode) opts.colorMode = ds.colorMode;
    if (ds.cellSize) opts.cellSize = Number(ds.cellSize);
    if (ds.interaction) opts.interaction = ds.interaction;
    createAsciiShader(opts as never);
  });
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => initAsciiShaders());
  else initAsciiShaders();
}

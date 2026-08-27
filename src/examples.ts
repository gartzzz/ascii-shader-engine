// FILE: src/examples.ts
export function vanillaHtmlSnippet(src: string, preset: string): string {
  return `<div data-ascii-shader data-src="${src}" data-preset="${preset}" style="width:100%;height:100vh"></div>\n<script src="https://cdn.jsdelivr.net/npm/ascii-shader-engine/dist/ascii-shader.umd.js"></script>`;
}
export function vanillaJsSnippet(target: string, src: string, preset: string): string {
  return `import { createAsciiShader } from "ascii-shader-engine/vanilla";\ncreateAsciiShader({ target: "${target}", src: "${src}", preset: "${preset}" });`;
}

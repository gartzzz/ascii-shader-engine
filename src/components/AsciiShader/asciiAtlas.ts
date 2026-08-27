// FILE: src/components/AsciiShader/asciiAtlas.ts
import * as THREE from "three";

export type GlyphAtlas = { texture: THREE.Texture; count: number; cellWidth: number; cellHeight: number };

export function createGlyphAtlas(charset: string, fontFamily: string, fontWeight: number | string, sortByDensity: boolean): GlyphAtlas {
  if (typeof document === "undefined") {
    const texture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return { texture, count: 1, cellWidth: 1, cellHeight: 1 };
  }
  const glyphs = Array.from(charset || " ");
  const cellWidth = 64;
  const cellHeight = 80;
  const padding = 8;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, glyphs.length * cellWidth);
  canvas.height = cellHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("AsciiShader: Canvas 2D is unavailable.");
  context.font = `${fontWeight} ${cellHeight - padding * 2}px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.clearRect(0, 0, canvas.width, canvas.height);

  const measured = glyphs.map((glyph, index) => {
    context.fillStyle = "white";
    context.fillText(glyph, index * cellWidth + cellWidth / 2, cellHeight / 2);
    const data = context.getImageData(index * cellWidth, 0, cellWidth, cellHeight).data;
    let density = 0;
    for (let i = 3; i < data.length; i += 4) density += data[i] / 255;
    return { glyph, index, density: density / (cellWidth * cellHeight) };
  });
  const ordered = sortByDensity ? [...measured].sort((a, b) => a.density - b.density || a.index - b.index) : measured;

  context.clearRect(0, 0, canvas.width, canvas.height);
  ordered.forEach(({ glyph }, index) => context.fillText(glyph, index * cellWidth + cellWidth / 2, cellHeight / 2));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return { texture, count: ordered.length, cellWidth, cellHeight };
}

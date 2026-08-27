// FILE: src/components/AsciiShader/presets.ts
import type { AsciiPreset, AsciiShaderProps, CharsetPreset, ResolvedAsciiOptions } from "./types";

export const CHARSETS: Record<CharsetPreset, string> = {
  classic: " .:-=+*#%@",
  dense: "  ·.:,;irsXA253hMHGS#9B&@",
  geometric: "  ·˙•◦○◌◇◆▪■□▰▲△✦✧✶✹",
  digital: "  .:+×*≡░▒▓█▄▀▌▐■",
  technical: "  .,:;+*xX#%&@/\\|[]{}<>",
  minimal: "  ·•+×■█",
};

export const ASCII_PRESETS: Record<AsciiPreset, Partial<ResolvedAsciiOptions>> = {
  clean: { charsetPreset: "dense", interaction: "none", noiseStrength: 0.004, sampleDistortion: 0.08, glyphDistortion: 0, grain: 0.008, ditherStrength: 0.12, glitch: 0 },
  magnetic: { charsetPreset: "geometric", interaction: "push", mouseStrength: 0.045, turbulenceAroundPointer: 0.4, ripple: true, rippleStrength: 0.018, noiseStrength: 0.012 },
  liquid: { charsetPreset: "dense", interaction: "attract", noiseScale: 2.6, noiseStrength: 0.025, sampleDistortion: 1.2, glyphDistortion: 0.35, noiseSpeed: 0.16, rippleStrength: 0.012 },
  terminal: { charsetPreset: "technical", contrast: 1.28, ditherMode: "bayer4", ditherStrength: 0.16, scanlines: 0.018, flicker: 0.025, grain: 0.018, glitch: 0.025, interaction: "none" },
  glitch: { charsetPreset: "digital", contrast: 1.2, grain: 0.035, scanlines: 0.012, chromaticAberration: 0.003, glitch: 0.12, interaction: "push", turbulenceAroundPointer: 0.25 },
};

export const DEFAULTS: Omit<ResolvedAsciiOptions, "src" | "charset" | "charsetPreset" | "preset"> = {
  sourceType: "image",
  autoSortCharset: true, glyphVariation: 0.06, fontFamily: "monospace", fontWeight: 600, cellSize: 8,
  brightness: 0, contrast: 1.12, gamma: 1, invert: false, ditherMode: "bayer4", ditherStrength: 0.22,
  interaction: "push", mouseRadius: 0.18, mouseStrength: 0.045, mouseSmoothing: 12, mouseVelocitySmoothing: 10,
  mouseVelocityDecay: 5, velocityMultiplier: 2.5, turbulenceAroundPointer: 0.4, noiseScale: 3, noiseStrength: 0.012,
  noiseSpeed: 0.1, noiseOctaves: 2, sampleDistortion: 0.6, glyphDistortion: 0.25, ripple: true,
  rippleStrength: 0.018, rippleFrequency: 35, rippleSpeed: 3, rippleDecay: 1.8, colorMode: "monochrome",
  foregroundColor: "#F4F1ED", backgroundColor: "#111111", duotoneDark: "#111111", duotoneLight: "#F4F1ED",
  grain: 0.025, scanlines: 0.008, vignette: 0.1, flicker: 0, chromaticAberration: 0, glitch: 0,
  opacity: 1, pointerTarget: "window", reducedMotion: "auto", maxDpr: 2, debug: false,
};

export function resolveOptions(props: AsciiShaderProps): ResolvedAsciiOptions {
  const { src, className: _className, style: _style, charset: explicitCharset, preset = "magnetic", charsetPreset: explicitCharsetPreset, ...explicit } = props;
  const presetValues = ASCII_PRESETS[preset];
  const defined = Object.fromEntries(Object.entries(explicit).filter(([, value]) => value !== undefined));
  const merged = { ...DEFAULTS, ...presetValues, ...defined } as Omit<ResolvedAsciiOptions, "src" | "charset" | "preset" | "charsetPreset">;
  const selectedCharsetPreset = (explicitCharsetPreset ?? presetValues.charsetPreset ?? "geometric") as CharsetPreset;
  return { ...merged, src, preset, charsetPreset: selectedCharsetPreset, charset: explicitCharset ?? CHARSETS[selectedCharsetPreset] } as ResolvedAsciiOptions;
}

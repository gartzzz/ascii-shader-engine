// FILE: src/components/AsciiShader/utils.ts
import * as THREE from "three";

export function colorToVector(hex: string): THREE.Vector3 {
  const color = new THREE.Color(hex);
  return new THREE.Vector3(color.r, color.g, color.b);
}

export function detectReducedMotion(value: boolean | "auto"): boolean {
  if (typeof value === "boolean") return value;
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

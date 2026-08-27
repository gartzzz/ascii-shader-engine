// FILE: src/components/AsciiShader/AsciiPlane.tsx
import { useEffect, useMemo, useRef, type MutableRefObject, type ReactElement } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createGlyphAtlas, type GlyphAtlas } from "./asciiAtlas";
import { fragmentShader, vertexShader } from "./shaders";
import { usePointerField } from "./usePointerField";
import type { DebugInfo, ResolvedAsciiOptions } from "./types";
import { colorToVector, detectReducedMotion } from "./utils";
import { useAsciiSource } from "./useAsciiSource";

const mode = (value: string): number => value === "bayer4" ? 1 : value === "noise" ? 2 : 0;
const interaction = (value: string): number => value === "push" ? 1 : value === "attract" ? 2 : 0;
const colorMode = (value: string): number => value === "source" ? 1 : value === "duotone" ? 2 : 0;

export function AsciiPlane({ options, debugRef }: { options: ResolvedAsciiOptions; debugRef: MutableRefObject<DebugInfo> }): ReactElement {
  const { gl, size } = useThree();
  const source = useAsciiSource(options.src, options.sourceType);
  const atlas = useMemo<GlyphAtlas>(() => createGlyphAtlas(options.charset, options.fontFamily, options.fontWeight, options.autoSortCharset), [options.charset, options.fontFamily, options.fontWeight, options.autoSortCharset]);
  const reducedMotion = useMemo(() => detectReducedMotion(options.reducedMotion), [options.reducedMotion]);
  const state = usePointerField(options.pointerTarget, options.mouseSmoothing, options.mouseVelocitySmoothing, options.mouseVelocityDecay, (x, y, speed) => { debugRef.current.mouseX = x; debugRef.current.mouseY = y; debugRef.current.mouseSpeed = speed; });
  const material = useMemo(() => {
    const foreground = colorToVector(options.foregroundColor); const background = colorToVector(options.backgroundColor); const dark = colorToVector(options.duotoneDark); const light = colorToVector(options.duotoneLight);
    return new THREE.ShaderMaterial({ vertexShader, fragmentShader, transparent: true, side: THREE.DoubleSide, depthWrite: false, uniforms: {
      uSource: { value: source.texture }, uAtlas: { value: atlas.texture }, uResolution: { value: new THREE.Vector2() }, uSourceSize: { value: new THREE.Vector2(1, 1) }, uCellSize: { value: options.cellSize }, uTime: { value: 0 }, uBrightness: { value: options.brightness }, uContrast: { value: options.contrast }, uGamma: { value: options.gamma }, uInvert: { value: options.invert ? 1 : 0 }, uDitherMode: { value: mode(options.ditherMode) }, uDitherStrength: { value: options.ditherStrength }, uGlyphCount: { value: atlas.count }, uGlyphVariation: { value: options.glyphVariation }, uInteraction: { value: interaction(options.interaction) }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uMouseVelocity: { value: new THREE.Vector2() }, uMouseSpeed: { value: 0 }, uMouseRadius: { value: options.mouseRadius }, uMouseStrength: { value: options.mouseStrength }, uVelocityMultiplier: { value: options.velocityMultiplier }, uTurbulence: { value: options.turbulenceAroundPointer }, uNoiseScale: { value: options.noiseScale }, uNoiseStrength: { value: options.noiseStrength }, uNoiseSpeed: { value: options.noiseSpeed }, uNoiseOctaves: { value: options.noiseOctaves }, uSampleDistortion: { value: options.sampleDistortion }, uGlyphDistortion: { value: options.glyphDistortion }, uRippleOrigin: { value: new THREE.Vector2() }, uRippleAge: { value: -1 }, uRippleStrength: { value: options.rippleStrength }, uRippleFrequency: { value: options.rippleFrequency }, uRippleSpeed: { value: options.rippleSpeed }, uRippleDecay: { value: options.rippleDecay }, uRippleEnabled: { value: options.ripple ? 1 : 0 }, uForeground: { value: foreground }, uBackground: { value: background }, uDuotoneDark: { value: dark }, uDuotoneLight: { value: light }, uColorMode: { value: colorMode(options.colorMode) }, uGrain: { value: options.grain }, uScanlines: { value: options.scanlines }, uVignette: { value: options.vignette }, uFlicker: { value: options.flicker }, uChromatic: { value: options.chromaticAberration }, uGlitch: { value: options.glitch }, uReducedMotion: { value: reducedMotion ? 1 : 0 }, uOpacity: { value: options.opacity },
    } });
  }, [atlas]);
  useEffect(() => () => atlas.texture.dispose(), [atlas]);
  useEffect(() => {
    material.uniforms.uForeground.value.copy(colorToVector(options.foregroundColor));
    material.uniforms.uBackground.value.copy(colorToVector(options.backgroundColor));
    material.uniforms.uDuotoneDark.value.copy(colorToVector(options.duotoneDark));
    material.uniforms.uDuotoneLight.value.copy(colorToVector(options.duotoneLight));
  }, [material, options.foregroundColor, options.backgroundColor, options.duotoneDark, options.duotoneLight]);
  const resolution = useRef(new THREE.Vector2());
  useFrame((_, delta) => {
    const uniforms = material.uniforms; const dt = Math.min(delta, 0.05); material.uniforms.uTime.value += dt;
    gl.getDrawingBufferSize(resolution.current); uniforms.uResolution.value.copy(resolution.current); uniforms.uSource.value = source.texture; uniforms.uSourceSize.value.set(source.width, source.height);
    uniforms.uCellSize.value = Math.max(2, options.cellSize * gl.getPixelRatio()); uniforms.uBrightness.value = options.brightness; uniforms.uContrast.value = options.contrast; uniforms.uGamma.value = options.gamma; uniforms.uInvert.value = options.invert ? 1 : 0; uniforms.uDitherMode.value = mode(options.ditherMode); uniforms.uDitherStrength.value = options.ditherStrength; uniforms.uGlyphVariation.value = options.glyphVariation; uniforms.uInteraction.value = interaction(options.interaction); uniforms.uMouseRadius.value = options.mouseRadius; uniforms.uMouseStrength.value = options.mouseStrength; uniforms.uVelocityMultiplier.value = options.velocityMultiplier; uniforms.uTurbulence.value = options.turbulenceAroundPointer; uniforms.uNoiseScale.value = options.noiseScale; uniforms.uNoiseStrength.value = options.noiseStrength; uniforms.uNoiseSpeed.value = options.noiseSpeed; uniforms.uNoiseOctaves.value = options.noiseOctaves; uniforms.uSampleDistortion.value = options.sampleDistortion; uniforms.uGlyphDistortion.value = options.glyphDistortion; uniforms.uRippleStrength.value = options.rippleStrength; uniforms.uRippleFrequency.value = options.rippleFrequency; uniforms.uRippleSpeed.value = options.rippleSpeed; uniforms.uRippleDecay.value = options.rippleDecay; uniforms.uRippleEnabled.value = options.ripple ? 1 : 0; uniforms.uColorMode.value = colorMode(options.colorMode); uniforms.uGrain.value = options.grain; uniforms.uScanlines.value = options.scanlines; uniforms.uVignette.value = options.vignette; uniforms.uFlicker.value = options.flicker; uniforms.uChromatic.value = options.chromaticAberration; uniforms.uGlitch.value = options.glitch; uniforms.uReducedMotion.value = reducedMotion ? 1 : 0; uniforms.uOpacity.value = options.opacity;
    uniforms.uMouse.value.set(state.current.smooth.x, state.current.smooth.y); uniforms.uMouseVelocity.value.set(state.current.smoothVelocity.x, state.current.smoothVelocity.y); uniforms.uMouseSpeed.value = state.current.speed; uniforms.uRippleOrigin.value.set(state.current.ripple.x, state.current.ripple.y); uniforms.uRippleAge.value = state.current.ripple.age;
    debugRef.current.cssWidth = size.width; debugRef.current.cssHeight = size.height; debugRef.current.framebufferWidth = resolution.current.x; debugRef.current.framebufferHeight = resolution.current.y; debugRef.current.dpr = gl.getPixelRatio(); debugRef.current.cols = Math.ceil(resolution.current.x / uniforms.uCellSize.value); debugRef.current.rows = Math.ceil(resolution.current.y / uniforms.uCellSize.value); debugRef.current.cellSize = options.cellSize; debugRef.current.sourceWidth = source.width; debugRef.current.sourceHeight = source.height; debugRef.current.fps = 1 / Math.max(dt, 0.001);
  });
  return <mesh frustumCulled={false} material={material}><planeGeometry args={[2, 2]} /></mesh>;
}

// FILE: src/components/AsciiShader/shaders.ts
export const vertexShader = `
precision highp float;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const fragmentShader = `
precision highp float;
uniform sampler2D uSource;
uniform sampler2D uAtlas;
uniform vec2 uResolution;
uniform vec2 uSourceSize;
uniform float uCellSize;
uniform float uTime;
uniform float uBrightness;
uniform float uContrast;
uniform float uGamma;
uniform float uInvert;
uniform float uDitherMode;
uniform float uDitherStrength;
uniform float uGlyphCount;
uniform float uGlyphVariation;
uniform float uInteraction;
uniform vec2 uMouse;
uniform vec2 uMouseVelocity;
uniform float uMouseSpeed;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uVelocityMultiplier;
uniform float uTurbulence;
uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform float uNoiseSpeed;
uniform float uNoiseOctaves;
uniform float uSampleDistortion;
uniform float uGlyphDistortion;
uniform vec2 uRippleOrigin;
uniform float uRippleAge;
uniform float uRippleStrength;
uniform float uRippleFrequency;
uniform float uRippleSpeed;
uniform float uRippleDecay;
uniform float uRippleEnabled;
uniform vec3 uForeground;
uniform vec3 uBackground;
uniform vec3 uDuotoneDark;
uniform vec3 uDuotoneLight;
uniform float uColorMode;
uniform float uGrain;
uniform float uScanlines;
uniform float uVignette;
uniform float uFlicker;
uniform float uChromatic;
uniform float uGlitch;
uniform float uReducedMotion;
uniform float uOpacity;
varying vec2 vUv;

float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash22(vec2 p) { return vec2(hash21(p), hash21(p + 17.17)); }
float noise2d(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + 1.0); return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
float fbm(vec2 p) { float value = 0.0, amp = 0.5; for (int i = 0; i < 4; i++) { if (float(i) >= uNoiseOctaves) break; value += amp * noise2d(p); p = p * 2.03 + 13.7; amp *= 0.5; } return value; }
vec2 coverUv(vec2 uv) {
  float screenAspect = uResolution.x / max(uResolution.y, 1.0);
  float textureAspect = uSourceSize.x / max(uSourceSize.y, 1.0);
  vec2 scale = textureAspect > screenAspect ? vec2(screenAspect / textureAspect, 1.0) : vec2(1.0, textureAspect / screenAspect);
  return (uv - 0.5) * scale + 0.5;
}
float bayer4(vec2 cell) {
  vec2 p = mod(cell, 4.0);
  float index = p.x + p.y * 4.0;
  if (index < 0.5) return 0.0; if (index < 1.5) return 8.0; if (index < 2.5) return 2.0; if (index < 3.5) return 10.0;
  if (index < 4.5) return 12.0; if (index < 5.5) return 4.0; if (index < 6.5) return 14.0; if (index < 7.5) return 6.0;
  if (index < 8.5) return 3.0; if (index < 9.5) return 11.0; if (index < 10.5) return 1.0; if (index < 11.5) return 9.0;
  if (index < 12.5) return 15.0; if (index < 13.5) return 7.0; if (index < 14.5) return 13.0; return 5.0;
}
vec2 pointerField(vec2 uv, vec2 cell) {
  vec2 delta = uv - uMouse; float dist = length(delta); float influence = 1.0 - smoothstep(0.0, max(uMouseRadius, 0.0001), dist);
  vec2 radial = delta / max(dist, 0.0001);
  vec2 flow = vec2(fbm(uv * 3.1 + vec2(7.0, 2.0)) - 0.5, fbm(uv * 3.1 + vec2(2.0, 9.0)) - 0.5);
  vec2 velocity = uMouseVelocity / max(uMouseSpeed, 0.001);
  float direction = uInteraction < 0.5 ? 0.0 : (uInteraction < 1.5 ? 1.0 : -1.0);
  float interactionActive = step(0.5, uInteraction);
  return (radial * direction + flow * uTurbulence * interactionActive + velocity * min(uMouseSpeed * uVelocityMultiplier, 1.0) * 0.35 * interactionActive) * influence * uMouseStrength * mix(1.0, 0.35, uReducedMotion);
}
float rippleField(vec2 uv) { if (uRippleEnabled < 0.5 || uRippleAge < 0.0) return 0.0; float d = distance(uv, uRippleOrigin); float wave = sin((d - uRippleAge * uRippleSpeed) * uRippleFrequency); return wave * exp(-uRippleAge * uRippleDecay * 2.0) * smoothstep(0.35, 0.0, abs(d - uRippleAge * uRippleSpeed)) * uRippleStrength * (1.0 - uReducedMotion); }
float glitchOffset(vec2 cell) { float block = floor(uTime * 3.0); float gate = step(1.0 - uGlitch, hash21(vec2(block, floor(cell.y / 5.0)))); return (hash21(vec2(cell.y, block)) - 0.5) * 0.035 * gate; }
vec3 sourceSample(vec2 uv) {
  if (uChromatic <= 0.0001) return texture2D(uSource, clamp(uv, 0.001, 0.999)).rgb;
  float offset = uChromatic * 0.004 * (1.0 - uReducedMotion); return vec3(texture2D(uSource, clamp(uv + vec2(offset, 0.0), 0.001, 0.999)).r, texture2D(uSource, clamp(uv, 0.001, 0.999)).g, texture2D(uSource, clamp(uv - vec2(offset, 0.0), 0.001, 0.999)).b);
}
vec3 postFx(vec3 color, vec2 uv, vec2 cell) {
  color += (hash21(cell + floor(uTime * 24.0)) - 0.5) * uGrain;
  color *= 1.0 - uScanlines * (0.5 + 0.5 * sin(uv.y * uResolution.y * 3.14159));
  float edge = smoothstep(0.82, 0.28, distance(uv, vec2(0.5))); color *= mix(1.0, edge, uVignette);
  color *= 1.0 + (hash21(vec2(floor(uTime * 8.0), 4.0)) - 0.5) * uFlicker;
  return clamp(color, 0.0, 1.0);
}
void main() {
  vec2 screenUV = vUv; vec2 gridSize = max(uResolution / max(uCellSize, 1.0), vec2(1.0)); vec2 gridCoord = floor(screenUV * gridSize); vec2 cellUV = fract(screenUV * gridSize);
  vec2 field = pointerField(screenUV, gridCoord); float energy = clamp(uMouseSpeed * uVelocityMultiplier, 0.0, 1.5);
  float ripple = rippleField(screenUV); vec2 distortedCell = cellUV + field * uGlyphDistortion * 2.0 + vec2(ripple, ripple * 0.6);
  vec2 sourceUV = coverUv(screenUV + field * uSampleDistortion + vec2(ripple));
  float idle = 1.0 - uReducedMotion; sourceUV += (vec2(fbm(screenUV * uNoiseScale + uTime * uNoiseSpeed), fbm(screenUV * uNoiseScale + 8.0 + uTime * uNoiseSpeed)) - 0.5) * uNoiseStrength * idle;
  sourceUV.x += glitchOffset(gridCoord) * idle;
  vec3 sourceColor = sourceSample(sourceUV); float luma = dot(sourceColor, vec3(0.2126, 0.7152, 0.0722));
  luma = (luma - 0.5) * uContrast + 0.5 + uBrightness; if (uInvert > 0.5) luma = 1.0 - luma; luma = pow(clamp(luma, 0.0, 1.0), max(uGamma, 0.05));
  float dither = 0.0; if (uDitherMode > 0.5 && uDitherMode < 1.5) dither = (bayer4(gridCoord) / 16.0 - 0.5) * uDitherStrength; else if (uDitherMode > 1.5) dither = (hash21(gridCoord) - 0.5) * uDitherStrength;
  float value = clamp(luma + dither, 0.0, 1.0); float baseIndex = floor(value * max(uGlyphCount - 1.0, 0.0) + 0.5);
  float variation = step(hash21(gridCoord + 4.0), uGlyphVariation) * (hash21(gridCoord + 9.0) < 0.5 ? -1.0 : 1.0);
  float glyphIndex = clamp(baseIndex + variation, 0.0, max(uGlyphCount - 1.0, 0.0));
  vec2 atlasUV = vec2((glyphIndex + clamp(distortedCell.x, 0.02, 0.98)) / max(uGlyphCount, 1.0), clamp(distortedCell.y, 0.01, 0.99));
  float glyph = texture2D(uAtlas, atlasUV).a; vec3 color = uBackground;
  if (uColorMode < 0.5) color = mix(uBackground, uForeground, glyph); else if (uColorMode < 1.5) color = mix(uBackground, sourceColor, glyph); else color = mix(uBackground, mix(uDuotoneDark, uDuotoneLight, luma), glyph);
  color = postFx(color, screenUV, gridCoord); gl_FragColor = vec4(color, (1.0 - energy * 0.03) * uOpacity);
}
`;

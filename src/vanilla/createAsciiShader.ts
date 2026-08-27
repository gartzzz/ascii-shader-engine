// FILE: src/vanilla/createAsciiShader.ts
import { resolveOptions } from "../components/AsciiShader/presets";
import { fragmentShader } from "../components/AsciiShader/shaders";
import type { AsciiShaderProps } from "../components/AsciiShader/types";
import { clamp, detectReducedMotion, hexToRgb } from "./utils";

const vanillaVertexShader = `attribute vec2 position; varying vec2 vUv; void main(){vUv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}`;

export type VanillaAsciiOptions = AsciiShaderProps & {
  target?: HTMLElement | HTMLCanvasElement | string;
};

export type AsciiController = {
  update: (patch: Partial<AsciiShaderProps>) => void;
  destroy: () => void;
  pause: () => void;
  resume: () => void;
  canvas: HTMLCanvasElement;
};

function resolveTarget(target: VanillaAsciiOptions["target"]): HTMLElement {
  if (!target) return document.body;
  if (typeof target === "string") {
    const el = document.querySelector(target) as HTMLElement | null;
    if (!el) throw new Error(`[ascii-shader] target selector "${target}" not found`);
    return el;
  }
  if (target instanceof HTMLCanvasElement) return target.parentElement ?? document.body;
  return target;
}

function createAtlasTexture(gl: WebGLRenderingContext, charset: string, fontFamily: string, fontWeight: string | number, autoSort: boolean): { texture: WebGLTexture; count: number } {
  const glyphs = Array.from(charset || " ");
  const cellW = 64;
  const cellH = 80;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, glyphs.length * cellW);
  canvas.height = cellH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.font = `${fontWeight} ${cellH - 16}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const measured = glyphs.map((g, i) => {
    ctx.clearRect(i * cellW, 0, cellW, cellH);
    ctx.fillStyle = "#fff";
    ctx.fillText(g, i * cellW + cellW / 2, cellH / 2);
    const data = ctx.getImageData(i * cellW, 0, cellW, cellH).data;
    let d = 0;
    for (let p = 3; p < data.length; p += 4) d += data[p] / 255;
    return { g, i, d: d / (cellW * cellH) };
  });
  const ordered = autoSort ? [...measured].sort((a, b) => a.d - b.d || a.i - b.i) : measured;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ordered.forEach(({ g }, idx) => ctx.fillText(g, idx * cellW + cellW / 2, cellH / 2));
  const tex = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return { texture: tex, count: ordered.length };
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader compile failed");
  return s;
}

export function createAsciiShader(options: VanillaAsciiOptions): AsciiController {
  const initialProps: AsciiShaderProps = { ...options };
  let resolved = resolveOptions(initialProps);
  const container = (() => {
    if (typeof options.target === "string") return resolveTarget(options.target);
    if (options.target instanceof HTMLCanvasElement) return options.target.parentElement ?? document.body;
    if (options.target instanceof HTMLElement) return options.target;
    return resolveTarget(undefined);
  })();
  const isCanvasTarget = options.target instanceof HTMLCanvasElement;
  const canvas = isCanvasTarget ? (options.target as HTMLCanvasElement) : document.createElement("canvas");
  if (!isCanvasTarget) {
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    if (getComputedStyle(container).position === "static") container.style.position = "relative";
    container.appendChild(canvas);
    if (!container.style.overflow) container.style.overflow = "hidden";
  }
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "high-performance" }) as WebGLRenderingContext | null;
  if (!gl) {
    const fallback = document.createElement("img");
    fallback.src = resolved.src;
    fallback.style.width = "100%";
    fallback.style.height = "100%";
    fallback.style.objectFit = "cover";
    container.appendChild(fallback);
    return { canvas, update: () => {}, destroy: () => fallback.remove(), pause: () => {}, resume: () => {} };
  }

  const vs = compile(gl, gl.VERTEX_SHADER, vanillaVertexShader);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "link failed");
  gl.useProgram(program);

  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  let atlas = createAtlasTexture(gl, resolved.charset, resolved.fontFamily, resolved.fontWeight, resolved.autoSortCharset);
  let sourceTex = gl.createTexture()!;
  let sourceW = 1, sourceH = 1;
  let videoEl: HTMLVideoElement | null = null;
  const loadSource = (src: string, type: string) => {
    if (type === "video") {
      if (videoEl) { videoEl.pause(); videoEl.remove(); }
      videoEl = document.createElement("video");
      videoEl.autoplay = true; videoEl.muted = true; videoEl.loop = true; videoEl.playsInline = true; videoEl.crossOrigin = "anonymous";
      videoEl.addEventListener("loadedmetadata", () => { sourceW = videoEl!.videoWidth || 1; sourceH = videoEl!.videoHeight || 1; });
      videoEl.src = src;
      videoEl.load();
      void videoEl.play().catch(() => {});
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      sourceW = (img as HTMLImageElement).naturalWidth || 1;
      sourceH = (img as HTMLImageElement).naturalHeight || 1;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sourceTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    img.onerror = () => console.warn(`[ascii-shader] failed to load ${src}`);
    img.src = src;
  };
  // placeholder 1x1
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, sourceTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // placeholder will be overwritten on first image load; keep 1x1 fallback via empty texture
  loadSource(resolved.src, resolved.sourceType);

  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  ["uSource","uAtlas","uResolution","uSourceSize","uCellSize","uTime","uBrightness","uContrast","uGamma","uInvert","uDitherMode","uDitherStrength","uGlyphCount","uGlyphVariation","uInteraction","uMouse","uMouseVelocity","uMouseSpeed","uMouseRadius","uMouseStrength","uVelocityMultiplier","uTurbulence","uNoiseScale","uNoiseStrength","uNoiseSpeed","uNoiseOctaves","uSampleDistortion","uGlyphDistortion","uRippleOrigin","uRippleAge","uRippleStrength","uRippleFrequency","uRippleSpeed","uRippleDecay","uRippleEnabled","uForeground","uBackground","uDuotoneDark","uDuotoneLight","uColorMode","uGrain","uScanlines","uVignette","uFlicker","uChromatic","uGlitch","uReducedMotion","uOpacity"].forEach(n => uniforms[n] = gl.getUniformLocation(program, n));
  const mode = (v: string) => v === "bayer4" ? 1 : v === "noise" ? 2 : 0;
  const interaction = (v: string) => v === "push" ? 1 : v === "attract" ? 2 : 0;
  const colorMode = (v: string) => v === "source" ? 1 : v === "duotone" ? 2 : 0;
  const setF = (name: string, value: number) => { const l = uniforms[name]; if (l) gl.uniform1f(l, value); };
  const set2 = (name: string, x: number, y: number) => { const l = uniforms[name]; if (l) gl.uniform2f(l, x, y); };
  const set3 = (name: string, r: number, g: number, b: number) => { const l = uniforms[name]; if (l) gl.uniform3f(l, r, g, b); };

  gl.uniform1i(uniforms.uSource, 0);
  gl.uniform1i(uniforms.uAtlas, 1);

  let mouse = { x: 0.5, y: 0.5 };
  let target = { x: 0.5, y: 0.5 };
  let smooth = { x: 0.5, y: 0.5 };
  let prev = { x: 0.5, y: 0.5 };
  let vel = { x: 0, y: 0 };
  let smoothVel = { x: 0, y: 0 };
  let speed = 0;
  let ripple = { x: 0.5, y: 0.5, age: -1 };
  let time = 0;
  let last = performance.now();
  let running = true;
  let raf = 0;
  let destroyed = false;

  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    target.x = clamp((e.clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
    target.y = clamp(1 - (e.clientY - rect.top) / Math.max(rect.height, 1), 0, 1);
  };
  const onDown = (e: PointerEvent) => { onMove(e); ripple.x = target.x; ripple.y = target.y; ripple.age = 0; };
  const listenTarget: Window | HTMLCanvasElement = resolved.pointerTarget === "window" ? window : canvas;
  listenTarget.addEventListener("pointermove", onMove as EventListener);
  listenTarget.addEventListener("pointerdown", onDown as EventListener);

  const ro = new ResizeObserver(() => {});
  // DPR + size handling in frame
  const io = new IntersectionObserver((entries) => { running = entries[0]?.isIntersecting ?? true; if (running) last = performance.now(); }, { threshold: 0 });
  io.observe(canvas);
  const onVisibility = () => { running = document.visibilityState === "visible"; if (running) last = performance.now(); };
  document.addEventListener("visibilitychange", onVisibility);

  function applyUniforms() {
    const reduced = detectReducedMotion(resolved.reducedMotion) ? 1 : 0;
    setF("uCellSize", Math.max(2, resolved.cellSize * Math.min(window.devicePixelRatio || 1, resolved.maxDpr)));
    setF("uBrightness", resolved.brightness);
    setF("uContrast", resolved.contrast);
    setF("uGamma", resolved.gamma);
    setF("uInvert", resolved.invert ? 1 : 0);
    setF("uDitherMode", mode(resolved.ditherMode));
    setF("uDitherStrength", resolved.ditherStrength);
    setF("uGlyphCount", atlas.count);
    setF("uGlyphVariation", resolved.glyphVariation);
    setF("uInteraction", interaction(resolved.interaction));
    setF("uMouseRadius", resolved.mouseRadius);
    setF("uMouseStrength", resolved.mouseStrength);
    setF("uVelocityMultiplier", resolved.velocityMultiplier);
    setF("uTurbulence", resolved.turbulenceAroundPointer);
    setF("uNoiseScale", resolved.noiseScale);
    setF("uNoiseStrength", resolved.noiseStrength);
    setF("uNoiseSpeed", resolved.noiseSpeed);
    setF("uNoiseOctaves", resolved.noiseOctaves);
    setF("uSampleDistortion", resolved.sampleDistortion);
    setF("uGlyphDistortion", resolved.glyphDistortion);
    setF("uRippleStrength", resolved.rippleStrength);
    setF("uRippleFrequency", resolved.rippleFrequency);
    setF("uRippleSpeed", resolved.rippleSpeed);
    setF("uRippleDecay", resolved.rippleDecay);
    setF("uRippleEnabled", resolved.ripple ? 1 : 0);
    setF("uColorMode", colorMode(resolved.colorMode));
    setF("uGrain", resolved.grain);
    setF("uScanlines", resolved.scanlines);
    setF("uVignette", resolved.vignette);
    setF("uFlicker", resolved.flicker);
    setF("uChromatic", resolved.chromaticAberration);
    setF("uGlitch", resolved.glitch);
    setF("uReducedMotion", reduced);
    setF("uOpacity", resolved.opacity);
    const fg = hexToRgb(resolved.foregroundColor); set3("uForeground", fg[0], fg[1], fg[2]);
    const bg = hexToRgb(resolved.backgroundColor); set3("uBackground", bg[0], bg[1], bg[2]);
    const dk = hexToRgb(resolved.duotoneDark); set3("uDuotoneDark", dk[0], dk[1], dk[2]);
    const lt = hexToRgb(resolved.duotoneLight); set3("uDuotoneLight", lt[0], lt[1], lt[2]);
  }
  applyUniforms();

  const frame = (now: number) => {
    if (destroyed) return;
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05); last = now; time += dt;
    const tPos = 1 - Math.exp(-resolved.mouseSmoothing * dt);
    const tVel = 1 - Math.exp(-resolved.mouseVelocitySmoothing * dt);
    smooth.x += (target.x - smooth.x) * tPos;
    smooth.y += (target.y - smooth.y) * tPos;
    vel.x = (smooth.x - prev.x) / Math.max(dt, 0.001);
    vel.y = (smooth.y - prev.y) / Math.max(dt, 0.001);
    prev.x = smooth.x; prev.y = smooth.y;
    smoothVel.x += (vel.x - smoothVel.x) * tVel;
    smoothVel.y += (vel.y - smoothVel.y) * tVel;
    speed = Math.min(2, Math.hypot(smoothVel.x, smoothVel.y)) * Math.exp(-resolved.mouseVelocityDecay * dt * 0.1);
    ripple.age += dt;

    const dpr = Math.min(window.devicePixelRatio || 1, resolved.maxDpr);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sourceTex);
    if (videoEl && videoEl.readyState >= 2) {
      sourceW = videoEl.videoWidth || sourceW;
      sourceH = videoEl.videoHeight || sourceH;
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoEl);
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, atlas.texture);

    set2("uResolution", canvas.width, canvas.height);
    set2("uSourceSize", sourceW, sourceH);
    setF("uTime", time);
    set2("uMouse", smooth.x, smooth.y);
    set2("uMouseVelocity", smoothVel.x, smoothVel.y);
    setF("uMouseSpeed", speed);
    set2("uRippleOrigin", ripple.x, ripple.y);
    setF("uRippleAge", ripple.age);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  raf = requestAnimationFrame(frame);

  return {
    canvas,
    update(patch: Partial<AsciiShaderProps>) {
      const nextProps = { ...resolved, ...patch, src: patch.src ?? resolved.src } as AsciiShaderProps;
      const next = resolveOptions(nextProps);
      const charsetChanged = next.charset !== resolved.charset || next.fontFamily !== resolved.fontFamily || String(next.fontWeight) !== String(resolved.fontWeight) || next.autoSortCharset !== resolved.autoSortCharset;
      resolved = next;
      if (patch.src && patch.src !== sourceTex) loadSource(next.src, next.sourceType);
      if (charsetChanged) {
        gl.deleteTexture(atlas.texture);
        atlas = createAtlasTexture(gl, resolved.charset, resolved.fontFamily, resolved.fontWeight, resolved.autoSortCharset);
      }
      applyUniforms();
    },
    pause() { running = false; },
    resume() { running = true; last = performance.now(); },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      listenTarget.removeEventListener("pointermove", onMove as EventListener);
      listenTarget.removeEventListener("pointerdown", onDown as EventListener);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      ro.disconnect();
      if (videoEl) { videoEl.pause(); videoEl.remove(); }
      gl.deleteTexture(sourceTex);
      gl.deleteTexture(atlas.texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!isCanvasTarget) canvas.remove();
    },
  };
}

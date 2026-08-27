# Interactive ASCII Shader Engine

GPU-rendered ASCII / glyph field. React version uses Three + R3F; vanilla version is pure WebGL (no dependencies) and works everywhere.

## Plug & play — 10 seconds (no build, no npm)

```html
<div data-ascii-shader data-src="/hero.jpg" data-preset="magnetic" style="width:100%;height:100vh"></div>
<script src="https://cdn.jsdelivr.net/npm/ascii-shader-engine/dist/ascii-shader.umd.js"></script>
<!-- auto-inits every [data-ascii-shader] -->
```

Vanilla programmatic:

```js
import { createAsciiShader } from "ascii-shader-engine/vanilla";
const ctrl = createAsciiShader({ target: "#hero", src: "/hero.jpg", preset: "magnetic" });
ctrl.update({ preset: "liquid" }); // live
ctrl.destroy(); // cleanup
```

## React / Next / Astro

```bash
npm install ascii-shader-engine three @react-three/fiber
```

```tsx
import { AsciiShader } from "ascii-shader-engine/react"; // or "./components/AsciiShader"
<AsciiShader src="/hero.jpg" />
```

## Fullscreen hero

```tsx
<section style={{ position: "relative", minHeight: "100vh", overflow: "hidden", background: "#111" }}>
  <AsciiShader src="/hero.jpg" preset="magnetic" charsetPreset="geometric" className="hero-shader" />
  <div style={{ position: "relative", zIndex: 1, color: "white" }}>HTML content remains clickable above the shader.</div>
</section>
```

## Video and custom charset

```tsx
<AsciiShader src="/hero.mp4" sourceType="video" preset="liquid" />
<AsciiShader src="/hero.jpg" charset="  ·˙•◦○◇◆▪■□▰▲△✦" autoSortCharset />
```

For Next.js, render this component from a Client Component (`"use client"`) because R3F requires a browser canvas. Remote images and video must send appropriate CORS headers; the browser cannot bypass that policy.

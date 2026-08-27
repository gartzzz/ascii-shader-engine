# Interactive ASCII Shader Engine

GPU-rendered ASCII and Unicode glyph field for React, Three.js and React Three Fiber. The source is sampled with cover semantics, converted to luminance in GLSL, and rendered through a single fullscreen quad and a Canvas 2D glyph atlas.

## Install

```bash
npm install three @react-three/fiber
npm install -D @types/three
```

## Minimal usage

```tsx
import { AsciiShader } from "./components/AsciiShader";

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

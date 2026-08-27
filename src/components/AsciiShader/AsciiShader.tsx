// FILE: src/components/AsciiShader/AsciiShader.tsx
import { Canvas } from "@react-three/fiber";
import { useMemo, useRef, type ReactElement } from "react";
import { AsciiDebug } from "./AsciiDebug";
import { AsciiPlane } from "./AsciiPlane";
import { resolveOptions } from "./presets";
import type { AsciiShaderProps, DebugInfo } from "./types";

export function AsciiShader(props: AsciiShaderProps): ReactElement {
  const options = useMemo(() => resolveOptions(props), [props]);
  const debugRef = useRef<DebugInfo>({ fps: 0, cssWidth: 0, cssHeight: 0, framebufferWidth: 0, framebufferHeight: 0, dpr: 1, cols: 0, rows: 0, cellSize: options.cellSize, mouseX: 0.5, mouseY: 0.5, mouseSpeed: 0, preset: options.preset, charsetLength: Array.from(options.charset).length, sourceWidth: 1, sourceHeight: 1 });
  const readDebug = useMemo(() => () => ({ ...debugRef.current }), []);
  return <div className={props.className} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...props.style }}><Canvas dpr={[1, options.maxDpr]} orthographic camera={{ position: [0, 0, 1], zoom: 1 }} gl={{ antialias: false, alpha: true }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: options.pointerTarget === "window" ? "none" : "auto" }}><AsciiPlane options={options} debugRef={debugRef} /></Canvas>{options.debug && <AsciiDebug read={readDebug} />}</div>;
}

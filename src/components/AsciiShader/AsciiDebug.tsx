// FILE: src/components/AsciiShader/AsciiDebug.tsx
import { useEffect, useState, type ReactElement } from "react";
import type { DebugInfo } from "./types";

export function AsciiDebug({ read }: { read: () => DebugInfo }): ReactElement {
  const [info, setInfo] = useState<DebugInfo>(() => read());
  useEffect(() => { const timer = window.setInterval(() => setInfo(read()), 200); return () => window.clearInterval(timer); }, [read]);
  return <pre style={{ position: "absolute", left: 12, bottom: 12, zIndex: 2, margin: 0, padding: "8px 10px", color: "#f4f1ed", background: "rgba(0,0,0,.72)", font: "11px/1.4 monospace", pointerEvents: "none" }}>{`FPS ${info.fps.toFixed(0)} | CSS ${info.cssWidth}x${info.cssHeight} | FB ${info.framebufferWidth}x${info.framebufferHeight}\nDPR ${info.dpr.toFixed(2)} | GRID ${info.cols}x${info.rows} | CELL ${info.cellSize.toFixed(1)}\nMOUSE ${info.mouseX.toFixed(3)},${info.mouseY.toFixed(3)} | SPEED ${info.mouseSpeed.toFixed(3)}\nPRESET ${info.preset} | GLYPHS ${info.charsetLength} | SOURCE ${info.sourceWidth}x${info.sourceHeight}`}</pre>;
}

// FILE: src/main.tsx
import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AsciiShader } from "./components/AsciiShader";
import { fragmentShader } from "./components/AsciiShader/shaders";
import { buildStandaloneHtml, sourceAsDataUrl } from "./components/AsciiShader/standalone";
import "./styles.css";

function App() {
  const [source, setSource] = useState("/demo.svg");
  const [preset, setPreset] = useState<"clean" | "magnetic" | "liquid" | "terminal" | "glitch">("magnetic");
  const [charsetPreset, setCharsetPreset] = useState<"classic" | "dense" | "geometric" | "digital" | "technical" | "minimal">("geometric");
  const [interaction, setInteraction] = useState<"none" | "push" | "attract">("push");
  const [cellSize, setCellSize] = useState(8);
  const [format, setFormat] = useState<"fullscreen" | "landscape" | "portrait" | "square" | "story">("fullscreen");
  const [colorMode, setColorMode] = useState<"monochrome" | "source" | "duotone">("monochrome");
  const [foregroundColor, setForegroundColor] = useState("#F4F1ED");
  const [backgroundColor, setBackgroundColor] = useState("#111111");
  const [duotoneDark, setDuotoneDark] = useState("#111111");
  const [duotoneLight, setDuotoneLight] = useState("#F4F1ED");
  const [debug, setDebug] = useState(false);
  const [exported, setExported] = useState("");
  const snippet = useMemo(() => `<AsciiShader\n  src="/your-image.jpg"\n  preset="${preset}"\n  charsetPreset="${charsetPreset}"\n  interaction="${interaction}"\n  cellSize={${cellSize}}\n  colorMode="${colorMode}"\n  foregroundColor="${foregroundColor}"\n  backgroundColor="${backgroundColor}"\n  className="format-${format}"\n/>`, [preset, charsetPreset, interaction, cellSize, colorMode, foregroundColor, backgroundColor, format]);
  const loadFile = (file?: File) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/") || /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name);
    if (!isImage) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setSource(reader.result); };
    reader.readAsDataURL(file);
  };
  const exportSnippet = async () => { setExported(snippet); try { await navigator.clipboard.writeText(snippet); } catch { /* Clipboard permissions are optional. */ } };
  const exportShader = () => { const blob = new Blob([fragmentShader], { type: "text/plain" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "ascii-shader.frag"; link.click(); URL.revokeObjectURL(url); };
  const exportStandalone = async () => { try { const html = buildStandaloneHtml(await sourceAsDataUrl(source)); const blob = new Blob([html], { type: "text/html" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "ascii-shader-standalone.html"; link.click(); URL.revokeObjectURL(url); } catch { window.alert("No se pudo incrustar la imagen actual. Usa una imagen local o permite CORS."); } };
  return (
    <main className={`demo-shell format-${format}`}>
      <AsciiShader
        src={source}
        preset={preset}
        charsetPreset={charsetPreset}
        interaction={interaction}
        cellSize={cellSize}
        colorMode={colorMode}
        foregroundColor={foregroundColor}
        backgroundColor={backgroundColor}
        duotoneDark={duotoneDark}
        duotoneLight={duotoneLight}
        debug={debug}
        className="shader-layer"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div className="content-layer">
        <p className="eyebrow">GPU / GLYPH FIELD / 001</p>
        <h1>Signal<br /><em>in motion.</em></h1>
        <p className="description">Move across the canvas. Click to send a ripple through the grid.</p>
        <span className="status"><i /> WebGL realtime</span>
      </div>
      <aside className="control-panel">
        <label className="upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); loadFile(event.dataTransfer.files[0]); }}>
          <input type="file" accept="image/*" onChange={(event) => loadFile(event.target.files?.[0])} />
          <strong>Drop image here</strong><span>or choose a local file</span>
        </label>
        <div className="control-grid">
          <label>Preset<select value={preset} onChange={(event) => setPreset(event.target.value as typeof preset)}>{["clean", "magnetic", "liquid", "terminal", "glitch"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Charset<select value={charsetPreset} onChange={(event) => setCharsetPreset(event.target.value as typeof charsetPreset)}>{["classic", "dense", "geometric", "digital", "technical", "minimal"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Field<select value={interaction} onChange={(event) => setInteraction(event.target.value as typeof interaction)}><option>none</option><option>push</option><option>attract</option></select></label>
          <label>Cell size <output>{cellSize}px</output><input type="range" min="4" max="20" value={cellSize} onChange={(event) => setCellSize(Number(event.target.value))} /></label>
          <label>Format<select value={format} onChange={(event) => setFormat(event.target.value as typeof format)}><option value="fullscreen">fullscreen</option><option value="landscape">16:9 landscape</option><option value="portrait">4:5 portrait</option><option value="square">1:1 square</option><option value="story">9:16 story</option></select></label>
        </div>
        <div className="color-controls"><label>Color mode<select value={colorMode} onChange={(event) => setColorMode(event.target.value as typeof colorMode)}><option>monochrome</option><option>source</option><option>duotone</option></select></label><label>Foreground<input type="color" value={foregroundColor} onChange={(event) => setForegroundColor(event.target.value)} /></label><label>Background<input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} /></label>{colorMode === "duotone" && <><label>Dark tone<input type="color" value={duotoneDark} onChange={(event) => setDuotoneDark(event.target.value)} /></label><label>Light tone<input type="color" value={duotoneLight} onChange={(event) => setDuotoneLight(event.target.value)} /></label></>}</div>
        <div className="panel-actions"><button type="button" onClick={() => setDebug((value) => !value)}>Debug {debug ? "on" : "off"}</button><button type="button" onClick={exportShader}>Download GLSL</button><button type="button" onClick={exportStandalone}>Standalone HTML</button><button type="button" className="primary" onClick={exportSnippet}>Copy JSX</button></div>
        {exported && <textarea className="export-box" readOnly value={exported} onFocus={(event) => event.currentTarget.select()} aria-label="Exported JSX" />}
      </aside>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);

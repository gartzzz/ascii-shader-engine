// FILE: src/components/AsciiShader/standalone.ts
import { fragmentShader } from "./shaders";
import type { ResolvedAsciiOptions } from "./types";

export async function sourceAsDataUrl(source: string): Promise<string> {
  if (source.startsWith("data:")) return source;
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Unable to embed source: ${response.status}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function buildStandaloneHtml(sourceDataUrl: string, options: ResolvedAsciiOptions): string {
  const safeSource = JSON.stringify(sourceDataUrl);
  const safeVertex = JSON.stringify(`attribute vec2 position; varying vec2 vUv; void main(){vUv=position*.5+.5;gl_Position=vec4(position,0.0,1.0);}`);
  const safeFragment = JSON.stringify(fragmentShader);
  const safeOptions = JSON.stringify({
    charset: options.charset,
    fontFamily: options.fontFamily,
    fontWeight: options.fontWeight,
    autoSortCharset: options.autoSortCharset,
    cellSize: options.cellSize,
    brightness: options.brightness,
    contrast: options.contrast,
    gamma: options.gamma,
    invert: options.invert,
    ditherMode: options.ditherMode,
    ditherStrength: options.ditherStrength,
    glyphVariation: options.glyphVariation,
    interaction: options.interaction,
    mouseRadius: options.mouseRadius,
    mouseStrength: options.mouseStrength,
    velocityMultiplier: options.velocityMultiplier,
    turbulenceAroundPointer: options.turbulenceAroundPointer,
    noiseScale: options.noiseScale,
    noiseStrength: options.noiseStrength,
    noiseSpeed: options.noiseSpeed,
    noiseOctaves: options.noiseOctaves,
    sampleDistortion: options.sampleDistortion,
    glyphDistortion: options.glyphDistortion,
    ripple: options.ripple,
    rippleStrength: options.rippleStrength,
    rippleFrequency: options.rippleFrequency,
    rippleSpeed: options.rippleSpeed,
    rippleDecay: options.rippleDecay,
    colorMode: options.colorMode,
    foregroundColor: options.foregroundColor,
    backgroundColor: options.backgroundColor,
    duotoneDark: options.duotoneDark,
    duotoneLight: options.duotoneLight,
    grain: options.grain,
    scanlines: options.scanlines,
    vignette: options.vignette,
    flicker: options.flicker,
    chromaticAberration: options.chromaticAberration,
    glitch: options.glitch,
    opacity: options.opacity,
    maxDpr: options.maxDpr,
  });
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ASCII Shader — plug and play</title>
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#111}canvas{display:block;width:100%;height:100%}.fallback{position:fixed;inset:0;display:grid;place-items:center;padding:24px;text-align:center;color:#f4f1ed;background:#111;font:12px monospace}</style></head>
<body><canvas id="ascii-canvas"></canvas><div id="fallback" class="fallback" hidden>WebGL is unavailable in this browser.</div><script>
(() => {
const SOURCE=${safeSource}, VERTEX=${safeVertex}, FRAGMENT=${safeFragment}, OPTS=${safeOptions};
const canvas=document.getElementById('ascii-canvas'), fallback=document.getElementById('fallback');
const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'high-performance'});
if(!gl){fallback.hidden=false;return;}
const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader)||'Shader compilation failed');return shader};
try{
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,VERTEX));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FRAGMENT));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'Program link failed');gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const charset=Array.from(OPTS.charset), atlas=document.createElement('canvas'),ctx=atlas.getContext('2d');atlas.width=Math.max(1,charset.length*64);atlas.height=80;ctx.font=OPTS.fontWeight+' '+(80-16)+'px '+OPTS.fontFamily;ctx.textAlign='center';ctx.textBaseline='middle';
 const measured=charset.map((g,i)=>{ctx.clearRect(i*64,0,64,80);ctx.fillStyle='#fff';ctx.fillText(g,i*64+32,40);const d=ctx.getImageData(i*64,0,64,80).data;let s=0;for(let p=3;p<d.length;p+=4)s+=d[p]/255;return{g,i,d:s/(64*80)}});
 const ordered=OPTS.autoSortCharset?measured.slice().sort((a,b)=>a.d-b.d||a.i-b.i):measured;ctx.clearRect(0,0,atlas.width,atlas.height);ctx.fillStyle='#fff';ordered.forEach((o,i)=>ctx.fillText(o.g,i*64+32,40));
 const atlasTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,atlasTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const image=new Image();image.onload=()=>{const sourceTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,sourceTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);start(sourceTexture,image.naturalWidth,image.naturalHeight)};image.onerror=()=>{fallback.hidden=false;fallback.textContent='Embedded image could not be decoded.'};image.src=SOURCE;
 const names=['uSource','uAtlas','uResolution','uSourceSize','uCellSize','uTime','uBrightness','uContrast','uGamma','uInvert','uDitherMode','uDitherStrength','uGlyphCount','uGlyphVariation','uInteraction','uMouse','uMouseVelocity','uMouseSpeed','uMouseRadius','uMouseStrength','uVelocityMultiplier','uTurbulence','uNoiseScale','uNoiseStrength','uNoiseSpeed','uNoiseOctaves','uSampleDistortion','uGlyphDistortion','uRippleOrigin','uRippleAge','uRippleStrength','uRippleFrequency','uRippleSpeed','uRippleDecay','uRippleEnabled','uForeground','uBackground','uDuotoneDark','uDuotoneLight','uColorMode','uGrain','uScanlines','uVignette','uFlicker','uChromatic','uGlitch','uReducedMotion','uOpacity'];const U=Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(program,n)]));
 const ditherMode=v=>v==="bayer4"?1:v==="noise"?2:0, interaction=v=>v==="push"?1:v==="attract"?2:0, colorMode=v=>v==="source"?1:v==="duotone"?2:0, toRgb=h=>{const c=h.replace('#',''),f=c.length===3?c.split('').map(x=>x+x).join(''):c,n=parseInt(f,16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}, set=(n,v)=>{const l=U[n];if(!l)return;if(Array.isArray(v)){if(v.length===2)gl.uniform2f(l,v[0],v[1]);else if(v.length===3)gl.uniform3f(l,v[0],v[1],v[2])}else if(typeof v==='number')gl.uniform1f(l,v)};
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?1:0;
 let mouse=[.5,.5],previous=[.5,.5],velocity=[0,0],ripple=[0,0,-1],time=0,last=performance.now(),running=true;
 const pointer=e=>{const r=canvas.getBoundingClientRect();mouse=[Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(r.width,1))),Math.max(0,Math.min(1,1-(e.clientY-r.top)/Math.max(r.height,1)))]};canvas.addEventListener('pointermove',pointer);canvas.addEventListener('pointerdown',e=>{pointer(e);ripple=[mouse[0],mouse[1],0]});
 const resize=()=>{const d=Math.min(devicePixelRatio||1,OPTS.maxDpr),w=Math.max(1,Math.floor(innerWidth*d)),h=Math.max(1,Math.floor(innerHeight*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}};addEventListener('resize',resize);resize();document.addEventListener('visibilitychange',()=>{running=document.visibilityState==='visible';if(running)last=performance.now()});const io=new IntersectionObserver(e=>{running=e[0]?.isIntersecting??true;if(running)last=performance.now()},{threshold:0});io.observe(canvas);
 function start(sourceTexture,sw,sh){gl.uniform1i(U.uSource,0);gl.uniform1i(U.uAtlas,1);set('uSourceSize',[sw,sh]);set('uGlyphCount',ordered.length);set('uCellSize',Math.max(2,OPTS.cellSize*Math.min(devicePixelRatio||1,OPTS.maxDpr)));set('uBrightness',OPTS.brightness);set('uContrast',OPTS.contrast);set('uGamma',OPTS.gamma);set('uInvert',OPTS.invert?1:0);set('uDitherMode',ditherMode(OPTS.ditherMode));set('uDitherStrength',OPTS.ditherStrength);set('uGlyphVariation',OPTS.glyphVariation);set('uInteraction',interaction(OPTS.interaction));set('uMouseRadius',OPTS.mouseRadius);set('uMouseStrength',OPTS.mouseStrength);set('uVelocityMultiplier',OPTS.velocityMultiplier);set('uTurbulence',OPTS.turbulenceAroundPointer);set('uNoiseScale',OPTS.noiseScale);set('uNoiseStrength',OPTS.noiseStrength);set('uNoiseSpeed',OPTS.noiseSpeed);set('uNoiseOctaves',OPTS.noiseOctaves);set('uSampleDistortion',OPTS.sampleDistortion);set('uGlyphDistortion',OPTS.glyphDistortion);set('uRippleStrength',OPTS.rippleStrength);set('uRippleFrequency',OPTS.rippleFrequency);set('uRippleSpeed',OPTS.rippleSpeed);set('uRippleDecay',OPTS.rippleDecay);set('uRippleEnabled',OPTS.ripple?1:0);set('uColorMode',colorMode(OPTS.colorMode));set('uGrain',OPTS.grain);set('uScanlines',OPTS.scanlines);set('uVignette',OPTS.vignette);set('uFlicker',OPTS.flicker);set('uChromatic',OPTS.chromaticAberration);set('uGlitch',OPTS.glitch);set('uReducedMotion',reduced);set('uOpacity',OPTS.opacity);set('uForeground',toRgb(OPTS.foregroundColor));set('uBackground',toRgb(OPTS.backgroundColor));set('uDuotoneDark',toRgb(OPTS.duotoneDark));set('uDuotoneLight',toRgb(OPTS.duotoneLight));requestAnimationFrame(frame)}
 function frame(now){if(!running){requestAnimationFrame(frame);return}const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;velocity=[(mouse[0]-previous[0])/Math.max(dt,.001),(mouse[1]-previous[1])/Math.max(dt,.001)];previous=[mouse[0],mouse[1]];set('uTime',time);set('uResolution',[canvas.width,canvas.height]);set('uMouse',mouse);set('uMouseVelocity',velocity);set('uMouseSpeed',Math.min(2,Math.hypot(velocity[0],velocity[1])));ripple[2]+=dt;set('uRippleOrigin',[ripple[0],ripple[1]]);set('uRippleAge',ripple[2]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(frame)}
}catch(error){fallback.hidden=false;fallback.textContent=error.message}
})();</script></body></html>`;
}

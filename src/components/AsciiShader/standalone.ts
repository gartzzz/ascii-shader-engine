// FILE: src/components/AsciiShader/standalone.ts
import { fragmentShader } from "./shaders";

export async function sourceAsDataUrl(source: string): Promise<string> {
  if (source.startsWith("data:")) return source;
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Unable to embed source: ${response.status}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
}

export function buildStandaloneHtml(source: string): string {
  const safeSource = JSON.stringify(source);
  const safeVertex = JSON.stringify(`attribute vec2 position; varying vec2 vUv; void main(){vUv=position*.5+.5;gl_Position=vec4(position,0.0,1.0);}`);
  const safeFragment = JSON.stringify(fragmentShader);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Standalone ASCII Shader</title>
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#111;color:#f4f1ed;font:12px monospace}canvas{display:block;width:100%;height:100%}.fallback{position:fixed;inset:0;display:grid;place-items:center;padding:24px;text-align:center;color:#f4f1ed;background:#111}</style></head>
<body><canvas id="ascii-canvas"></canvas><div id="fallback" class="fallback" hidden>WebGL is unavailable in this browser.</div><script>
(() => {
const SOURCE=${safeSource}, VERTEX=${safeVertex}, FRAGMENT=${safeFragment};
const canvas=document.getElementById('ascii-canvas'), fallback=document.getElementById('fallback');
const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'high-performance'});
if(!gl){fallback.hidden=false;return;}
const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader)||'Shader compilation failed');return shader};
try{
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,VERTEX));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FRAGMENT));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'Program link failed');gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const charset=Array.from('  ·˙•◦○◌◇◆▪■□▰▲△✦✧✶✹'), atlas=document.createElement('canvas'),ctx=atlas.getContext('2d');atlas.width=charset.length*64;atlas.height=80;ctx.font='600 64px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';charset.forEach((g,i)=>ctx.fillText(g,i*64+32,40));const atlasTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,atlasTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const image=new Image();image.onload=()=>{const sourceTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,sourceTexture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);start(sourceTexture,image.naturalWidth,image.naturalHeight)};image.onerror=()=>{fallback.hidden=false;fallback.textContent='The embedded image could not be decoded.'};image.src=SOURCE;
 const names=['uSource','uAtlas','uResolution','uSourceSize','uCellSize','uTime','uBrightness','uContrast','uGamma','uInvert','uDitherMode','uDitherStrength','uGlyphCount','uGlyphVariation','uInteraction','uMouse','uMouseVelocity','uMouseSpeed','uMouseRadius','uMouseStrength','uVelocityMultiplier','uTurbulence','uNoiseScale','uNoiseStrength','uNoiseSpeed','uNoiseOctaves','uSampleDistortion','uGlyphDistortion','uRippleOrigin','uRippleAge','uRippleStrength','uRippleFrequency','uRippleSpeed','uRippleDecay','uRippleEnabled','uForeground','uBackground','uDuotoneDark','uDuotoneLight','uColorMode','uGrain','uScanlines','uVignette','uFlicker','uChromatic','uGlitch','uReducedMotion','uOpacity'];const U=Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(program,n)]));
 const set=(n,v)=>{const l=U[n];if(!l)return;if(Array.isArray(v)){if(v.length===2)gl.uniform2f(l,v[0],v[1]);else if(v.length===3)gl.uniform3f(l,v[0],v[1],v[2])}else if(typeof v==='number')gl.uniform1f(l,v)};const color=(hex)=>{const n=parseInt(hex.slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
 let mouse=[.5,.5],previous=[.5,.5],velocity=[0,0],ripple=[0,0,-1],time=0,last=performance.now(),running=true;
 const pointer=e=>{const r=canvas.getBoundingClientRect();mouse=[Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height))]};canvas.addEventListener('pointermove',pointer);canvas.addEventListener('pointerdown',e=>{pointer(e);ripple=[mouse[0],mouse[1],0]});
 const resize=()=>{const d=Math.min(devicePixelRatio||1,2),w=Math.max(1,Math.floor(innerWidth*d)),h=Math.max(1,Math.floor(innerHeight*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}};addEventListener('resize',resize);resize();document.addEventListener('visibilitychange',()=>{running=document.visibilityState==='visible';if(running)last=performance.now()});
 function start(sourceTexture,sw,sh){gl.uniform1i(U.uSource,0);gl.uniform1i(U.uAtlas,1);set('uSourceSize',[sw,sh]);set('uGlyphCount',charset.length);set('uCellSize',8* Math.min(devicePixelRatio||1,2));set('uContrast',1.12);set('uGamma',1);set('uDitherMode',1);set('uDitherStrength',.22);set('uInteraction',1);set('uMouseRadius',.18);set('uMouseStrength',.045);set('uVelocityMultiplier',2.5);set('uTurbulence',.4);set('uNoiseScale',3);set('uNoiseStrength',.012);set('uNoiseSpeed',.1);set('uNoiseOctaves',2);set('uSampleDistortion',.6);set('uGlyphDistortion',.25);set('uRippleStrength',.018);set('uRippleFrequency',35);set('uRippleSpeed',3);set('uRippleDecay',1.8);set('uRippleEnabled',1);set('uColorMode',0);set('uGrain',.025);set('uScanlines',.008);set('uVignette',.1);set('uOpacity',1);set('uForeground',color('#F4F1ED'));set('uBackground',color('#111111'));set('uDuotoneDark',color('#111111'));set('uDuotoneLight',color('#F4F1ED'));requestAnimationFrame(frame)}
 function frame(now){if(!running){requestAnimationFrame(frame);return}const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;velocity=[(mouse[0]-previous[0])/Math.max(dt,.001),(mouse[1]-previous[1])/Math.max(dt,.001)];previous=[mouse[0],mouse[1]];set('uTime',time);set('uResolution',[canvas.width,canvas.height]);set('uMouse',mouse);set('uMouseVelocity',velocity);set('uMouseSpeed',Math.min(2,Math.hypot(velocity[0],velocity[1])));ripple[2]+=dt;set('uRippleOrigin',[ripple[0],ripple[1]]);set('uRippleAge',ripple[2]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(frame)}
}catch(error){fallback.hidden=false;fallback.textContent=error.message}
})();</script></body></html>`;
}

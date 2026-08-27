(function(D,P){typeof exports=="object"&&typeof module<"u"?P(exports):typeof define=="function"&&define.amd?define(["exports"],P):(D=typeof globalThis<"u"?globalThis:D||self,P(D.AsciiShader={}))})(this,(function(D){"use strict";const P={classic:" .:-=+*#%@",dense:"  ·.:,;irsXA253hMHGS#9B&@",geometric:"  ·˙•◦○◌◇◆▪■□▰▲△✦✧✶✹",digital:"  .:+×*≡░▒▓█▄▀▌▐■",technical:"  .,:;+*xX#%&@/\\|[]{}<>",minimal:"  ·•+×■█"},ne={clean:{charsetPreset:"dense",interaction:"none",noiseStrength:.004,sampleDistortion:.08,glyphDistortion:0,grain:.008,ditherStrength:.12,glitch:0},magnetic:{charsetPreset:"geometric",interaction:"push",mouseStrength:.045,turbulenceAroundPointer:.4,ripple:!0,rippleStrength:.018,noiseStrength:.012},liquid:{charsetPreset:"dense",interaction:"attract",noiseScale:2.6,noiseStrength:.025,sampleDistortion:1.2,glyphDistortion:.35,noiseSpeed:.16,rippleStrength:.012},terminal:{charsetPreset:"technical",contrast:1.28,ditherMode:"bayer4",ditherStrength:.16,scanlines:.018,flicker:.025,grain:.018,glitch:.025,interaction:"none"},glitch:{charsetPreset:"digital",contrast:1.2,grain:.035,scanlines:.012,chromaticAberration:.003,glitch:.12,interaction:"push",turbulenceAroundPointer:.25}},ae={sourceType:"image",autoSortCharset:!0,glyphVariation:.06,fontFamily:"monospace",fontWeight:600,cellSize:8,brightness:0,contrast:1.12,gamma:1,invert:!1,ditherMode:"bayer4",ditherStrength:.22,interaction:"push",mouseRadius:.18,mouseStrength:.045,mouseSmoothing:12,mouseVelocitySmoothing:10,mouseVelocityDecay:5,velocityMultiplier:2.5,turbulenceAroundPointer:.4,noiseScale:3,noiseStrength:.012,noiseSpeed:.1,noiseOctaves:2,sampleDistortion:.6,glyphDistortion:.25,ripple:!0,rippleStrength:.018,rippleFrequency:35,rippleSpeed:3,rippleDecay:1.8,colorMode:"monochrome",foregroundColor:"#F4F1ED",backgroundColor:"#111111",duotoneDark:"#111111",duotoneLight:"#F4F1ED",grain:.025,scanlines:.008,vignette:.1,flicker:0,chromaticAberration:0,glitch:0,opacity:1,pointerTarget:"window",reducedMotion:"auto",maxDpr:2,debug:!1};function B(o){const{src:d,className:t,style:i,charset:p,preset:a="magnetic",charsetPreset:e,...g}=o,v=ne[a],s=Object.fromEntries(Object.entries(g).filter(([,y])=>y!==void 0)),M={...ae,...v,...s},T=e??v.charsetPreset??"geometric";return{...M,src:d,preset:a,charsetPreset:T,charset:p??P[T]}}const ue=`
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
`;function z(o,d,t){return Math.min(t,Math.max(d,o))}function F(o){const d=o.replace("#",""),t=d.length===3?d.split("").map(p=>p+p).join(""):d,i=parseInt(t,16);return[(i>>16&255)/255,(i>>8&255)/255,(i&255)/255]}function ce(o){return typeof o=="boolean"?o:typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches}const le="attribute vec2 position; varying vec2 vUv; void main(){vUv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}";function W(o){if(!o)return document.body;if(typeof o=="string"){const d=document.querySelector(o);if(!d)throw new Error(`[ascii-shader] target selector "${o}" not found`);return d}return o instanceof HTMLCanvasElement?o.parentElement??document.body:o}function H(o,d,t,i,p){const a=Array.from(d||" "),e=64,g=80,v=document.createElement("canvas");v.width=Math.max(1,a.length*e),v.height=g;const s=v.getContext("2d",{willReadFrequently:!0});s.font=`${i} ${g-16}px ${t}`,s.textAlign="center",s.textBaseline="middle";const M=a.map((m,f)=>{s.clearRect(f*e,0,e,g),s.fillStyle="#fff",s.fillText(m,f*e+e/2,g/2);const E=s.getImageData(f*e,0,e,g).data;let c=0;for(let _=3;_<E.length;_+=4)c+=E[_]/255;return{g:m,i:f,d:c/(e*g)}}),T=p?[...M].sort((m,f)=>m.d-f.d||m.i-f.i):M;s.clearRect(0,0,v.width,v.height),s.fillStyle="#fff",T.forEach(({g:m},f)=>s.fillText(m,f*e+e/2,g/2));const y=o.createTexture();return o.activeTexture(o.TEXTURE1),o.bindTexture(o.TEXTURE_2D,y),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,v),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),{texture:y,count:T.length}}function q(o,d,t){const i=o.createShader(d);if(o.shaderSource(i,t),o.compileShader(i),!o.getShaderParameter(i,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(i)||"shader compile failed");return i}function j(o){const d={...o};let t=B(d);const i=typeof o.target=="string"?W(o.target):o.target instanceof HTMLCanvasElement?o.target.parentElement??document.body:o.target instanceof HTMLElement?o.target:W(void 0),p=o.target instanceof HTMLCanvasElement,a=p?o.target:document.createElement("canvas");p||(a.style.width="100%",a.style.height="100%",a.style.display="block",getComputedStyle(i).position==="static"&&(i.style.position="relative"),i.appendChild(a),i.style.overflow||(i.style.overflow="hidden"));const e=a.getContext("webgl",{alpha:!0,antialias:!1,powerPreference:"high-performance"});if(!e){const r=document.createElement("img");return r.src=t.src,r.style.width="100%",r.style.height="100%",r.style.objectFit="cover",i.appendChild(r),{canvas:a,update:()=>{},destroy:()=>r.remove(),pause:()=>{},resume:()=>{}}}const g=q(e,e.VERTEX_SHADER,le),v=q(e,e.FRAGMENT_SHADER,ue),s=e.createProgram();if(e.attachShader(s,g),e.attachShader(s,v),e.linkProgram(s),!e.getProgramParameter(s,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(s)||"link failed");e.useProgram(s);const M=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,M),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const T=e.getAttribLocation(s,"position");e.enableVertexAttribArray(T),e.vertexAttribPointer(T,2,e.FLOAT,!1,0,0);let y=H(e,t.charset,t.fontFamily,t.fontWeight,t.autoSortCharset),m=e.createTexture(),f=1,E=1,c=null;const _=(r,l)=>{if(l==="video"){c&&(c.pause(),c.remove()),c=document.createElement("video"),c.autoplay=!0,c.muted=!0,c.loop=!0,c.playsInline=!0,c.crossOrigin="anonymous",c.addEventListener("loadedmetadata",()=>{f=c.videoWidth||1,E=c.videoHeight||1}),c.src=r,c.load(),c.play().catch(()=>{});return}const u=new Image;u.crossOrigin="anonymous",u.onload=()=>{f=u.naturalWidth||1,E=u.naturalHeight||1,e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,m),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,u),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)},u.onerror=()=>console.warn(`[ascii-shader] failed to load ${r}`),u.src=r};e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,m),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),_(t.src,t.sourceType);const C={};["uSource","uAtlas","uResolution","uSourceSize","uCellSize","uTime","uBrightness","uContrast","uGamma","uInvert","uDitherMode","uDitherStrength","uGlyphCount","uGlyphVariation","uInteraction","uMouse","uMouseVelocity","uMouseSpeed","uMouseRadius","uMouseStrength","uVelocityMultiplier","uTurbulence","uNoiseScale","uNoiseStrength","uNoiseSpeed","uNoiseOctaves","uSampleDistortion","uGlyphDistortion","uRippleOrigin","uRippleAge","uRippleStrength","uRippleFrequency","uRippleSpeed","uRippleDecay","uRippleEnabled","uForeground","uBackground","uDuotoneDark","uDuotoneLight","uColorMode","uGrain","uScanlines","uVignette","uFlicker","uChromatic","uGlitch","uReducedMotion","uOpacity"].forEach(r=>C[r]=e.getUniformLocation(s,r));const de=r=>r==="bayer4"?1:r==="noise"?2:0,fe=r=>r==="push"?1:r==="attract"?2:0,pe=r=>r==="source"?1:r==="duotone"?2:0,n=(r,l)=>{const u=C[r];u&&e.uniform1f(u,l)},w=(r,l,u)=>{const h=C[r];h&&e.uniform2f(h,l,u)},L=(r,l,u,h)=>{const x=C[r];x&&e.uniform3f(x,l,u,h)};e.uniform1i(C.uSource,0),e.uniform1i(C.uAtlas,1);let U={x:.5,y:.5},S={x:.5,y:.5},G={x:.5,y:.5},V={x:0,y:0},R={x:0,y:0},Y=0,A={x:.5,y:.5,age:-1},$=0,I=performance.now(),b=!0,O=0,K=!1;const k=r=>{const l=a.getBoundingClientRect();U.x=z((r.clientX-l.left)/Math.max(l.width,1),0,1),U.y=z(1-(r.clientY-l.top)/Math.max(l.height,1),0,1)},J=r=>{k(r),A.x=U.x,A.y=U.y,A.age=0},X=t.pointerTarget==="window"?window:a;X.addEventListener("pointermove",k),X.addEventListener("pointerdown",J);const me=new ResizeObserver(()=>{}),Q=new IntersectionObserver(r=>{b=r[0]?.isIntersecting??!0,b&&(I=performance.now())},{threshold:0});Q.observe(a);const Z=()=>{b=document.visibilityState==="visible",b&&(I=performance.now())};document.addEventListener("visibilitychange",Z);function ee(){const r=ce(t.reducedMotion)?1:0;n("uCellSize",Math.max(2,t.cellSize*Math.min(window.devicePixelRatio||1,t.maxDpr))),n("uBrightness",t.brightness),n("uContrast",t.contrast),n("uGamma",t.gamma),n("uInvert",t.invert?1:0),n("uDitherMode",de(t.ditherMode)),n("uDitherStrength",t.ditherStrength),n("uGlyphCount",y.count),n("uGlyphVariation",t.glyphVariation),n("uInteraction",fe(t.interaction)),n("uMouseRadius",t.mouseRadius),n("uMouseStrength",t.mouseStrength),n("uVelocityMultiplier",t.velocityMultiplier),n("uTurbulence",t.turbulenceAroundPointer),n("uNoiseScale",t.noiseScale),n("uNoiseStrength",t.noiseStrength),n("uNoiseSpeed",t.noiseSpeed),n("uNoiseOctaves",t.noiseOctaves),n("uSampleDistortion",t.sampleDistortion),n("uGlyphDistortion",t.glyphDistortion),n("uRippleStrength",t.rippleStrength),n("uRippleFrequency",t.rippleFrequency),n("uRippleSpeed",t.rippleSpeed),n("uRippleDecay",t.rippleDecay),n("uRippleEnabled",t.ripple?1:0),n("uColorMode",pe(t.colorMode)),n("uGrain",t.grain),n("uScanlines",t.scanlines),n("uVignette",t.vignette),n("uFlicker",t.flicker),n("uChromatic",t.chromaticAberration),n("uGlitch",t.glitch),n("uReducedMotion",r),n("uOpacity",t.opacity);const l=F(t.foregroundColor);L("uForeground",l[0],l[1],l[2]);const u=F(t.backgroundColor);L("uBackground",u[0],u[1],u[2]);const h=F(t.duotoneDark);L("uDuotoneDark",h[0],h[1],h[2]);const x=F(t.duotoneLight);L("uDuotoneLight",x[0],x[1],x[2])}ee();const te=r=>{if(K||(O=requestAnimationFrame(te),!b))return;const l=Math.min((r-I)/1e3,.05);I=r,$+=l;const u=1-Math.exp(-t.mouseSmoothing*l),h=1-Math.exp(-t.mouseVelocitySmoothing*l);S.x+=(U.x-S.x)*u,S.y+=(U.y-S.y)*u,V.x=(S.x-G.x)/Math.max(l,.001),V.y=(S.y-G.y)/Math.max(l,.001),G.x=S.x,G.y=S.y,R.x+=(V.x-R.x)*h,R.y+=(V.y-R.y)*h,Y=Math.min(2,Math.hypot(R.x,R.y))*Math.exp(-t.mouseVelocityDecay*l*.1),A.age+=l;const x=Math.min(window.devicePixelRatio||1,t.maxDpr),oe=a.getBoundingClientRect(),re=Math.max(1,Math.floor(oe.width*x)),ie=Math.max(1,Math.floor(oe.height*x));(a.width!==re||a.height!==ie)&&(a.width=re,a.height=ie),e.viewport(0,0,a.width,a.height),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,m),c&&c.readyState>=2&&(f=c.videoWidth||f,E=c.videoHeight||E,e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,c)),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,y.texture),w("uResolution",a.width,a.height),w("uSourceSize",f,E),n("uTime",$),w("uMouse",S.x,S.y),w("uMouseVelocity",R.x,R.y),n("uMouseSpeed",Y),w("uRippleOrigin",A.x,A.y),n("uRippleAge",A.age),e.drawArrays(e.TRIANGLE_STRIP,0,4)};return O=requestAnimationFrame(te),{canvas:a,update(r){const l={...t,...r,src:r.src??t.src},u=B(l),h=u.charset!==t.charset||u.fontFamily!==t.fontFamily||String(u.fontWeight)!==String(t.fontWeight)||u.autoSortCharset!==t.autoSortCharset;t=u,r.src&&r.src!==m&&_(u.src,u.sourceType),h&&(e.deleteTexture(y.texture),y=H(e,t.charset,t.fontFamily,t.fontWeight,t.autoSortCharset)),ee()},pause(){b=!1},resume(){b=!0,I=performance.now()},destroy(){K=!0,cancelAnimationFrame(O),X.removeEventListener("pointermove",k),X.removeEventListener("pointerdown",J),document.removeEventListener("visibilitychange",Z),Q.disconnect(),me.disconnect(),c&&(c.pause(),c.remove()),e.deleteTexture(m),e.deleteTexture(y.texture),e.deleteBuffer(M),e.deleteProgram(s),e.deleteShader(g),e.deleteShader(v),p||a.remove()}}}function se(o){const d={};for(const[t,i]of Object.entries(o.dataset))i!==void 0&&(d[t]=i);return d}function N(o=document){o.querySelectorAll("[data-ascii-shader]").forEach(t=>{if(t._asciiInit)return;t._asciiInit=!0;const i=se(t),p=i.src||i.asciiShader||t.getAttribute("data-src")||"";if(!p){console.warn("[ascii-shader] data-src missing",t);return}const a={src:p,target:t};i.preset&&(a.preset=i.preset),i.charset&&(a.charset=i.charset),i.charsetPreset&&(a.charsetPreset=i.charsetPreset),i.preset&&(a.preset=i.preset),i.colorMode&&(a.colorMode=i.colorMode),i.cellSize&&(a.cellSize=Number(i.cellSize)),i.interaction&&(a.interaction=i.interaction),j(a)})}typeof window<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>N()):N()),D.createAsciiShader=j,D.initAsciiShaders=N,Object.defineProperty(D,Symbol.toStringTag,{value:"Module"})}));
//# sourceMappingURL=ascii-shader.umd.js.map

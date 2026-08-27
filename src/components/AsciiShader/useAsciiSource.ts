// FILE: src/components/AsciiShader/useAsciiSource.ts
import { useEffect, useState } from "react";
import * as THREE from "three";

export type AsciiSource = { texture: THREE.Texture; width: number; height: number; ready: boolean; error: boolean };

const fallback = new THREE.DataTexture(new Uint8Array([17, 17, 17, 255]), 1, 1, THREE.RGBAFormat);
fallback.needsUpdate = true;

export function useAsciiSource(src: string, sourceType: "image" | "video"): AsciiSource {
  const [source, setSource] = useState<AsciiSource>({ texture: fallback, width: 1, height: 1, ready: false, error: false });
  useEffect(() => {
    let active = true;
    let texture: THREE.Texture | undefined;
    let video: HTMLVideoElement | undefined;
    if (!src) return undefined;
    if (typeof window === "undefined") return undefined;
    setSource({ texture: fallback, width: 1, height: 1, ready: false, error: false });
    if (sourceType === "video") {
      video = document.createElement("video");
      video.autoplay = true; video.muted = true; video.loop = true; video.playsInline = true; video.crossOrigin = "anonymous";
      const onReady = () => {
        if (!active || !video) return;
        texture = new THREE.VideoTexture(video);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter;
        setSource({ texture, width: video.videoWidth || 1, height: video.videoHeight || 1, ready: true, error: false });
        void video.play().catch(() => undefined);
      };
      const onError = () => { if (!active) return; console.warn(`AsciiShader: unable to load video source "${src}".`); setSource({ texture: fallback, width: 1, height: 1, ready: false, error: true }); };
      video.addEventListener("loadedmetadata", onReady); video.addEventListener("error", onError); video.src = src; video.load();
      return () => { active = false; video?.pause(); video?.removeEventListener("loadedmetadata", onReady); video?.removeEventListener("error", onError); video!.removeAttribute("src"); video?.load(); texture?.dispose(); };
    }
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const onLoad = (loaded: THREE.Texture) => { if (!active) { loaded.dispose(); return; } texture = loaded; texture.colorSpace = THREE.SRGBColorSpace; texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter; texture.wrapS = THREE.ClampToEdgeWrapping; texture.wrapT = THREE.ClampToEdgeWrapping; texture.needsUpdate = true; const image = loaded.image as { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }; setSource({ texture, width: image.naturalWidth || image.width || 1, height: image.naturalHeight || image.height || 1, ready: true, error: false }); };
    const onError = () => { if (!active) return; console.warn(`AsciiShader: unable to load image source "${src}".`); setSource({ texture: fallback, width: 1, height: 1, ready: false, error: true }); };
    loader.load(src, onLoad, undefined, onError);
    return () => { active = false; texture?.dispose(); };
  }, [src, sourceType]);
  return source;
}

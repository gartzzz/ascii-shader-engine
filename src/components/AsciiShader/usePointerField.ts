// FILE: src/components/AsciiShader/usePointerField.ts
import { useEffect, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { clamp } from "./utils";

export type PointerState = { target: { x: number; y: number }; smooth: { x: number; y: number }; previous: { x: number; y: number }; velocity: { x: number; y: number }; smoothVelocity: { x: number; y: number }; speed: number; ripple: { x: number; y: number; age: number } };

export function usePointerField(targetMode: "window" | "canvas", smoothing: number, velocitySmoothing: number, decay: number, onDebug?: (x: number, y: number, speed: number) => void): MutableRefObject<PointerState> {
  const state = useRef<PointerState>({ target: { x: 0.5, y: 0.5 }, smooth: { x: 0.5, y: 0.5 }, previous: { x: 0.5, y: 0.5 }, velocity: { x: 0, y: 0 }, smoothVelocity: { x: 0, y: 0 }, speed: 0, ripple: { x: 0.5, y: 0.5, age: -1 } });
  const { gl } = useThree();
  useEffect(() => {
    const element = gl.domElement;
    const target = targetMode === "window" ? window : element;
    const update = (event: PointerEvent) => { const rect = element.getBoundingClientRect(); state.current.target.x = clamp((event.clientX - rect.left) / Math.max(rect.width, 1), 0, 1); state.current.target.y = clamp(1 - (event.clientY - rect.top) / Math.max(rect.height, 1), 0, 1); };
    const down = (event: PointerEvent) => { update(event); state.current.ripple.x = state.current.target.x; state.current.ripple.y = state.current.target.y; state.current.ripple.age = 0; };
    const leave = () => { state.current.target.x = 0.5; state.current.target.y = 0.5; };
    target.addEventListener("pointermove", update as EventListener); target.addEventListener("pointerdown", down as EventListener); target.addEventListener("pointerleave", leave as EventListener);
    return () => { target.removeEventListener("pointermove", update as EventListener); target.removeEventListener("pointerdown", down as EventListener); target.removeEventListener("pointerleave", leave as EventListener); };
  }, [gl, targetMode]);
  useFrame((_, delta) => { const dt = Math.min(delta, 0.05); const positionT = 1 - Math.exp(-smoothing * dt); const velocityT = 1 - Math.exp(-velocitySmoothing * dt); const current = state.current; current.smooth.x += (current.target.x - current.smooth.x) * positionT; current.smooth.y += (current.target.y - current.smooth.y) * positionT; current.velocity.x = (current.smooth.x - current.previous.x) / Math.max(dt, 0.001); current.velocity.y = (current.smooth.y - current.previous.y) / Math.max(dt, 0.001); current.previous.x = current.smooth.x; current.previous.y = current.smooth.y; current.smoothVelocity.x += (current.velocity.x - current.smoothVelocity.x) * velocityT; current.smoothVelocity.y += (current.velocity.y - current.smoothVelocity.y) * velocityT; current.speed *= Math.exp(-decay * dt); current.speed = Math.min(2, Math.hypot(current.smoothVelocity.x, current.smoothVelocity.y)); current.ripple.age += dt; onDebug?.(current.smooth.x, current.smooth.y, current.speed); });
  return state;
}

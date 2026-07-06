"use client";

/**
 * Construção — skyscraper windows.
 *
 * Main: a fract() grid of windows on a dark facade. Each cell is a lit/unlit
 * warm-yellow rectangle; a per-cell hash mixed with slow time makes windows
 * switch on and off every few seconds. Thin dark mullions between cells.
 *
 * Background: near-black concrete — a single fbm grain field, very dark gray,
 * effectively static (frozen when offscreen by SceneFrame's demand loop).
 *
 * Uniforms: u_time (window switching), u_res (aspect), u_cols (window density).
 */

import { useMemo } from "react";
import * as THREE from "three";
import ShaderQuad from "../ShaderQuad";
import { NOISE_GLSL } from "../shaders/noise";

const MAIN_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_res;
uniform float u_cols;
${NOISE_GLSL}

void main() {
  // Aspect-correct grid so cells stay rectangular window-shaped.
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = vUv;
  vec2 grid = vec2(u_cols, u_cols * 1.6 / max(aspect, 0.001));
  vec2 cell = uv * grid;
  vec2 id = floor(cell);
  vec2 f = fract(cell);

  // Window rectangle with mullion margins.
  vec2 pad = vec2(0.12, 0.08);
  vec2 inside = step(pad, f) * step(pad, 1.0 - f);
  float win = inside.x * inside.y;

  // Lit state: per-cell hash offset by a slow time phase → flicker on/off.
  float seed = hash(id);
  float phase = sin(u_time * 0.4 + seed * 30.0) * 0.5 + 0.5;
  float lit = smoothstep(0.45, 0.55, phase * (0.6 + 0.4 * seed));

  vec3 facade = vec3(0.04, 0.045, 0.05);
  vec3 warm = vec3(0.85, 0.68, 0.32);
  vec3 col = facade;
  col = mix(col, warm * (0.5 + 0.5 * seed), win * lit);
  // Unlit windows: faint cold glass reflection.
  col = mix(col, vec3(0.08, 0.09, 0.11), win * (1.0 - lit) * 0.6);

  gl_FragColor = vec4(col, 1.0);
}
`;

const BG_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 u_res;
${NOISE_GLSL}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * 6.0;
  float g = fbm(p * 1.5) * 0.5 + 0.5;
  float fine = fbm(p * 8.0) * 0.5 + 0.5;
  float v = 0.045 + g * 0.03 + fine * 0.015;
  gl_FragColor = vec4(vec3(v), 1.0);
}
`;

export function Main({ mode }: { mode: "cover" | "banner" }) {
  const uniforms = useMemo(
    () => ({ u_cols: { value: mode === "banner" ? 16 : 8 } }),
    [mode],
  );
  return <ShaderQuad fragment={MAIN_FRAG} uniforms={uniforms} speed={1} />;
}

export function Background() {
  const uniforms = useMemo<Record<string, THREE.IUniform>>(() => ({}), []);
  return <ShaderQuad fragment={BG_FRAG} uniforms={uniforms} speed={0} />;
}

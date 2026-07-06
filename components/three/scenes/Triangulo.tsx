"use client";

/**
 * Triângulo — a triangle full of yellow eyes.
 *
 * Main: a fragment shader masks an equilateral triangle and tiles a procedural
 * "eye" SDF inside it: yellow sclera ellipse, dark iris, and an eyelid whose
 * height oscillates (blink) via smoothstep(sin(time + seed)).
 *
 * Background: the same eye function scattered sparsely on a jittered grid over
 * near-black, each eye blinking on its own phase.
 *
 * Uniforms: u_time, u_res, u_tri (1.0 = clip to triangle, 0.0 = full field).
 */

import { useMemo } from "react";
import ShaderQuad from "../ShaderQuad";
import { NOISE_GLSL } from "../shaders/noise";

// Shared GLSL: one eye centered at local coords, blinking on `phase`.
const EYE_GLSL = /* glsl */ `
// Returns eye color contribution at local p (roughly [-0.5,0.5]) given blink phase.
vec3 eye(vec2 p, float blink) {
  float r = length(p * vec2(1.0, 1.6));            // vertical squash
  float sclera = smoothstep(0.42, 0.40, r);
  float iris = smoothstep(0.20, 0.18, length(p));
  float pupil = smoothstep(0.09, 0.07, length(p));
  vec3 col = vec3(0.0);
  col = mix(col, vec3(0.86, 0.72, 0.12), sclera);   // yellow sclera
  col = mix(col, vec3(0.45, 0.30, 0.02), iris);     // amber iris
  col = mix(col, vec3(0.02), pupil);                // dark pupil
  // Eyelid: a horizontal band closing from top/bottom as blink → 1.
  float lid = smoothstep(0.5 - blink * 0.5, 0.52 - blink * 0.5, abs(p.y));
  col *= mix(1.0, 1.0 - sclera, blink * (1.0 - lid));
  col *= (1.0 - smoothstep(0.5, 0.5 - blink * 0.55, -abs(p.y)));
  return col * sclera; // clip to eye disc
}
`;

const MAIN_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_res;
${NOISE_GLSL}
${EYE_GLSL}

// Signed distance to an equilateral triangle (centered), negative inside.
float sdTriangle(vec2 p, float r) {
  const float k = 1.7320508; // sqrt(3)
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = (vUv - 0.5) * vec2(aspect, 1.0);

  float tri = sdTriangle(uv * 2.2, 0.9);
  float inside = smoothstep(0.01, -0.02, tri);

  // Tile eyes within the triangle.
  vec2 grid = vec2(4.0, 4.0);
  vec2 cell = uv * grid;
  vec2 id = floor(cell);
  vec2 f = fract(cell) - 0.5;
  float seed = hash(id);
  float blink = pow(sin(u_time * (0.8 + seed) + seed * 20.0) * 0.5 + 0.5, 6.0);
  vec3 col = eye(f, blink) * inside;

  // Faint triangle edge glow.
  col += vec3(0.7, 0.6, 0.1) * smoothstep(0.02, 0.0, abs(tri)) * 0.25;

  gl_FragColor = vec4(col, 1.0);
}
`;

const BG_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_res;
${NOISE_GLSL}
${EYE_GLSL}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = vUv * vec2(aspect, 1.0);

  vec3 col = vec3(0.02);
  vec2 grid = vec2(7.0 * aspect, 7.0);
  vec2 cell = uv * grid;
  vec2 id = floor(cell);
  vec2 f = fract(cell) - 0.5;

  float seed = hash(id);
  // Sparse: only some cells hold an eye.
  if (seed > 0.55) {
    // Jitter position a little per cell.
    vec2 j = (vec2(hash(id + 1.0), hash(id + 2.0)) - 0.5) * 0.4;
    float blink = pow(sin(u_time * (0.6 + seed) + seed * 30.0) * 0.5 + 0.5, 6.0);
    col += eye((f - j) * 1.8, blink) * 0.7;
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

export function Main({ mode: _mode }: { mode: "cover" | "banner" }) {
  return <ShaderQuad fragment={MAIN_FRAG} speed={1} />;
}

export function Background() {
  const uniforms = useMemo(() => ({}), []);
  return <ShaderQuad fragment={BG_FRAG} uniforms={uniforms} speed={1} />;
}

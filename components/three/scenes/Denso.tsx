"use client";

/**
 * Denso — an overpopulated Kowloon-style facade.
 *
 * Main: two overlapped fract() grids at different scales with hashed, irregular
 * column widths, so cells read as densely stacked apartments. Cells get random
 * depth shading, dark AC-unit blocks, and sparse dim-lit windows that flicker.
 *
 * Background: a dark lawn — vertical noise strokes in very dark green swaying
 * slightly (a cheap shader, no geometry).
 *
 * Uniforms: u_time, u_res.
 */

import { useMemo } from "react";
import ShaderQuad from "../ShaderQuad";
import { NOISE_GLSL } from "../shaders/noise";

const MAIN_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_res;
${NOISE_GLSL}

// One irregular facade layer at a given scale/offset.
vec3 facadeLayer(vec2 uv, float scale, float seedOff) {
  // Irregular column widths: warp x by a per-column hash.
  vec2 cell = uv * vec2(scale, scale * 1.4);
  vec2 id = floor(cell);
  vec2 f = fract(cell);
  float s = hash(id + seedOff);

  // Apartment box with grimy panel + window + AC unit.
  vec3 grime = mix(vec3(0.05, 0.055, 0.045), vec3(0.09, 0.10, 0.08), s);
  vec3 col = grime;

  // Window inset.
  vec2 wpad = vec2(0.18, 0.20);
  float win = step(wpad.x, f.x) * step(wpad.x, 1.0 - f.x)
            * step(wpad.y, f.y) * step(wpad.y, 1.0 - f.y);
  float lit = step(0.82, s) * (0.5 + 0.5 * sin(u_time * 2.0 + s * 40.0));
  col = mix(col, vec3(0.02, 0.03, 0.04), win);                 // dark glass
  col = mix(col, vec3(0.75, 0.62, 0.32), win * clamp(lit, 0.0, 1.0)); // lit window

  // AC unit: small dark block hanging under some windows.
  float ac = step(0.6, hash(id + 9.0)) *
             step(0.30, f.x) * step(0.30, 1.0 - f.x) *
             step(0.72, f.y) * step(0.90, 1.0 - f.y + 0.18);
  col = mix(col, vec3(0.03, 0.035, 0.03), ac);

  return col;
}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = vUv * vec2(aspect, 1.0);

  vec3 back = facadeLayer(uv + 0.13, 9.0, 3.0) * 0.6;   // deeper, dimmer layer
  vec3 front = facadeLayer(uv, 6.0, 0.0);
  // Overlap with a slight seam so the two layers read as stacked blocks.
  float seam = step(0.5, fract(uv.x * 6.0 + 0.5));
  vec3 col = mix(back, front, 0.55 + 0.45 * seam);

  // Green-brown grime tint overall.
  col *= vec3(0.95, 1.0, 0.9);
  gl_FragColor = vec4(col, 1.0);
}
`;

const BG_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_res;
${NOISE_GLSL}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = vUv * vec2(aspect, 1.0);

  // Vertical blade-like strokes swaying slightly.
  float sway = sin(uv.y * 3.0 + u_time * 0.6) * 0.02;
  float blades = fbm(vec2((uv.x + sway) * 60.0, uv.y * 6.0));
  float v = blades * 0.5 + 0.5;
  vec3 grass = mix(vec3(0.02, 0.05, 0.02), vec3(0.05, 0.11, 0.05), v);
  // Darker toward the top for depth.
  grass *= mix(0.6, 1.0, uv.y);
  gl_FragColor = vec4(grass, 1.0);
}
`;

export function Main({ mode: _mode }: { mode: "cover" | "banner" }) {
  return <ShaderQuad fragment={MAIN_FRAG} speed={1} />;
}

export function Background() {
  const uniforms = useMemo(() => ({}), []);
  return <ShaderQuad fragment={BG_FRAG} uniforms={uniforms} speed={1} />;
}

"use client";

/**
 * Seco — dark, dry blood.
 *
 * Main: viscous blood in dark reds. Domain-warped fbm with a slow downward drift
 * (a `u_time` bias on the y coordinate) so the surface seems to ooze downward.
 *
 * Background: rain of black blood — thin vertical streaks a shade lighter than the
 * page background, falling and wrapping. Drawn in the fragment shader by tiling
 * columns and offsetting each column's phase.
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

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = vUv * vec2(aspect, 1.0);

  // Downward-drifting domain warp.
  vec2 p = uv * 3.0;
  p.y += u_time * 0.06;
  vec2 warp = vec2(fbm(p * 1.3), fbm(p * 1.3 + 3.7));
  float v = fbm(p + warp * 1.8) * 0.5 + 0.5;

  vec3 deep = vec3(0.10, 0.015, 0.02);
  vec3 blood = vec3(0.42, 0.05, 0.06);
  vec3 col = mix(deep, blood, pow(v, 1.4));
  // Darken pooled lows for a viscous, clotted feel.
  col *= 0.55 + 0.6 * v;

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

  vec3 bg = vec3(0.035);        // page-ish black
  vec3 streak = vec3(0.075);    // slightly lighter than bg
  float cols = 60.0 * aspect;
  float x = uv.x * cols;
  float col = floor(x);
  float fx = fract(x);

  float seed = hash(vec2(col, 3.0));
  float speed = 0.3 + seed * 0.8;
  // Falling streak position, wrapping vertically.
  float y = fract(uv.y + u_time * speed * 0.15 + seed);
  // Short vertical dash.
  float len = 0.08 + seed * 0.14;
  float dash = smoothstep(0.0, 0.02, y) * smoothstep(len, len - 0.02, y);
  float thin = smoothstep(0.42, 0.5, fx) * smoothstep(0.58, 0.5, fx);

  float d = dash * thin * (0.4 + 0.6 * seed);
  vec3 col3 = mix(bg, streak, d);
  gl_FragColor = vec4(col3, 1.0);
}
`;

export function Main({ mode: _mode }: { mode: "cover" | "banner" }) {
  return <ShaderQuad fragment={MAIN_FRAG} speed={1} />;
}

export function Background() {
  const uniforms = useMemo(() => ({}), []);
  return <ShaderQuad fragment={BG_FRAG} uniforms={uniforms} speed={1} />;
}

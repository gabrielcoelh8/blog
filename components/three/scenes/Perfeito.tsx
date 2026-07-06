"use client";

/**
 * Perfeito — a perfect square holding dark liquid.
 *
 * Main: a centered white-outlined square whose interior is a domain-warped fbm
 * "dark liquid" (near-black purples, slow flow). Outside the square is flat black.
 *
 * Background: static asymmetric white square outlines scattered off-grid on dark.
 * Drawn procedurally in a fragment shader with speed=0 (a single frozen frame).
 *
 * Uniforms: u_time (liquid flow), u_res (aspect).
 */

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
  vec2 uv = (vUv - 0.5) * vec2(aspect, 1.0);

  // Square region (half-size 0.3), outlined in white.
  float hs = 0.3;
  vec2 d = abs(uv) - hs;
  float outside = max(d.x, d.y);
  float border = smoothstep(0.006, 0.0, abs(outside)) ; // thin outline
  float inside = step(outside, 0.0);

  // Domain-warped dark liquid inside the square.
  vec2 p = uv * 3.0;
  vec2 warp = vec2(fbm(p + u_time * 0.05), fbm(p + 5.2 - u_time * 0.04));
  float liquid = fbm(p + warp * 1.5);
  vec3 dark = mix(vec3(0.02, 0.01, 0.03), vec3(0.10, 0.06, 0.14), liquid * 0.5 + 0.5);

  vec3 col = vec3(0.0);
  col = mix(col, dark, inside);
  col = mix(col, vec3(0.92), border);

  gl_FragColor = vec4(col, 1.0);
}
`;

const BG_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 u_res;
${NOISE_GLSL}

// Signed distance to a square outline centered at c with half-size s.
float squareOutline(vec2 uv, vec2 c, float s, float th) {
  vec2 d = abs(uv - c) - s;
  float o = max(d.x, d.y);
  return smoothstep(th, 0.0, abs(o));
}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = vUv * vec2(aspect, 1.0);

  vec3 col = vec3(0.03);
  // A handful of asymmetric, off-grid white square outlines.
  for (int i = 0; i < 11; i++) {
    float fi = float(i);
    vec2 c = vec2(hash(vec2(fi, 1.0)) * aspect, hash(vec2(fi, 7.0)));
    float s = 0.03 + hash(vec2(fi, 3.0)) * 0.10;
    float a = 0.10 + hash(vec2(fi, 5.0)) * 0.18;
    col += vec3(1.0) * squareOutline(uv, c, s, 0.004) * a;
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

export function Main({ mode: _mode }: { mode: "cover" | "banner" }) {
  return <ShaderQuad fragment={MAIN_FRAG} speed={1} />;
}

export function Background() {
  return <ShaderQuad fragment={BG_FRAG} speed={0} />;
}

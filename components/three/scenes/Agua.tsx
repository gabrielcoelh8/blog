"use client";

/**
 * Água — a moving water surface with fish.
 *
 * Main: a water surface shader. fbm drives a height field; fake normals derived
 * from the height's screen-space derivatives give specular glints on dark teal.
 * A few fish swim beneath as dark ellipse SDFs following sine paths, depth-faded.
 *
 * Background: the same shader with calmer amplitude and a darker palette.
 *
 * (Implemented as a fragment shader rather than a subdivided mesh so cover, banner
 * and background all share one robust, camera-independent code path.)
 *
 * Uniforms: u_time, u_res, u_calm (0 = lively cover, 1 = calm background).
 */

import { useMemo } from "react";
import ShaderQuad from "../ShaderQuad";
import { NOISE_GLSL } from "../shaders/noise";

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_res;
uniform float u_calm;
${NOISE_GLSL}

// Water height field at p.
float height(vec2 p) {
  float t = u_time * 0.25;
  float h = fbm(p * 1.5 + vec2(t, t * 0.6));
  h += 0.5 * fbm(p * 3.0 - vec2(t * 0.7, t));
  return h;
}

// A single fish silhouette: body ellipse + tail, moving along a sine path.
float fish(vec2 uv, float seed, float aspect) {
  float t = u_time * (0.10 + seed * 0.06);
  // Path wraps horizontally; gentle vertical bob.
  float x = fract(seed + t) * (aspect + 0.4) - 0.2;
  float y = 0.2 + seed * 0.6 + sin(u_time * 0.5 + seed * 10.0) * 0.05;
  vec2 c = vec2(x, y);
  vec2 d = uv - c;
  // Body: squashed ellipse.
  float body = smoothstep(0.045, 0.03, length(d * vec2(0.6, 1.6)));
  // Tail: small triangle behind the body wagging.
  float wag = sin(u_time * 6.0 + seed * 20.0) * 0.01;
  vec2 td = uv - (c - vec2(0.05, -wag));
  float tail = smoothstep(0.03, 0.0, abs(td.y) + abs(td.x) * 0.6) * step(td.x, 0.0);
  return clamp(body + tail * 0.5, 0.0, 1.0);
}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = vUv * vec2(aspect, 1.0);

  float amp = mix(1.0, 0.45, u_calm);
  vec2 p = uv * 4.0;
  float e = 0.01;
  float h  = height(p);
  float hx = height(p + vec2(e, 0.0));
  float hy = height(p + vec2(0.0, e));
  // Fake normal from gradient.
  vec3 n = normalize(vec3((h - hx) * amp, (h - hy) * amp, 0.15));
  vec3 lightDir = normalize(vec3(0.4, 0.7, 0.6));
  float spec = pow(max(dot(n, lightDir), 0.0), 24.0);

  vec3 deep = mix(vec3(0.02, 0.07, 0.10), vec3(0.01, 0.05, 0.07), u_calm);
  vec3 shallow = vec3(0.06, 0.20, 0.26);
  vec3 col = mix(deep, shallow, h * 0.5 + 0.5);
  col += vec3(0.6, 0.85, 0.95) * spec * mix(0.9, 0.4, u_calm);

  // Fish beneath the surface (skip on very calm background).
  if (u_calm < 0.5) {
    float f = 0.0;
    for (int i = 0; i < 6; i++) {
      f += fish(uv, hash(vec2(float(i), 2.0)), aspect);
    }
    f = clamp(f, 0.0, 1.0);
    col = mix(col, vec3(0.01, 0.03, 0.05), f * 0.7); // dark fish silhouettes
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

export function Main({ mode: _mode }: { mode: "cover" | "banner" }) {
  const uniforms = useMemo(() => ({ u_calm: { value: 0 } }), []);
  return <ShaderQuad fragment={FRAG} uniforms={uniforms} speed={1} />;
}

export function Background() {
  const uniforms = useMemo(() => ({ u_calm: { value: 1 } }), []);
  return <ShaderQuad fragment={FRAG} uniforms={uniforms} speed={1} />;
}

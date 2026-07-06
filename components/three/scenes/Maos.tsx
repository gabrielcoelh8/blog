"use client";

/**
 * Mãos — two static hands in blue surgical gloves.
 *
 * Main: two mirrored gloved-hand silhouettes drawn with SDFs (a palm capsule plus
 * finger capsules), tinted surgical blue with a soft rim light on dark. Static —
 * no per-frame motion (a very slow light breathing only).
 *
 * Background: sparse dark rose petals falling slowly (moving ellipse SDFs with
 * per-petal phase and tumble).
 *
 * Uniforms: u_time, u_res.
 */

import { useMemo } from "react";
import ShaderQuad from "../ShaderQuad";
import { NOISE_GLSL } from "../shaders/noise";

const HAND_GLSL = /* glsl */ `
// Capsule SDF (segment a-b with radius r).
float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// One hand centered near origin, palm up, fingers spread. Returns SDF.
float hand(vec2 p) {
  // Palm: fat capsule.
  float d = sdCapsule(p, vec2(0.0, -0.18), vec2(0.0, 0.02), 0.11);
  // Four fingers fanning upward.
  d = min(d, sdCapsule(p, vec2(-0.07, 0.02), vec2(-0.10, 0.22), 0.035));
  d = min(d, sdCapsule(p, vec2(-0.025, 0.04), vec2(-0.03, 0.27), 0.035));
  d = min(d, sdCapsule(p, vec2( 0.025, 0.04), vec2( 0.03, 0.27), 0.035));
  d = min(d, sdCapsule(p, vec2( 0.07, 0.02), vec2( 0.10, 0.23), 0.035));
  // Thumb off to the side.
  d = min(d, sdCapsule(p, vec2(0.06, -0.12), vec2(0.16, 0.0), 0.04));
  return d;
}
`;

const MAIN_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_res;
${HAND_GLSL}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = (vUv - 0.5) * vec2(aspect, 1.0);

  // Two hands, mirrored, reaching toward each other.
  vec2 pL = (uv - vec2(-0.22, -0.02));
  vec2 pR = (uv - vec2( 0.22, -0.02)); pR.x = -pR.x;   // mirror
  float dL = hand(pL);
  float dR = hand(pR);
  float d = min(dL, dR);

  float mask = smoothstep(0.008, 0.0, d);
  // Fake shading: rim from the SDF gradient magnitude, plus a vertical gradient.
  float rim = smoothstep(0.05, 0.0, abs(d)) ; // near the edge
  float breathe = 0.9 + 0.1 * sin(u_time * 0.6);

  vec3 glove = vec3(0.12, 0.30, 0.58) * breathe;
  vec3 hi = vec3(0.45, 0.65, 0.95);
  vec3 col = vec3(0.015, 0.02, 0.03);           // dark background
  col = mix(col, glove, mask);
  col = mix(col, hi, rim * mask * 0.6);         // rim light
  // Vertical falloff for form.
  col *= mix(0.7, 1.15, uv.y + 0.5);

  gl_FragColor = vec4(col, 1.0);
}
`;

const BG_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_res;
${NOISE_GLSL}

// Petal: small ellipse with a notch, tumbling.
float petal(vec2 uv, float seed, float aspect) {
  float fall = fract(seed - u_time * (0.02 + seed * 0.02));
  float x = hash(vec2(seed, 4.0)) * aspect + sin(u_time * 0.3 + seed * 12.0) * 0.04;
  vec2 c = vec2(x, 1.0 - fall);
  vec2 d = uv - c;
  // Tumble rotation.
  float a = u_time * (0.3 + seed) + seed * 30.0;
  mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
  d = R * d;
  return smoothstep(0.03, 0.02, length(d * vec2(1.0, 2.2)));
}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = vUv * vec2(aspect, 1.0);

  vec3 col = vec3(0.02, 0.012, 0.016);
  // Sparse petals.
  for (int i = 0; i < 14; i++) {
    float seed = hash(vec2(float(i), 1.0));
    float p = petal(uv, seed + float(i) * 0.06, aspect);
    col = mix(col, vec3(0.29, 0.08, 0.14), p);   // dark rose
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

"use client";

/**
 * Borboletas — a paper swan on a dark-green lake.
 *
 * Main: a dark-green water shader (same height/normal technique as Água, green
 * palette, tiny amplitude) with a folded-paper (origami) swan silhouette drawn on
 * top from a few triangle SDFs, gently bobbing and casting a soft reflection.
 *
 * Background: none — the chapter page uses a plain background for this one.
 *
 * Uniforms: u_time, u_res.
 */

import ShaderQuad from "../ShaderQuad";
import { NOISE_GLSL } from "../shaders/noise";

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_res;
${NOISE_GLSL}

float lakeHeight(vec2 p) {
  float t = u_time * 0.15;
  return fbm(p * 1.4 + vec2(t, t * 0.5)) * 0.5;
}

// Signed area test for a triangle (barycentric sign), returns 1 inside.
float tri(vec2 p, vec2 a, vec2 b, vec2 c) {
  float d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
  float d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y);
  float d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
  bool hasNeg = (d1 < 0.0) || (d2 < 0.0) || (d3 < 0.0);
  bool hasPos = (d1 > 0.0) || (d2 > 0.0) || (d3 > 0.0);
  return (hasNeg && hasPos) ? 0.0 : 1.0;
}

// Origami swan from a handful of folded facets. Returns coverage + shade.
vec2 swan(vec2 p) {
  // Body: two facets (light / shadow) as a wide low triangle pair.
  float bodyA = tri(p, vec2(-0.22, -0.02), vec2(0.10, -0.02), vec2(-0.05, 0.10));
  float bodyB = tri(p, vec2(-0.22, -0.02), vec2(-0.05, 0.10), vec2(-0.30, 0.06));
  // Neck: thin slanted triangle rising to the right.
  float neck = tri(p, vec2(0.04, 0.04), vec2(0.12, 0.04), vec2(0.20, 0.30));
  // Head/beak.
  float head = tri(p, vec2(0.18, 0.28), vec2(0.28, 0.30), vec2(0.22, 0.36));
  // Tail fold up-left.
  float tail = tri(p, vec2(-0.30, 0.06), vec2(-0.22, -0.02), vec2(-0.36, 0.16));

  float cover = clamp(bodyA + bodyB + neck + head + tail, 0.0, 1.0);
  // Shade: darker on the shadow facets to suggest folds.
  float shade = 1.0 - (bodyB + tail) * 0.35;
  return vec2(cover, shade);
}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 uv = vUv * vec2(aspect, 1.0);

  // Lake.
  vec2 p = uv * 4.0;
  float e = 0.01;
  float h = lakeHeight(p);
  float hx = lakeHeight(p + vec2(e, 0.0));
  vec3 n = normalize(vec3((h - hx), 0.1, 0.2));
  float spec = pow(max(dot(n, normalize(vec3(0.3, 0.7, 0.6))), 0.0), 30.0);
  vec3 water = mix(vec3(0.02, 0.09, 0.06), vec3(0.05, 0.16, 0.10), h + 0.5);
  water += vec3(0.4, 0.7, 0.5) * spec * 0.4;

  vec3 col = water;

  // Swan centered, bobbing.
  vec2 sp = (uv - vec2(aspect * 0.5, 0.5));
  sp.y -= sin(u_time * 0.8) * 0.015;
  float rot = sin(u_time * 0.5) * 0.03;
  mat2 R = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
  sp = R * sp / 1.1;

  // Soft reflection below.
  vec2 rp = vec2(sp.x, -sp.y - 0.12);
  vec2 refl = swan(rp);
  col = mix(col, vec3(0.85, 0.88, 0.85) * 0.25, refl.x * 0.25);

  vec2 s = swan(sp);
  vec3 paper = vec3(0.90, 0.90, 0.86) * s.y;
  col = mix(col, paper, s.x);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function Main({ mode: _mode }: { mode: "cover" | "banner" }) {
  return <ShaderQuad fragment={FRAG} speed={1} />;
}

// No background scene for Borboletas — chapter page uses a plain background.

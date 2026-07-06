"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Fullscreen fragment-shader quad. The vertex shader writes clip space directly
 * (a plane of size 2 covering NDC), so the camera is irrelevant and the whole
 * viewport is one quad. Provides uniforms:
 *   u_time  — seconds since mount
 *   u_res   — drawing-buffer resolution in pixels (for aspect correction)
 * plus any `uniforms` passed in. `varying vUv` runs 0..1 across the quad.
 *
 * When SceneFrame sets frameloop="demand" (offscreen / reduced-motion) useFrame
 * stops firing, so u_time freezes and the quad costs nothing.
 */

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export default function ShaderQuad({
  fragment,
  uniforms = {},
  speed = 1,
}: {
  fragment: string;
  uniforms?: Record<string, THREE.IUniform>;
  speed?: number;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  // Built once and only read during render (passed to <shaderMaterial>). Seeded
  // with the current size so the first (possibly only, in demand mode) frame has
  // the right aspect. Per-frame updates happen through the material ref below —
  // never by mutating this memoized object directly.
  const u = useMemo(
    () => ({
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(size.width, size.height) },
      ...uniforms,
    }),
    // Stable per scene; intentionally built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, delta) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.u_time.value += delta * speed;
    m.uniforms.u_res.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={fragment}
        uniforms={u}
      />
    </mesh>
  );
}

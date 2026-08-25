export const fragmentShaderA = /* glsl */ `
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    uv.x += sin(
      uv.y * 10.0 +
      uTime * 2.0
    ) * 0.05;

    gl_FragColor = vec4(
      uv.x,
      0.0,
      uv.y,
      1.0
    );
  }
`;

export const fragmentShaderB = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;

  varying vec2 vUv;

  void main() {
    float wave = sin(
      vUv.x * 15.0 +
      uTime * uSpeed
    );

    vec3 color = vec3(
      wave * 0.5 + 0.5,
      vUv.x,
      vUv.y
    );

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Vertex shader  → positions
// Fragment shader → colors/pixels
// (0, 0, 0) = black
// (1, 0, 0) = red
// (0, 1, 0) = green
// (0, 0, 1) = blue
// (1, 1, 1) = white
// alpha = 1.0 → fully opaque
// alpha = 0.5 → 50% transparent
// alpha = 0.0 → fully transparent

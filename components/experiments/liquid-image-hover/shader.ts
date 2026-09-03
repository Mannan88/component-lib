export const vertexShader = `
uniform vec2 uMouse;
uniform float uHover;
uniform float uRadius;
uniform float uStrength;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  float dist = distance(uv, uMouse);
  float influence = smoothstep(uRadius, 0.0, dist);
  pos.z -= influence * uStrength * uHover;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = `
uniform sampler2D uTexture;
varying vec2 vUv;
void main() {
  vec3 color = texture2D(uTexture, vUv).rgb;
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

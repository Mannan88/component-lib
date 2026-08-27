// Classic 3D simplex noise (Ashima Arts / Ian McEwan, MIT licensed).
const snoise3D = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

export const fragmentShaderA = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${snoise3D}

  void main() {
    float dist = distance(vUv, uMouse);
    float mouseInfluence = smoothstep(0.4, 0.0, dist);

    float n = snoise(vec3(vUv * 3.0, uTime * 0.3 + mouseInfluence * 2.0));
    n = n * 0.5 + 0.5;

    vec3 color = mix(vec3(0.05, 0.1, 0.3), vec3(0.9, 0.3, 0.6), n);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const fragmentShaderB = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${snoise3D}

  void main() {
    float dist = distance(vUv, uMouse);
    float mouseInfluence = smoothstep(0.2, 0.0, dist);

    float n1 = snoise(vec3(vUv * 4.0, uTime * 0.25));
    float n2 = snoise(vec3(vUv * 8.0, uTime * 0.4 + 10.0));
    float n = n1 * 0.6 + n2 * 0.4 + mouseInfluence * 0.8;
    n = n * 0.5 + 0.5;

    vec3 color = mix(vec3(0.0, 0.15, 0.2), vec3(0.1, 0.9, 0.8), n);
    gl_FragColor = vec4(color, 1.0);
  }
`;
export const fragmentShaderC = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${snoise3D}

  void main() {
    float dist = distance(vUv, uMouse);
    float mouseInfluence = smoothstep(0.4, 0.0, dist);
    float wave = sin(dist*20.0 - uTime*5.0);
    float n = snoise(vec3(vUv * 3.0, uTime * 0.3 + mouseInfluence * wave));
    n = n * 0.5 + 0.5;

    vec3 color = mix(vec3(0.5, 0.1, 0.9), vec3(0.1, 0.8, 0.3), n);
    gl_FragColor = vec4(color, 1.0);
  }
`;
export const fragmentShaderD = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${snoise3D}

  void main() {
    vec2 center = vec2(0.5);
    vec2 uv = vUv - center;
    float dist = length(uv);

    float influence = 1.0 - smoothstep(0.0, 0.5, dist);
    float angle = influence * 2.0 + uPhase;

    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = rotation * uv;
    float n = snoise(vec3(uv * 3.0, uTime * 0.3));
    n = n * 0.5 + 0.5;

    vec3 color = mix(vec3(0.1, 0.0, 0.4), vec3(0.1, 0.0, 0.8), n);
    gl_FragColor = vec4(color, 1.0);
  }
`;
export const fragmentShaderE = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${snoise3D}

  void main() {
    vec2 uv = vUv;
    float speed = uTime * 0.5 + uPhase * 0.5;
    vec3 noiseUv = vec3(uv.x * 6.0, uv.y * 6.0 - speed, uTime * 0.2);
    float noise1 = snoise(noiseUv);
    float noise2 = snoise(noiseUv + vec3(12.34));
    float distortionStrength = mix(0.04, 0.08, uHover);

    uv.x += noise1 * distortionStrength;
    uv.y += noise2 * (distortionStrength * 0.8);

    vec3 hotColor = vec3(1.0, 0.7, 0.1);
    vec3 coolColor = vec3(0.7, 0.0, 0.1);
    vec3 finalColor = mix(hotColor, coolColor, uv.y);

    float dist = distance(vUv, vec2(0.5));
    finalColor -= smoothstep(0.3, 0.8, dist) * 0.3;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
export const fragmentShaderF = /* glsl */ `
  uniform float uTime;
  uniform float uPhase; // Accelerates the twisting on hover
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {

    vec2 uv = vUv * 2.0 - 1.0;
    float mouseDist = distance(vUv, uMouse);
    float repulsion = smoothstep(0.4, 0.0, mouseDist) * uHover;
    vec2 dir = vUv - uMouse;
    if (length(dir) > 0.0) {
      dir = normalize(dir);
      uv += dir * repulsion * 0.5;
    }
    vec3 finalColor = vec3(0.0);

    for(float i = 1.0; i <= 5.0; i++) {

      float t = uPhase * 0.5 + (i * 1.234);
      float curve = sin(uv.y * 3.0 + t) * 0.4 + cos(uv.y * 5.0 - t * 0.7) * 0.2;
      float dist = abs(uv.x - curve);
      float core = smoothstep(0.015, 0.005, dist);
      float glow = smoothstep(0.15, 0.0, dist) * 0.4;

      vec3 strandColor = vec3(
        sin(i) * 0.5 + 0.5,
        0.1 + uHover * 0.3,
        1.0
      );

      finalColor += strandColor * (core + glow);
    }
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

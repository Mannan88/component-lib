"use client";

import { useEffect, useRef } from "react";
import { Geist_Mono } from "next/font/google";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap" });
const CONFIG = {
  colors: {
    background: "#07090d",
    letter: "#5d6b82", // resting letter colour
    letterHover: "#f1f1f1",
  },

  sphere: {
    radius: 2.2, // world units
    letterCount: 3200, // more = denser sphere (instanced, so cheap)
    letterScale: 1.0, // letter size relative to spacing between letters
    charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]=+-*#%&@$",
    atlasCell: 64, // px per glyph in the texture atlas
    atlasWeight: 600, // font weight used when baking glyphs
  },

  hover: {
    radius: 0.8, // reach of the effect, measured along the surface
    falloff: 0.2, // >1 = tighter peak, <1 = flatter
    lift: 0.2, // how far the centre letter pops toward the camera
    spread: 0.4, // how far neighbours are pushed away (surface units)
    scaleBoost: 0.4, // extra scale at the centre (0 = none)
    followDuration: 0.4, // seconds – how smoothly the effect trails the cursor
    enterDuration: 0.6, // seconds – fade-in of the effect
    leaveDuration: 1.0, // seconds – fade-out of the effect
  },

  view: {
    fov: 40,
    cameraDistance: 8,
    minDistance: 4,
    maxDistance: 12,
    autoRotate: true,
    autoRotateSpeed: 0.6,
    damping: 0.06,
    backAlpha: 0.1,
    maxPixelRatio: 2,
  },
} as const;

const VERTEX = /* glsl */ `
  attribute vec3  aDir;    // unit vector of this letter on the sphere
  attribute float aGlyph;  // index of the glyph in the atlas
  attribute float aRand;   // per-letter random (tiny size variation)

  uniform float uRadius;
  uniform float uSize;
  uniform vec3  uHit;        // unit direction of the hover centre
  uniform float uStrength;   // 0..1, animated by gsap
  uniform float uInfluence;  // hover radius (surface units)
  uniform float uFalloff;
  uniform float uLift;
  uniform float uSpread;
  uniform float uScaleBoost;
  uniform float uBackAlpha;
  uniform vec2  uGrid;       // atlas columns, rows

  varying vec2  vUv;
  varying float vAlpha;
  varying float vHover;

  void main() {
    vec3 n = normalize(aDir);

    // --- distance from the hover centre, along the surface ---
    float ang = acos(clamp(dot(n, uHit), -1.0, 1.0));
    float r   = clamp(ang * uRadius / uInfluence, 0.0, 1.0); // 0 centre → 1 edge
    float t   = 1.0 - smoothstep(0.0, 1.0, r);
    float f   = pow(t, uFalloff) * uStrength;

    // --- spread: rotate the letter away from the centre along the sphere ---
    vec3 away = n - uHit * dot(n, uHit);
    float l = length(away);
    away = l > 1e-4 ? away / l : vec3(0.0);
    float push  = f * smoothstep(0.0, 0.35, r);         // centre stays put
    float shift = push * uSpread / uRadius;             // arc length → angle
    vec3 dir = n * cos(shift) + away * sin(shift);

    // --- lift toward the camera (centre = highest) ---
    vec3 pos = dir * (uRadius + uLift * f);

    // --- billboard quad: always faces the camera ---
    vec4 mv = viewMatrix * modelMatrix * vec4(pos, 1.0);
    float scale = uSize * (0.92 + 0.16 * aRand) * (1.0 + uScaleBoost * f);
    mv.xy += position.xy * scale;
    gl_Position = projectionMatrix * mv;

    // --- depth cue: far-side letters fade out ---
    vec3 wp = (modelMatrix * vec4(pos, 1.0)).xyz;
    float facing = dot(dir, normalize(cameraPosition - wp));
    vAlpha = mix(uBackAlpha, 1.0, smoothstep(-0.15, 0.35, facing));
    vHover = f;

    // --- atlas lookup ---
    vec2 cell = vec2(mod(aGlyph, uGrid.x), floor(aGlyph / uGrid.x));
    vUv = vec2(
      (cell.x + uv.x) / uGrid.x,
      1.0 - (cell.y + 1.0 - uv.y) / uGrid.y
    );
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec3 uColor;
  uniform vec3 uColorHover;

  varying vec2  vUv;
  varying float vAlpha;
  varying float vHover;

  void main() {
    float a = texture2D(uAtlas, vUv).a;
    if (a < 0.04) discard;
    vec3 col = mix(uColor, uColorHover, clamp(vHover * 1.25, 0.0, 1.0));
    gl_FragColor = vec4(col, a * vAlpha);
    #include <colorspace_fragment>
  }
`;

/** Bake the charset into a canvas texture (one glyph per grid cell). */
function buildAtlas(fontFamily: string, renderer: THREE.WebGLRenderer) {
  const chars = Array.from(CONFIG.sphere.charset);
  const cell = CONFIG.sphere.atlasCell;
  const cols = Math.ceil(Math.sqrt(chars.length));
  const rows = Math.ceil(chars.length / cols);

  const canvas = document.createElement("canvas");
  canvas.width = cols * cell;
  canvas.height = rows * cell;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${CONFIG.sphere.atlasWeight} ${cell * 0.78}px ${fontFamily}`;

  chars.forEach((c, i) => {
    const x = (i % cols) * cell + cell / 2;
    const y = Math.floor(i / cols) * cell + cell / 2 + cell * 0.04;
    ctx.fillText(c, x, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;

  return { texture, cols, rows, count: chars.length };
}

/** Evenly distributed points on a unit sphere (Fibonacci lattice). */
function fibonacciSphere(n: number) {
  const out = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * golden;
    out[i * 3] = Math.cos(phi) * r;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = Math.sin(phi) * r;
  }
  return out;
}

/* COMPONENT */
export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    const init = () => {
      if (disposed) return;
      const { sphere, hover, view, colors } = CONFIG;

      /* renderer / scene / camera  */
      const renderer = new THREE.WebGLRenderer({
        antialias: false, // glyph quads don't need MSAA
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, view.maxPixelRatio));
      renderer.domElement.style.display = "block";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(view.fov, 1, 0.1, 100);
      camera.position.set(0, 0.6, view.cameraDistance);

      /*  orbit controls  */
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = view.damping;
      controls.minDistance = view.minDistance;
      controls.maxDistance = view.maxDistance;
      controls.autoRotate = view.autoRotate;
      controls.autoRotateSpeed = view.autoRotateSpeed;

      /*  glyph atlas  */
      const atlas = buildAtlas(geistMono.style.fontFamily, renderer);

      /*   instanced geometry (one quad per letter)   */
      const N = sphere.letterCount;
      const base = new THREE.PlaneGeometry(1, 1);
      const geometry = new THREE.InstancedBufferGeometry();
      geometry.index = base.index;
      geometry.setAttribute("position", base.getAttribute("position"));
      geometry.setAttribute("uv", base.getAttribute("uv"));
      geometry.instanceCount = N;

      const glyphs = new Float32Array(N);
      const rands = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        glyphs[i] = Math.floor(Math.random() * atlas.count);
        rands[i] = Math.random();
      }
      geometry.setAttribute("aDir", new THREE.InstancedBufferAttribute(fibonacciSphere(N), 3));
      geometry.setAttribute("aGlyph", new THREE.InstancedBufferAttribute(glyphs, 1));
      geometry.setAttribute("aRand", new THREE.InstancedBufferAttribute(rands, 1));

      /*   material   */
      // approx. spacing between neighbouring letters on the surface
      const spacing = Math.sqrt((4 * Math.PI * sphere.radius ** 2) / N);

      const uniforms = {
        uAtlas: { value: atlas.texture },
        uGrid: { value: new THREE.Vector2(atlas.cols, atlas.rows) },
        uRadius: { value: sphere.radius },
        uSize: { value: spacing * sphere.letterScale },
        uHit: { value: new THREE.Vector3(0, 0, 1) },
        uStrength: { value: 0 },
        uInfluence: { value: hover.radius },
        uFalloff: { value: hover.falloff },
        uLift: { value: hover.lift },
        uSpread: { value: hover.spread },
        uScaleBoost: { value: hover.scaleBoost },
        uBackAlpha: { value: view.backAlpha },
        uColor: { value: new THREE.Color(colors.letter) },
        uColorHover: { value: new THREE.Color(colors.letterHover) },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false; // positions are computed in the shader
      scene.add(mesh);

      /*   hover state (animated with gsap)   */
      const state = { x: 0, y: 0, z: 1, s: 0 };
      const qx = gsap.quickTo(state, "x", { duration: hover.followDuration, ease: "power3.out" });
      const qy = gsap.quickTo(state, "y", { duration: hover.followDuration, ease: "power3.out" });
      const qz = gsap.quickTo(state, "z", { duration: hover.followDuration, ease: "power3.out" });

      const raycaster = new THREE.Raycaster();
      const hitSphere = new THREE.Sphere(new THREE.Vector3(), sphere.radius);
      const ndc = new THREE.Vector2();
      const point = new THREE.Vector3();
      let pointerInside = false;
      let hovering = false;

      const setHovering = (on: boolean) => {
        if (hovering === on) return;
        hovering = on;
        gsap.to(state, {
          s: on ? 1 : 0,
          duration: on ? hover.enterDuration : hover.leaveDuration,
          ease: on ? "power2.out" : "power2.inOut",
          overwrite: "auto",
        });
      };

      const updateHit = () => {
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.ray.intersectSphere(hitSphere, point)) {
          point.normalize();
          if (!hovering) {
            // snap the centre to the cursor so it doesn't slide in from the old spot
            state.x = point.x;
            state.y = point.y;
            state.z = point.z;
          }
          qx(point.x);
          qy(point.y);
          qz(point.z);
          setHovering(true);
        } else {
          setHovering(false);
        }
      };

      const onMove = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        ndc.set(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        pointerInside = true;
      };
      const onLeave = () => {
        pointerInside = false;
        setHovering(false);
      };

      const el = renderer.domElement;
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerdown", onMove);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("pointercancel", onLeave);

      /*   resize   */
      const resize = () => {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(container);
      resize();

      /*   render loop   */
      renderer.setAnimationLoop(() => {
        controls.update();
        // re-test every frame so the effect also follows auto-rotation / orbiting
        if (pointerInside) updateHit();
        uniforms.uHit.value.set(state.x, state.y, state.z).normalize();
        uniforms.uStrength.value = state.s;
        renderer.render(scene, camera);
      });

      /*  cleanup  */
      cleanup = () => {
        renderer.setAnimationLoop(null);
        ro.disconnect();
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerdown", onMove);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("pointercancel", onLeave);
        gsap.killTweensOf(state);
        controls.dispose();
        geometry.dispose();
        base.dispose();
        material.dispose();
        atlas.texture.dispose();
        renderer.dispose();
        if (el.parentNode === container) container.removeChild(el);
      };
    };

    // Make sure Geist Mono is actually loaded before baking it into the atlas.
    document.fonts
      .load(`${CONFIG.sphere.atlasWeight} 64px ${geistMono.style.fontFamily}`, CONFIG.sphere.charset)
      .catch(() => {})
      .then(init);

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <main
      className={`${geistMono.className} relative h-screen w-full overflow-hidden`}
      style={{ background: CONFIG.colors.background }}
    >
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      <p
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 select-none text-xs"
        style={{ color: CONFIG.colors.letter }}
      >
        drag to rotate · hover to disturb
      </p>
    </main>
  );
}

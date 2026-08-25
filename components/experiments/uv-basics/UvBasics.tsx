"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { fragmentShaderA, fragmentShaderB } from "./shader";

type Uniforms = Record<string, THREE.IUniform>;

type PlaneConfig = {
  fragmentShader: string;
  position?: THREE.Vector3Tuple;
  scale?: THREE.Vector2Tuple;
  uniforms?: Uniforms;
  onFrame?: (uniforms: Uniforms, time: number) => void;
};

type Plane = {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  onFrame?: PlaneConfig["onFrame"];
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`;

export default function UvBasics() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 🛑 CRITICAL FIX for the infinite vertical expansion loop
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    container.appendChild(renderer.domElement);
    const geometry = new THREE.PlaneGeometry(1, 1);

    const planes: Plane[] = [];

    const addPlane = ({
      fragmentShader,
      position = [0, 0, 0],
      scale = [1, 1],
      uniforms = {},
      onFrame,
    }: PlaneConfig) => {
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2() },
          ...uniforms,
        },
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(scale[0], scale[1], 1);

      scene.add(mesh);

      planes.push({ mesh, material, onFrame });
      return mesh;
    };

    // Planes (3x2 Grid)
    const offset = 1.2; // 1.0 width + 0.2 spacing
    const onFrameUpdate = (uniforms: Uniforms, time: number) => {
      uniforms.uTime.value = time;
    };

    // Top Row
    addPlane({ fragmentShader: fragmentShaderA, position: [-offset, offset / 2, 0], onFrame: onFrameUpdate });
    addPlane({ fragmentShader: fragmentShaderB, position: [0, offset / 2, 0], onFrame: onFrameUpdate });
    addPlane({ fragmentShader: fragmentShaderA, position: [offset, offset / 2, 0], onFrame: onFrameUpdate });

    // Bottom Row
    addPlane({ fragmentShader: fragmentShaderB, position: [-offset, -offset / 2, 0], onFrame: onFrameUpdate });
    addPlane({ fragmentShader: fragmentShaderA, position: [0, -offset / 2, 0], onFrame: onFrameUpdate });
    addPlane({ fragmentShader: fragmentShaderB, position: [offset, -offset / 2, 0], onFrame: onFrameUpdate });


    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;

      renderer.setSize(width, height, false);

      const aspect = width / height;
      const requiredWidth = 3.6;
      const requiredHeight = 2.4;

      let camHeight = requiredHeight;
      let camWidth = camHeight * aspect;

      if (camWidth < requiredWidth) {
        camWidth = requiredWidth;
        camHeight = camWidth / aspect;
      }
      camera.left = -camWidth / 2;
      camera.right = camWidth / 2;
      camera.top = camHeight / 2;
      camera.bottom = -camHeight / 2;
      camera.updateProjectionMatrix();

      planes.forEach(({ material }) => {
        material.uniforms.uResolution.value.set(width, height);
      });
    });

    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let frameId = 0;

    const render = () => {
      const time = clock.getElapsedTime();
      planes.forEach((plane) => plane.onFrame?.(plane.material.uniforms, time));
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      planes.forEach(({ mesh, material }) => {
        scene.remove(mesh);
        material.dispose();
      });
      geometry.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // overflow-hidden prevents any stray scrollbars from triggering a resize event loop
  return <div ref={containerRef} className="h-full w-full overflow-hidden" />;
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { fragmentShaderA, fragmentShaderB } from "./shader";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

type Uniforms = Record<string, THREE.IUniform>;

type PlaneConfig = {
  fragmentShader: string;
  position?: [number, number, number];
  scale?: [number, number];
  uniforms?: Uniforms;
  onFrame?: (uniforms: Uniforms, time: number) => void;
};

export default function NoiseGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(1, 1);

    const planes: {
      mesh: THREE.Mesh;
      material: THREE.ShaderMaterial;
      onFrame?: PlaneConfig["onFrame"];
    }[] = [];

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
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          ...uniforms,
        },
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(scale[0], scale[1], 1);
      scene.add(mesh);

      planes.push({ mesh, material, onFrame });
    };

    const gap = 0.2;
    const columnWidth = 1;
    const rowHeight = 1;
    const x = columnWidth + gap;
    const y = rowHeight + gap;

    const updateTime = (uniforms: Uniforms, time: number) => {
      uniforms.uTime.value = time;
    };

    addPlane({ fragmentShader: fragmentShaderA, position: [-x, y / 2, 0], onFrame: updateTime });
    addPlane({ fragmentShader: fragmentShaderB, position: [0, y / 2, 0], onFrame: updateTime });
    addPlane({ fragmentShader: fragmentShaderA, position: [x, y / 2, 0], onFrame: updateTime });
    addPlane({ fragmentShader: fragmentShaderB, position: [-x, -y / 2, 0], onFrame: updateTime });
    addPlane({ fragmentShader: fragmentShaderA, position: [0, -y / 2, 0], onFrame: updateTime });
    addPlane({ fragmentShader: fragmentShaderB, position: [x, -y / 2, 0], onFrame: updateTime });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      renderer.setSize(width, height, false);

      const aspect = width / height;
      const requiredWidth = 3.6;
      const requiredHeight = 2.4;

      let cameraHeight = requiredHeight;
      let cameraWidth = cameraHeight * aspect;

      if (cameraWidth < requiredWidth) {
        cameraWidth = requiredWidth;
        cameraHeight = cameraWidth / aspect;
      }

      camera.left = -cameraWidth / 2;
      camera.right = cameraWidth / 2;
      camera.top = cameraHeight / 2;
      camera.bottom = -cameraHeight / 2;
      camera.updateProjectionMatrix();

      planes.forEach(({ material }) => {
        material.uniforms.uResolution.value.set(width, height);
      });
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const clock = new THREE.Clock();
    let frameId = 0;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-100, -100);

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const render = () => {
      const time = clock.getElapsedTime();

      planes.forEach((plane) => {
        plane.onFrame?.(plane.material.uniforms, time);
      });

      raycaster.setFromCamera(pointer, camera);
      const meshes = planes.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const hoveredPlane = planes.find((p) => p.mesh === hit.object);
        if (hoveredPlane && hit.uv) {
          hoveredPlane.material.uniforms.uMouse.value.copy(hit.uv);
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    container.addEventListener("pointermove", onPointerMove);
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
      container.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full overflow-hidden" />;
}

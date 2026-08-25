"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/Addons.js";

type Layer = {
  mesh: THREE.Mesh;
  position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute;
  amplitudeScale: number;
};

export default function NoiseFunction() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const simplex = new SimplexNoise();
    const frequency = 0.08;
    const amplitude = 5;
    const speed = 0.5;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, -60, 100);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // --- describe each layer as data, not as hand-named variables ---
    const layerConfigs = [
      { color: 0x000077, amplitudeScale: 1, zOffset: 0 },
      { color: 0xbb0077, amplitudeScale: 0.8, zOffset: -8 },
      { color: 0x00bb77, amplitudeScale: 0.6, zOffset: -16 },
    ];

    const layers: Layer[] = layerConfigs.map(({ color, amplitudeScale, zOffset }) => {
      const geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
      const material = new THREE.MeshBasicMaterial({ color, wireframe: true });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = zOffset; // separates layers so they're visually distinct, not overlapping exactly
      scene.add(mesh);

      return {
        mesh,
        position: geometry.attributes.position,
        amplitudeScale,
      };
    });

    let animationId: number;
    function animate(time: number) {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = time * 0.001;

      // compute noise once per vertex index, apply to every layer that wants it
      for (let i = 0; i < layers[0].position.count; i++) {
        const x = layers[0].position.getX(i);
        const y = layers[0].position.getY(i);
        const noiseValue = simplex.noise3d(
          x * frequency,
          y * frequency,
          elapsedTime * speed
        );

        for (const layer of layers) {
          layer.position.setZ(i, noiseValue * amplitude * layer.amplitudeScale);
        }
      }

      for (const layer of layers) {
        layer.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      for (const layer of layers) {
        layer.mesh.geometry.dispose();
        (layer.mesh.material as THREE.Material).dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "600px" }} />;
}

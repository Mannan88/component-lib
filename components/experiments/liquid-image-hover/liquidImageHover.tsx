"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shader";

export default function LiquidImageHover() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 3.17;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);
    const geometry = new THREE.PlaneGeometry(1, 1, 64, 64);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
        uRadius: { value: 0.35 },
        uStrength: { value: 0.45 },
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2() },
        uImageResolution: { value: new THREE.Vector2(1, 1) },
      },
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    let imageAspect = 1;
    const loader = new THREE.TextureLoader();
    loader.load(
      "/component-lib/texture2.jpg",
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        material.uniforms.uTexture.value = texture;
        material.uniforms.uImageResolution.value.set(texture.image.width, texture.image.height);
        imageAspect = texture.image.width / texture.image.height;
        resize();
      },
      undefined,
      (error) => console.error(error)
    );
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      material.uniforms.uResolution.value.set(width, height);
      const vFov = (camera.fov * Math.PI) / 180;
      const planeHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
      const planeWidth = planeHeight * camera.aspect;
      const viewportAspect = planeWidth / planeHeight;
      if (viewportAspect > imageAspect) {
        mesh.scale.set(planeHeight * imageAspect, planeHeight, 1);
      } else {
        mesh.scale.set(planeWidth, planeWidth / imageAspect, 1);
      }
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    const targetMouse = new THREE.Vector2(0.5, 0.5);
    let targetHover = 0;
    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouse.set((event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height);
    };
    const onPointerEnter = () => { targetHover = 1; };
    const onPointerLeave = () => { targetHover = 0; };
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerenter", onPointerEnter);
    container.addEventListener("pointerleave", onPointerLeave);
    let frameId = 0;
    const render = () => {
      material.uniforms.uMouse.value.lerp(targetMouse, 0.1);
      material.uniforms.uHover.value += (targetHover - material.uniforms.uHover.value) * 0.08;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointerleave", onPointerLeave);
      geometry.dispose();
      material.uniforms.uTexture.value?.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={containerRef} className="h-full w-full overflow-hidden" />;
}

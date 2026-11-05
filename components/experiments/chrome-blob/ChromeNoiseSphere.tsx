"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";
import { OrbitControls, SimplexNoise } from "three/examples/jsm/Addons.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type ChromeNoiseSphereHandle = {
  setAmplitude: (value: number) => void;
  setMetalness: (value: number) => void;
  setRoughness: (value: number) => void;
  setIridescence: (value: number) => void;
};

type ChromeNoiseSphereProps = {
  initialAmplitude?: number;
  frequency?: number;
  speed?: number;
  metalness?: number;
  roughness?: number;
  iridescence?: number;
  color?: string;
};

const ChromeNoiseSphere = forwardRef<ChromeNoiseSphereHandle, ChromeNoiseSphereProps>(
  function ChromeNoiseSphere(
    {
      initialAmplitude = 0.15,
      frequency = 1.5,
      speed = 0.3,
      metalness = 1,
      roughness = 0.15,
      iridescence = 0.6,
      color = "#ffffff",
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Refs for real-time updates
    const amplitudeRef = useRef(initialAmplitude);
    const metalnessRef = useRef(metalness);
    const roughnessRef = useRef(roughness);
    const iridescenceRef = useRef(iridescence);

    useImperativeHandle(ref, () => ({
      setAmplitude: (value: number) => {
        amplitudeRef.current = value;
      },
      setMetalness: (value: number) => {
        metalnessRef.current = value;
      },
      setRoughness: (value: number) => {
        roughnessRef.current = value;
      },
      setIridescence: (value: number) => {
        iridescenceRef.current = value;
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const simplex = new SimplexNoise();
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        40,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 0, 6);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      container.appendChild(renderer.domElement);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRenderTarget.texture;

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
      keyLight.position.set(3, 3, 3);
      scene.add(keyLight);

      const geometry = new THREE.SphereGeometry(1, 128, 128);
      const position = geometry.attributes.position;
      const basePositions = position.array.slice();

      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        metalness,
        roughness,
      });

     //We use this to apply the iridescence before the object is sent for compiling.
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uHaloStrength = { value: iridescenceRef.current };
        material.userData.shader = shader;

    //replacing the GLSL which is about to be sent to for processing with some custom adjustments.
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <common>",
          `
          #include <common>

          uniform float uTime;
          uniform float uHaloStrength;
          `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <dithering_fragment>",
          /* glsl */ `
          vec3 viewDir = normalize(-vViewPosition);

          vec3 surfaceNormal = normalize(vNormal);

          float fresnel = pow(
            1.0 - abs(dot(surfaceNormal, viewDir)),
            3.0
          );

          float hue = fract(fresnel * 1.5 + uTime * 0.05);

          vec3 rainbow = vec3(
            abs(hue * 6.0 - 3.0) - 1.0,
            2.0 - abs(hue * 6.0 - 2.0),
            2.0 - abs(hue * 6.0 - 4.0)
          );

          rainbow = clamp(rainbow, 0.0, 1.0);

          gl_FragColor.rgb += rainbow * fresnel * uHaloStrength;

          #include <dithering_fragment>
          `
        );
      };

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const resize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enableZoom = false;

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      let animationId: number;

      function animate(time: number) {
        animationId = requestAnimationFrame(animate);
        const elapsedTime = time * 0.001;
        const amplitude = amplitudeRef.current;

        material.metalness = metalnessRef.current;
        material.roughness = roughnessRef.current;

        for (let i = 0; i < position.count; i++) {
          const ix = i * 3;
          const bx = basePositions[ix];
          const by = basePositions[ix + 1];
          const bz = basePositions[ix + 2];

          const noiseValue = simplex.noise3d(
            bx * frequency + elapsedTime * speed,
            by * frequency,
            bz * frequency
          );

          const displacement = 1 + noiseValue * amplitude;
          position.setXYZ(i, bx * displacement, by * displacement, bz * displacement);
        }

        position.needsUpdate = true;
        geometry.computeVertexNormals();

        mesh.rotation.y = elapsedTime * 0.15;

        if (material.userData.shader) {
          material.userData.shader.uniforms.uTime.value = elapsedTime;
          // Apply iridescence (halo strength) dynamically
          material.userData.shader.uniforms.uHaloStrength.value = iridescenceRef.current;
        }

        controls.update();
        renderer.render(scene, camera);
      }

      animationId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        envRenderTarget.texture.dispose();
        pmremGenerator.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        controls.dispose();
      };
    }, [frequency, speed, color]);

    return <div ref={containerRef} className="h-full w-full" />;
  }
);

export default ChromeNoiseSphere;

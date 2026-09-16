"use client";

import { useRef } from "react";
import ChromeNoiseSphere, {
  ChromeNoiseSphereHandle,
} from "./ChromeNoiseSphere";

export default function ChromeNoiseSphereDemo() {
  const sphereRef = useRef<ChromeNoiseSphereHandle>(null);

  return (
    <div className="relative h-screen w-full bg-[#0a0a0a] overflow-hidden">
      <ChromeNoiseSphere ref={sphereRef} initialAmplitude={0.15} />

      <div className="absolute top-1/2 left-8 -translate-y-1/2 translate-x-1/2 w-72 p-4 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl flex flex-col gap-4">
        <h2 className="text-white text-lg font-semibold tracking-wide border-b border-white/10 pb-2">
          Material Controls
        </h2>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-zinc-200 text-sm font-medium">Amplitude</label>
          </div>
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            defaultValue={0.15}
            onChange={(e) => sphereRef.current?.setAmplitude(Number(e.target.value))}
            className="w-full accent-violet-500 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-zinc-200 text-sm font-medium">Metalness</label>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={1}
            onChange={(e) => sphereRef.current?.setMetalness(Number(e.target.value))}
            className="w-full accent-violet-500 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-zinc-200 text-sm font-medium">Roughness</label>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={0.15}
            onChange={(e) => sphereRef.current?.setRoughness(Number(e.target.value))}
            className="w-full accent-violet-500 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-zinc-200 text-sm font-medium">Iridescence</label>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.01}
            defaultValue={0.6}
            onChange={(e) => sphereRef.current?.setIridescence(Number(e.target.value))}
            className="w-full accent-violet-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

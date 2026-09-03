"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const experimentComponents: Record<string, ComponentType> = {
  "uv-basics": dynamic(
    () => import("@/components/experiments/uv-basics/UvBasics"),
    { ssr: false }
  ),
  "noise": dynamic(
    () => import("@/components/experiments/noise-fun/NoiseFunciton"),
    {ssr: false}
  ),
  "noise-uv": dynamic(
    () => import('@/components/experiments/noise-uv/NoiseUVFunction'),
    {ssr:false}
  ),
  "liquid-img": dynamic(
    () => import('@/components/experiments/liquid-image-hover/liquidImageHover'),
    {ssr:false}
  ),
  "chrome-sphere": dynamic(
    () => import('@/components/experiments/chrome-blob/ChromeBlob'),
    {ssr:false}
  ),

};

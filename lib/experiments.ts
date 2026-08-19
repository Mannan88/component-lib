import dynamic from "next/dynamic";
import { ComponentType } from "react";

export type ExperimentCategory = "shader" | "physics" | "particles" | "misc";

export type Experiment = {
  slug: string;
  title: string;
  description: string;
  category: ExperimentCategory;
  tech: string[]; // e.g. ["Three.js", "GLSL", "Verlet"]
  date: string; // ISO date, for sorting "newest first"
  thumbnail?: string; // static preview image/gif path
  Component: ComponentType;
};

export const experiments: Experiment[] = [
  // {
  //   slug: "liquid-image-hover",
  //   title: "Liquid Image Hover",
  //   description: "Mouse-reactive UV distortion using simplex noise.",
  //   category: "shader",
  //   tech: ["Three.js", "GLSL"],
  //   date: "2026-08-20",
  //   thumbnail: "/thumbnails/liquid-image-hover.gif",
  //   Component: dynamic(
  //     () => import("@/components/experiments/liquid-image-hover/LiquidImageHover"),
  //     { ssr: false }
  //   ),
  // },
  // add new experiments here — one object per component
];

export function getExperiment(slug: string) {
  return experiments.find((e) => e.slug === slug);
}

export type ExperimentCategory = "shader" | "physics" | "particles" | "misc" | "3D";

export type Experiment = {
  slug: string;
  title: string;
  description: string;
  category: ExperimentCategory;
  tech: string[];
  date: string;
  thumbnail?: string;
};

export const experiments: Experiment[] = [
  {
    slug: "uv-basics",
    title: "UV Coordinate Basics",
    description: "Visualizing & Animating uv.x/uv.y in GLSL with mouse interaction.",
    category: "shader",
    tech: ["Three.js", "GLSL"],
    date: "2026-08-20",
    thumbnail:"/shader-thumbnail.png"
  },
  {
    slug: "noise",
    title: "Noise Function",
    description: "Visualizing and Animating noise using noise functions.",
    category: "shader",
    tech: ["Three.js", "Noise"],
    date: "2026-08-22",
    thumbnail:"/noise-thumbnail.png"
  },
  {
    slug: "noise-uv",
    title: "Noise Function added to UV Co-ords",
    description: "Visualizing and Animating UV co-ords using noise functions.",
    category: "shader",
    tech: ["Three.js", "GLSL","Noise"],
    date: "2026-08-26",
     thumbnail:"/noise-uv-thumbnail.png"
  },
  {
    slug: "liquid-img",
    title: "Liquid Distortion of Image",
    description: "Applying Distortion to Image using GLSL.",
    category: "shader",
    tech: ["Three.js", "GLSL"],
    date: "2026-08-30",
     thumbnail:"/liquid-img-thumbnail.png"
  },
  {
    slug: "chrome-sphere",
    title: "Chrome Sphere with Noise",
    description: "Animating Chrome Sphere using Noise function.",
    category: "3D",
    tech: ["Three.js", "Chrome","Noise"],
    date: "2026-08-30",
     thumbnail:"/chrome-sphere.png"
    },
  ];

export function getExperiment(slug: string) {
  return experiments.find((e) => e.slug === slug);
}

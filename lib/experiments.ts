export type ExperimentCategory = "shader" | "physics" | "particles" | "misc";

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
    tech: ["Three.js", "GLSL"],
    date: "2026-08-22",
    thumbnail:"/noise-thumbnail.png"
  },

  // add new experiment metadata here
];

export function getExperiment(slug: string) {
  return experiments.find((e) => e.slug === slug);
}

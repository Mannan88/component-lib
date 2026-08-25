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
    description: "Visualizing & Animating uv.x/uv.y.",
    category: "shader",
    tech: ["Three.js", "GLSL"],
    date: "2026-08-20",
  },
  {
    slug: "noise",
    title: "Noise Function",
    description: "Visualizing noise.",
    category: "shader",
    tech: ["Three.js", "GLSL"],
    date: "2026-08-22",
  },

  // add new experiment metadata here
];

export function getExperiment(slug: string) {
  return experiments.find((e) => e.slug === slug);
}

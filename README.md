# WebGL & Shader Experiments

**Live Demo:** [https://mannan88.github.io/component-lib/](https://mannan88.github.io/component-lib/)

A personal collection of WebGL, shader, and interaction experiments built with Next.js, TypeScript, Tailwind CSS, Three.js, and GSAP. 

Each experiment lives on its own route and serves as a small, self-contained study of a specific technique (fluid sims, raymarching, chrome materials, particle systems, physics-based motion, etc.). The goal of this repo is deliberate practice: understanding the underlying rendering and shader concepts from the ground up, rather than just shipping a polished visual.

## Structure

```text
/app
  page.tsx                     → Landing page, lists all experiments
  /components/[slug]/page.tsx  → Renders a single experiment full-screen

/components
  /experiments/<slug>/         → One folder per experiment (React component + GLSL code)
  /showcase/                   → Shared UI components (ExperimentCard, ExperimentFrame)

/lib
  experiments.ts               → Registry of all experiments (Single Source of Truth)

```
Adding a new experiment is straightforward:

1. Create a new folder under `components/experiments/<slug>/`.
2. Add a new entry to `lib/experiments.ts`.

Routing, the landing page grid, and the individual experiment pages all derive dynamically from that registry. Nothing else needs to be touched.

## Tech Stack

* **Next.js (App Router)** + **TypeScript**
* **Tailwind CSS** for layout and UI
* **Three.js** for 3D/WebGL scenes
* **GSAP** (`@gsap/react`) for animation and timelines
* Custom **GLSL** for vertex and fragment shaders

## Getting Started

Clone the repo, install dependencies, and run the development server:

```bash
npm install
npm run dev
# or yarn / pnpm / bun equivalents

```

Open [http://localhost:3000/component-lib/](https://www.google.com/search?q=http://localhost:3000/component-lib/) in your browser to see the experiment index. Click into any card to view that experiment on its own route.

*(Note: The `/component-lib/` base path is required locally to match the production routing).*

## Notes

* WebGL/canvas-based experiments are dynamically imported using `next/dynamic` with `ssr: false`. Since they depend heavily on browser-specific APIs (`window`, `HTMLCanvasElement`), this prevents server-side rendering errors and hydration mismatches.
* Thumbnails for the landing page are stored in `/public/thumbnails/`.

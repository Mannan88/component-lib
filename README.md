# Experiments

A personal collection of WebGL, shader, and interaction experiments — built with Next.js, TypeScript, Tailwind, Three.js, and GSAP.

Each experiment lives on its own route and is meant to be a small, self-contained study of a specific technique (fluid sims, raymarching, chrome materials, particle systems, physics-based motion, etc.) rather than a polished product. The goal is deliberate practice: understand the underlying rendering/shader concept, not just ship a visual.

## Structure

/app
page.tsx → landing page, lists all experiments
/components/[slug]/page.tsx → renders a single experiment full-screen

/components
/experiments/<slug>/ → one folder per experiment (component + shader code)
/showcase/ → shared UI: ExperimentCard, ExperimentFrame

/lib
experiments.ts → single source of truth: registry of all experiments


Adding a new experiment is just:
1. New folder under `components/experiments/<slug>/`.
2. One new entry in `lib/experiments.ts`.

Routing, the landing page grid, and the individual experiment page all derive from that registry — nothing else needs to be touched.

## Tech

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS** for layout/UI
- **Three.js** for 3D/WebGL scenes
- **GSAP** (`@gsap/react`) for animation/timelines
- Custom **GLSL** shaders per experiment where relevant

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the experiment index. Click into any card to view that experiment on its own route (`/components/<slug>`).

## Notes

- WebGL/canvas-based experiments are loaded with `next/dynamic` and `ssr: false`, since they depend on browser APIs (`window`, `canvas`) that can't render on the server. This avoids hydration mismatches.
- Thumbnails for the landing page live in `/public/thumbnails/` — short looping GIF/webp previews work best.

## Deploy

Deployed on [Vercel](https://vercel.com/new). Every experiment route is statically generated at build time via `generateStaticParams`.

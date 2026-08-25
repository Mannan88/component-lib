"use client"
import { experiments } from "@/lib/experiments";
import ExperimentCard from "@/components/showcase/ExperimentCard";

export default function Home() {
  const sorted = [...experiments].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto max-w-6xl  px-4 py-16">
      <h1 className="text-4xl font-bold">Experiments</h1>
      <p className="mt-2 text-gray-500">WebGL, shaders, and interaction studies.</p>

      <div className="mt-8 grid shrink-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((exp) => (
          <ExperimentCard key={exp.slug} experiment={exp} />
        ))}
      </div>
    </main>
  );
}

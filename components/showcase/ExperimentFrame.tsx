"use client"
import Link from "next/link";
import { ReactNode } from "react";
import { Experiment } from "@/lib/experiments";

export default function ExperimentFrame({
  experiment,
  children,
}: {
  experiment: Experiment;
  children: ReactNode;
}) {
  const { title, description, category, tech } = experiment;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
        <div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to experiments
          </Link>
          <h1 className="mt-1 text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
            {category}
          </span>
          {tech.map((t) => (
            <span
              key={t}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600"
            >
              {t}
            </span>
          ))}
        </div>
      </header>

      {/* the actual live component renders here, full width/height */}
      <div className="relative flex-1">{children}</div>
    </div>
  );
}

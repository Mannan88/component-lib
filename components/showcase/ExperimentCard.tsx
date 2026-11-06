"use client"
import Link from "next/link";
import Image from "next/image";
import { Experiment } from "@/lib/experiments";

export default function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const { slug, title, description, category, tech, thumbnail } = experiment;

  return (
    <Link
      href={`/components/${slug}`}
      className="group relative flex min-w-60 shrink-0 flex-col overflow-hidden rounded-2xl border border-(--foreground)/10 bg-(--background)/40 bg-linear-to-br from-(--foreground)/2 to-(--background)/60 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-(--foreground)/20 hover:shadow-2xl hover:shadow-(--foreground)/5 md:min-w-80"
    >
      {/* Subtle inner glass highlight */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-(--foreground)/4 to-transparent" />

      <div className="relative z-10 w-full overflow-hidden border-b border-(--foreground)/10 bg-(--foreground)/5 aspect-video">
        {thumbnail ? (
          <Image
            src={`/component-lib/${thumbnail}`}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-(--foreground)/40">
            No preview yet
          </div>
        )}

        {/* Floating Glass Category Pill */}
        <span className="absolute left-3 top-3 rounded-full border border-(--foreground)/15 bg-(--background)/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground shadow-sm backdrop-blur-md transition-colors group-hover:bg-(--background)/70">
          {category}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-(--foreground)/60">
          {description}
        </p>

        {/* Tech Stack Tags */}
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {tech.map((t) => (
            <span
              key={t}
              className="rounded-md border border-(--foreground)/5 bg-(--foreground)/5 px-2.5 py-1 text-xs font-medium text-(--foreground)/70 transition-all group-hover:border-(--foreground)/10 group-hover:bg-(--foreground)/10 group-hover:text-(--foreground)/90"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

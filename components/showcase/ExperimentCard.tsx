"use client"
import Link from "next/link";
import Image from "next/image";
import { Experiment } from "@/lib/experiments";

export default function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const { slug, title, description, category, tech, thumbnail } = experiment;

  return (
    <Link
      href={`/components/${slug}`}
      className="group shrink-0 min-w-60 md:min-w-80 block overflow-hidden rounded-md border border-gray-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {thumbnail ? (
          <Image
            src={`/component-lib/${thumbnail}`}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No preview yet
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-sm bg-gray-500 px-2 py-0.5 text-[9px] uppercase tracking-wide font-semibold text-white">
          {category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tech.map((t) => (
            <span
              key={t}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

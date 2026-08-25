"use client";

import { experimentComponents } from "./registry";

export default function ExperimentRenderer({ slug }: { slug: string }) {
  const Component = experimentComponents[slug];

  if (!Component) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        No component registered for &quot;{slug}&quot; yet.
      </div>
    );
  }

  return <Component />;
}

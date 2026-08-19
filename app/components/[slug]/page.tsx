import { notFound } from "next/navigation";
import { experiments, getExperiment } from "@/lib/experiments";
import ExperimentFrame from "@/components/showcase/ExperimentFrame";

export function generateStaticParams() {
  return experiments.map((e) => ({ slug: e.slug }));
}

export default function ExperimentPage({ params }: { params: { slug: string } }) {
  const experiment = getExperiment(params.slug);
  if (!experiment) return notFound();

  const { Component } = experiment;

  return (
    <ExperimentFrame experiment={experiment}>
      <Component />
    </ExperimentFrame>
  );
}

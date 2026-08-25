import { notFound } from "next/navigation";
import { experiments, getExperiment } from "@/lib/experiments";
import ExperimentRenderer from "@/components/experiments/ExperimentRenderer";
import ExperimentFrame from "@/components/showcase/ExperimentFrame";

export function generateStaticParams() {
  return experiments.map((e) => ({ slug: e.slug }));
}

export default async function ExperimentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experiment = getExperiment(slug);

  if (!experiment) return notFound();

  return (
    <ExperimentFrame experiment={experiment}>
      <ExperimentRenderer slug={slug} />
    </ExperimentFrame>
  );
}

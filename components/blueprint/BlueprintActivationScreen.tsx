import { BlueprintActivationCard } from "./BlueprintActivationCard";

type Pillar =
  | "Positioning"
  | "Messaging"
  | "Visibility"
  | "Credibility"
  | "Conversion";

export function BlueprintActivationScreen({
  brandName,
  resolvedPillars,
}: {
  brandName: string;
  resolvedPillars: Pillar[];
}) {
  return (
    <section className="max-w-4xl mx-auto py-16 space-y-10">
      <header>
        <h1 className="text-3xl font-semibold text-brand-navy">
          Your WunderBrand Blueprint™ is Ready
        </h1>
        <p className="mt-3 text-lg text-brand-midnight">
          Built specifically to activate what your WunderBrand Snapshot+™ revealed for{" "}
          {brandName}.
        </p>
      </header>

      <div className="grid gap-6">
        {resolvedPillars.map((pillar) => (
          <BlueprintActivationCard key={pillar} pillar={pillar} />
        ))}
      </div>
    </section>
  );
}

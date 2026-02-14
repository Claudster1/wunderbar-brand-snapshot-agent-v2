// components/blueprint/BlueprintActivationPanel.tsx

type BlueprintActivationProps = {
  brandName: string;
  resolvedPillars: string[];
};

export function BlueprintActivationPanel({
  brandName,
  resolvedPillars,
}: BlueprintActivationProps) {
  return (
    <section className="rounded-xl border p-8 bg-white">
      <h2 className="text-2xl font-semibold mb-4">
        Activate your brand strategy
      </h2>

      <p className="mb-6">
        Your WunderBrand Snapshot™ highlighted key opportunities.
        Blueprint™ turns those insights into usable systems for {brandName}.
      </p>

      <ul className="space-y-3 mb-6">
        {resolvedPillars.map((pillar) => (
          <li key={pillar} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-brand-blue" />
            <span>
              This Blueprint™ section strengthens your {pillar.toLowerCase()} foundation
            </span>
          </li>
        ))}
      </ul>

      <a href="/blueprint" className="btn-primary">
        Activate Blueprint™ →
      </a>
    </section>
  );
}

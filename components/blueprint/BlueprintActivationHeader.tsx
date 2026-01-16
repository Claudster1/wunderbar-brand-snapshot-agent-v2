// components/blueprint/BlueprintActivationHeader.tsx
// Header component for Blueprint activation page

export function BlueprintActivationHeader({
  businessName,
}: {
  businessName: string;
}) {
  return (
    <section className="mb-10">
      <h1 className="text-3xl font-semibold text-brand-navy mb-3">
        Your Brand Blueprint™ is Ready
      </h1>

      <p className="text-[17px] leading-relaxed max-w-3xl text-brand-midnight">
        This Blueprint™ builds directly on the insights from your Snapshot+™ and
        turns them into clear, actionable systems you can use across your brand
        and marketing.
      </p>

      <p className="mt-4 text-sm text-slate-600">
        Built specifically for {businessName}. Designed to be used — not just read.
      </p>
    </section>
  );
}

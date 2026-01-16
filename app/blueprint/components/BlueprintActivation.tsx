// app/blueprint/components/BlueprintActivation.tsx

export function BlueprintActivation({
  pillar,
  brandName,
}: {
  pillar: string;
  brandName: string;
}) {
  return (
    <section>
      <h2>{pillar} Activation</h2>
      <p>
        This Blueprint™ section builds directly on your Snapshot+™
        insights to strengthen how {brandName} shows up across
        every touchpoint.
      </p>

      <button>Access Blueprint™ Prompt Pack</button>
    </section>
  );
}

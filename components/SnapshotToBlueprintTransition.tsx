// components/SnapshotToBlueprintTransition.tsx
// Transition component from Snapshot+™ to Blueprint+™

export function SnapshotToBlueprintTransition({
  brandName,
  primaryPillar,
}: {
  brandName: string;
  primaryPillar: string;
}) {
  return (
    <section className="upgrade-block">
      <h3>Activate what matters most for {brandName}</h3>
      <p>
        Your Snapshot+™ shows that <strong>{primaryPillar}</strong> is the most
        important area to address right now. Brand Blueprint+™ turns this
        insight into a fully activated system your brand can actually use.
      </p>
      <a href="/blueprint-plus" className="btn-primary">
        Unlock Brand Blueprint+™
      </a>
    </section>
  );
}

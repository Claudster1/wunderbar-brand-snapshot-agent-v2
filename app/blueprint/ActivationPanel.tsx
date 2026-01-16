// app/blueprint/ActivationPanel.tsx
// Blueprint activation panel component

export function BlueprintActivation({
  primaryPillar,
  brandName
}: {
  primaryPillar: string;
  brandName: string;
}) {
  return (
    <section className="card">
      <h2>Activating Your Brand Blueprint™</h2>
      <p className="mt-2">
        This Blueprint builds directly on the clarity uncovered in your
        Brand Snapshot™ — especially around <strong>{primaryPillar}</strong>.
      </p>

      <p className="mt-3">
        Everything here is designed to give {brandName} a repeatable,
        AI-ready brand foundation you can actually use.
      </p>

      <p className="text-sm mt-2">
        Want deeper insight into <strong>{primaryPillar}</strong> and a
        prioritized action plan?
      </p>

      <a href="/snapshot-plus" className="btn-primary mt-3">
        Unlock My Snapshot+™
      </a>

      <p className="text-sm mt-2">
        Ready to turn this insight into a complete brand system?
      </p>

      <a href="/blueprint" className="btn-primary mt-3">
        Build My Brand Blueprint™
      </a>

      <p className="text-sm mt-2">
        Need deeper activation across campaigns, channels, and growth stages?
      </p>

      <a href="/blueprint-plus" className="btn-primary mt-3">
        Upgrade to Blueprint+™
      </a>
    </section>
  );
}

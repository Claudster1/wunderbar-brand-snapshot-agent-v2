import { getBlueprintActivationCopy } from "@/lib/blueprint/activationCopy";

export function BlueprintActivationCard({ pillar }: { pillar: string }) {
  const copy = getBlueprintActivationCopy(pillar);

  return (
    <div className="border rounded-xl p-6 bg-white shadow-sm">
      <h3 className="text-xl font-semibold text-brand-navy">{pillar}</h3>

      <p className="mt-2 text-brand-midnight">{copy.description}</p>

      <p className="mt-3 text-sm text-brand-blue font-medium">
        This directly activates your Snapshot+™ {pillar} insight.
      </p>

      <button className="btn-primary mt-5">Open {pillar} Prompts →</button>
    </div>
  );
}

import { blueprintPlusPrompts } from "@/lib/prompts/blueprintPlusPrompts";

type Props = {
  primaryPillar: string;
  context: {
    brandName: string;
    archetype: string;
    stage: "early" | "scaling" | "established";
  };
};

export function BlueprintPlusPrompts({ primaryPillar, context }: Props) {
  const prompts = blueprintPlusPrompts[primaryPillar] || [];

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-brand-navy">
        Advanced Prompt Pack
      </h2>

      {prompts.map((p) => (
        <div
          key={p.id}
          className="border border-brand-border rounded-lg p-6 bg-white"
        >
          <h3 className="font-semibold text-lg">{p.title}</h3>
          <p className="text-sm text-slate-600 mb-4">{p.description}</p>

          <pre className="bg-slate-50 p-4 rounded text-sm overflow-auto">
            {p.prompt({
              brandName: context.brandName,
              archetype: context.archetype,
              stage: context.stage,
              primaryPillar,
            })}
          </pre>

          <button
            onClick={() =>
              navigator.clipboard.writeText(
                p.prompt({
                  brandName: context.brandName,
                  archetype: context.archetype,
                  stage: context.stage,
                  primaryPillar,
                })
              )
            }
            className="mt-4 text-sm text-brand-blue hover:underline"
          >
            Copy Prompt
          </button>
        </div>
      ))}
    </section>
  );
}

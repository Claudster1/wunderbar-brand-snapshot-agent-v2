import { blueprintPlusPromptPacks } from "@/lib/blueprintPlus/promptPacks";

export function BlueprintPlusPromptDelivery() {
  return (
    <section className="max-w-5xl mx-auto py-16 space-y-12">
      <h1 className="text-3xl font-semibold text-brand-navy">
        Blueprint+™ Strategic Prompt Library
      </h1>

      {blueprintPlusPromptPacks.map((pack) => (
        <div key={pack.pillar} className="space-y-6">
          <h2 className="text-2xl font-semibold">{pack.pillar}</h2>

          {pack.prompts.map((p, i) => (
            <div key={i} className="border rounded-lg p-6 bg-white shadow-sm">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm mt-2">{p.description}</p>

              <textarea
                readOnly
                className="w-full mt-4 p-3 border rounded text-xs font-mono"
                rows={8}
                value={p.prompt.trim()}
              />

              <button
                className="btn-secondary mt-4"
                onClick={() => navigator.clipboard.writeText(p.prompt)}
              >
                Copy Prompt
              </button>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

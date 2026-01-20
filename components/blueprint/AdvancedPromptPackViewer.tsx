import { BLUEPRINT_PLUS_PROMPT_PACKS } from "@/lib/blueprint/advancedPromptPacks";

type Props = {
  resolvedPillars: string[];
};

export function AdvancedPromptPackViewer({ resolvedPillars }: Props) {
  const packs = BLUEPRINT_PLUS_PROMPT_PACKS.filter((p) =>
    resolvedPillars.includes(p.pillar.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {packs.map((pack) => (
        <section key={pack.pillar} className="border rounded-xl p-6 bg-white">
          <h3 className="text-xl font-semibold mb-4">{pack.title}</h3>

          <ul className="space-y-3">
            {pack.prompts.map((prompt, idx) => (
              <li
                key={idx}
                className="bg-gray-50 p-3 rounded flex justify-between text-sm"
              >
                <span>{prompt}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(prompt)}
                  className="text-brand-blue text-xs"
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

import { BLUEPRINT_PROMPT_PACKS } from "@/src/lib/prompts/blueprint/promptPacks";

type Props = {
  resolvedPillars: string[];
};

export function PromptPackViewer({ resolvedPillars }: Props) {
  const packs = BLUEPRINT_PROMPT_PACKS.filter((p) =>
    resolvedPillars.includes(p.pillar.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {packs.map((pack) => (
        <div key={pack.pillar} className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">{pack.title}</h3>

          <ul className="space-y-3">
            {pack.prompts.map((prompt, idx) => (
              <li
                key={idx}
                className="bg-gray-50 p-3 rounded text-sm flex justify-between"
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
        </div>
      ))}
    </div>
  );
}

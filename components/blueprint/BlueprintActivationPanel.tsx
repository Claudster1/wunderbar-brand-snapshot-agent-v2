// components/blueprint/BlueprintActivationPanel.tsx

import { buildBlueprintActivationSections } from "@/src/lib/blueprint/blueprintActivation";
import { BlueprintActivationInput } from "@/types/blueprint";

const pillarDisplayNames: Record<string, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

export function BlueprintActivationPanel({
  input,
}: {
  input: BlueprintActivationInput;
}) {
  const sections = buildBlueprintActivationSections(input);

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const pillarName = pillarDisplayNames[section.pillar] || section.pillar;
        
        return (
          <div
            key={section.pillar}
            className={`rounded-lg border p-6 ${
              section.isPrimary
                ? "border-brand-blue bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <h3 className="text-lg font-semibold mb-2">
              {section.title}
            </h3>

            <p className="text-sm text-gray-700 mb-3">
              This section activates the {pillarName} priorities identified in your Snapshot+™.
            </p>

            {section.body.map((line, i) => (
              <p key={i} className="text-sm text-gray-700 mb-2">
                {line}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

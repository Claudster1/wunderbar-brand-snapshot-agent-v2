// components/blueprint/BlueprintActivation.tsx
// Component for displaying Blueprint activation content based on primary pillar

import { blueprintPromptPacks } from "@/lib/blueprintPrompts";
import { PromptBlock } from "./PromptBlock";
import { rolePhrase } from "@/src/lib/roleLanguage";

interface BlueprintActivationProps {
  primaryPillar: string;
  userRoleContext?: string;
}

export function BlueprintActivation({
  primaryPillar,
  userRoleContext,
}: BlueprintActivationProps) {
  const pack = blueprintPromptPacks[primaryPillar.toLowerCase()];

  if (!pack) {
    return (
      <section>
        <h2 className="text-2xl font-semibold">
          Your Blueprint™ Activation
        </h2>
        <p className="mt-2 text-gray-600">
          No prompts available for this pillar.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold">
        Your Blueprint™ Activation
      </h2>

      <p className="mt-2 max-w-xl">
        Blueprint™ builds on your Snapshot+™ {primaryPillar} insights,
        activating them into a system designed to support you in{" "}
        {userRoleContext ? (
          <strong>{rolePhrase(userRoleContext)}</strong>
        ) : (
          <strong>leading your brand forward</strong>
        )}{" "}
        with clarity you can execute on.
      </p>

      {pack.prompts.map((p, i) => (
        <PromptBlock key={i} prompt={p} />
      ))}
    </section>
  );
}

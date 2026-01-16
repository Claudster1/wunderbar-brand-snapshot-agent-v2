// components/blueprint/BlueprintPlusActivation.tsx
// Component for displaying Blueprint+ activation prompts

"use client";

import { blueprintPlusPromptPacks } from "@/lib/blueprintPlusPromptPacks";
import { canAccessBlueprintPlus, ProductAccess } from "@/lib/accessControl";
import { BlueprintPlusLocked } from "./BlueprintPlusLocked";
import { PromptBlock } from "./PromptBlock";

export function BlueprintPlusActivation({
  access,
  userRole,
}: {
  access: ProductAccess;
  userRole?: string;
}) {
  if (!canAccessBlueprintPlus(access)) {
    return <BlueprintPlusLocked userRole={userRole} />;
  }

  return (
    <section>
      <h2 className="text-3xl font-semibold mb-4">
        Activate Blueprint+™
      </h2>

      <p className="max-w-xl mb-10">
        Blueprint+™ expands your brand system into a scalable,
        AI-ready growth engine.
      </p>

      {Object.entries(blueprintPlusPromptPacks).map(
        ([key, pack]) => (
          <div key={key} className="mb-10">
            <h3 className="text-xl font-semibold mb-3">
              {pack.title}
            </h3>

            {pack.prompts.map((prompt, i) => (
              <PromptBlock key={i} prompt={prompt} />
            ))}
          </div>
        )
      )}
    </section>
  );
}

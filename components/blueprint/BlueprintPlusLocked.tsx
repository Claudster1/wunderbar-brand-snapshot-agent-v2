// components/blueprint/BlueprintPlusLocked.tsx
// Component shown when user doesn't have Blueprint+ access

import { UpgradeButton } from "@/components/UpgradeButton";
import { rolePhrase } from "@/src/lib/roleLanguage";
import { UserRoleContext } from "@/src/types/snapshot";

interface BlueprintPlusLockedProps {
  userRole?: UserRoleContext | string;
}

export function BlueprintPlusLocked({ userRole }: BlueprintPlusLockedProps = {}) {
  return (
    <div className="border rounded-xl p-8 bg-slate-50">
      <h3 className="text-xl font-semibold mb-2">
        Activate your brand at scale
      </h3>

      <p className="mb-6 max-w-md">
        Blueprint+™ extends everything you've already clarified —
        turning it into a system designed to support you in{" "}
        <strong>{rolePhrase(userRole as UserRoleContext)}</strong> as your brand grows.
      </p>

      <p className="text-sm text-muted mb-6">
        Built for brands ready to move beyond clarity and into execution —
        without adding complexity to your workflow.
      </p>

      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Why Blueprint+™</h4>
        <p>
          Your Snapshot+™ identified what matters most right now.
          Blueprint+™ builds on that foundation to support you in{" "}
          <strong>{rolePhrase(userRole as UserRoleContext)}</strong> — with deeper systems,
          advanced prompts, and long-term brand consistency.
        </p>
      </div>

      <ul className="list-disc pl-5 mb-6 text-sm">
        <li>AI Answer Engine (AEO) + SEO strategy</li>
        <li>Campaign-level messaging prompts</li>
        <li>Cross-pillar orchestration</li>
        <li>AI-ready brand guardrails</li>
      </ul>

      <UpgradeButton product="blueprint_plus" />
    </div>
  );
}

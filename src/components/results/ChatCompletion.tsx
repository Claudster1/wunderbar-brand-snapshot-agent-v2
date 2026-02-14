// src/components/results/ChatCompletion.tsx
// Chat completion message component

import { rolePhrase } from "@/src/lib/roleLanguage";

interface ChatCompletionProps {
  userRoleContext?: string;
}

export function ChatCompletion({ userRoleContext }: ChatCompletionProps) {
  return (
    <div className="text-center py-4 sm:py-6 space-y-2">
      <p className="bs-h2 text-brand-navy">
        Your WunderBrand Snapshot™ is complete.
      </p>
      <p className="bs-body-sm text-brand-muted max-w-xl mx-auto">
        This snapshot gives you a clear view of how your brand is showing up today
        {userRoleContext ? (
          <> — specifically to support you in {rolePhrase(userRoleContext as import("@/src/types/snapshot").UserRoleContext)}.</>
        ) : (
          "."
        )}
      </p>
    </div>
  );
}

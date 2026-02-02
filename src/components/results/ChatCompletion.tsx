// src/components/results/ChatCompletion.tsx
// Chat completion message component

import { rolePhrase } from "@/src/lib/roleLanguage";

interface ChatCompletionProps {
  userRoleContext?: string;
}

export function ChatCompletion({ userRoleContext }: ChatCompletionProps) {
  return (
    <div className="text-center py-6 space-y-4">
      <p className="text-lg text-slate-600">
        Excellent — your Brand Snapshot™ is complete.
      </p>
      <p className="text-base text-slate-700 max-w-2xl mx-auto">
        This Brand Snapshot™ gives you a clear view of how your brand is showing up today
        {userRoleContext ? (
          <> — specifically to support you in {rolePhrase(userRoleContext as import("@/src/types/snapshot").UserRoleContext)}.</>
        ) : (
          "."
        )}
      </p>
    </div>
  );
}

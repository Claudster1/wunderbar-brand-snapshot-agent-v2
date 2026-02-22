import { rolePhrase } from "@/src/lib/roleLanguage";

interface ChatCompletionProps {
  userRoleContext?: string;
}

export function ChatCompletion({ userRoleContext }: ChatCompletionProps) {
  return (
    <div className="text-center py-6 sm:py-8 space-y-3">
      <p className="bs-h2 text-brand-navy">
        Your WunderBrand Snapshot™ is ready.
      </p>
      <p className="bs-body text-brand-midnight max-w-2xl mx-auto leading-relaxed">
        Below is a strategic diagnostic of how your brand performs across five core pillars — positioning, messaging, visibility, credibility, and conversion. Each score reflects where your brand stands today, and where focused effort will create the most impact
        {userRoleContext ? (
          <> — calibrated to support you in {rolePhrase(userRoleContext as import("@/src/types/snapshot").UserRoleContext)}.</>
        ) : (
          "."
        )}
      </p>
    </div>
  );
}

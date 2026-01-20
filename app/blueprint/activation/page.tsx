import { BlueprintPromptPanel } from "@/components/blueprint/BlueprintPromptPanel";

export default function BlueprintActivationPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold text-brand-navy">
          Activate Your Brand Blueprint™
        </h1>
        <p className="mt-3 text-brand-midnight max-w-3xl">
          These prompt packs translate your highest-impact Snapshot+™ insights
          into actionable guidance you can use immediately across strategy,
          messaging, and execution.
        </p>
      </header>

      <BlueprintPromptPanel />
    </main>
  );
}

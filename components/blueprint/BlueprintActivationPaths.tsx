import { trackImplementationInterest } from "@/lib/trackImplementationInterest";
import { pillarProblemMap } from "@/lib/pillarProblemMap";

export function BlueprintActivationPaths({
  primaryPillar,
  brandName,
}: {
  primaryPillar: string;
  brandName: string;
}) {
  return (
    <section className="max-w-4xl mx-auto py-16">
      <h2 className="text-2xl font-semibold text-brand-navy mb-4 text-center">
        How teams bring this Blueprint™ to life
      </h2>

      <p className="text-center text-slate-700 max-w-2xl mx-auto mb-12">
        Teams typically choose one of three paths. There’s no obligation — your
        Blueprint™ is fully usable on its own.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <ActivationCard
          title="Self-Led"
          description="Use the included frameworks and prompt packs to implement with your internal team."
          cta="Continue self-led →"
          href="/dashboard"
        />

        <ActivationCard
          title="Guided Implementation"
          description={`If you'd like support translating your ${
            pillarProblemMap[primaryPillar]
          } into action, we work alongside your team to shape direction, decisions, and execution.`}
          cta="Learn more →"
          href="/implementation-options?path=guided"
          path="guided"
          primaryPillar={primaryPillar}
          brandName={brandName}
        />

        <ActivationCard
          title="Done-For-You Implementation"
          description={`For teams that want this fully executed, we handle implementation across ${
            pillarProblemMap[primaryPillar]
          } — aligned to the priorities surfaced in your Snapshot+™.`}
          cta="Learn more →"
          href="/implementation-options?path=dfy"
          path="dfy"
          primaryPillar={primaryPillar}
          brandName={brandName}
        />
      </div>
    </section>
  );
}

function ActivationCard({
  title,
  description,
  cta,
  href,
  path,
  primaryPillar,
  brandName,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
  path?: "guided" | "dfy";
  primaryPillar?: string;
  brandName?: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
      <h3 className="font-semibold text-brand-navy mb-2">{title}</h3>
      <p className="text-[14px] text-slate-700 mb-4 leading-relaxed">
        {description}
      </p>
      <a
        href={href}
        onClick={() => {
          if (!path || !primaryPillar || !brandName) return;
          trackImplementationInterest({
            path,
            primaryPillar,
            brandName,
          });
        }}
        className="text-brand-blue font-medium hover:underline"
      >
        {cta}
      </a>
    </div>
  );
}

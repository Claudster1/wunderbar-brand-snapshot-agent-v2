type ProductTier = "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";

type Props = {
  productTier: ProductTier;
  archetype: string | null;
  messagePillars: string[];
};

type ChannelPlan = {
  channel: string;
  frequency: string;
  angle: string;
  minTier: ProductTier;
};

const tierRank: Record<ProductTier, number> = {
  snapshot: 0,
  snapshot_plus: 1,
  blueprint: 2,
  blueprint_plus: 3,
};

function canShow(current: ProductTier, required: ProductTier): boolean {
  return tierRank[current] >= tierRank[required];
}

export function ExecutionChannelPlans({ productTier, archetype, messagePillars }: Props) {
  const primaryMessage = messagePillars[0] || "core differentiation";
  const plans: ChannelPlan[] = [
    {
      channel: "Email Marketing",
      frequency: "1-2 sends/week",
      angle: `Use ${primaryMessage} in educational narratives and conversion nudges.`,
      minTier: "snapshot_plus",
    },
    {
      channel: "Social Media",
      frequency: "3-5 posts/week",
      angle: `Translate ${primaryMessage} into short-form thought leadership in ${archetype || "your"} voice.`,
      minTier: "snapshot_plus",
    },
    {
      channel: "SEO / AEO",
      frequency: "1 core + 2 supporting pieces/month",
      angle: "Anchor search topics to positioning and message pillars; prioritize answer-ready formats.",
      minTier: "blueprint",
    },
    {
      channel: "Website Messaging",
      frequency: "Bi-weekly optimization sprint",
      angle: "Align homepage and conversion pages to strongest pillar and objection-handling language.",
      minTier: "blueprint",
    },
    {
      channel: "Sales Enablement",
      frequency: "Weekly enablement update",
      angle: "Mirror brand narrative in pitch, objection handling, and proof sequencing.",
      minTier: "blueprint",
    },
    {
      channel: "Paid Media",
      frequency: "Weekly budget + creative iteration",
      angle: "Test persona- and funnel-stage variants while preserving brand consistency.",
      minTier: "blueprint_plus",
    },
  ];

  return (
    <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border">
      <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-2">
        Channel Plans
      </p>
      <h2 className="bs-h3 mb-2">Where to activate next</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {plans
          .filter((plan) => canShow(productTier, plan.minTier))
          .map((plan) => (
            <article key={plan.channel} className="rounded-lg border border-brand-border p-4">
              <p className="text-sm font-semibold text-brand-navy">{plan.channel}</p>
              <p className="bs-small text-brand-muted mt-1">Recommended frequency: {plan.frequency}</p>
              <p className="bs-body-sm text-brand-midnight mt-2">{plan.angle}</p>
            </article>
          ))}
      </div>
    </section>
  );
}

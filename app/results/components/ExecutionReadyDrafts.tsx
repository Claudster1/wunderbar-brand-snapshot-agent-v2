import type { BrandPromptContext } from "@/src/lib/prompts/promptLibrary";

type ProductTier = "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";

type Props = {
  productTier: ProductTier;
  brandContext: BrandPromptContext;
  messagePillars: string[];
};

function textValue(value: string | number | null | undefined, fallback: string): string {
  if (value == null) return fallback;
  const cleaned = String(value).trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

function extractPillars(value: string, fallbackPillars: string[]): string[] {
  const fromContext = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (fromContext.length > 0) return fromContext;
  return fallbackPillars.length > 0 ? fallbackPillars : ["Core brand promise"];
}

export function ExecutionReadyDrafts({ productTier, brandContext, messagePillars }: Props) {
  const brandName = textValue(brandContext.brand_name, "your brand");
  const archetype = textValue(brandContext.primary_archetype, "your");
  const positioning = textValue(
    brandContext.positioning_statement,
    `${brandName} helps its audience move from confusion to confident action with clear, differentiated messaging.`
  );
  const pillars = extractPillars(textValue(brandContext.message_pillars, ""), messagePillars).slice(0, 3);

  const socialDrafts = pillars.map((pillar, idx) => ({
    id: idx + 1,
    copy: `Post ${idx + 1}: ${pillar} — ${brandName} exists to make this outcome practical and repeatable. In ${archetype} voice: direct, clear, and useful.`,
  }));

  const blueprintSubjects = [
    `A clearer path to ${pillars[0] || "better outcomes"}`,
    `What most teams miss about ${pillars[1] || "brand consistency"}`,
    `How to improve ${pillars[2] || "activation confidence"} this quarter`,
    `The fastest way to strengthen brand alignment`,
    `Turn strategy into action this week`,
    `The one message your audience should hear first`,
    `A practical framework for on-brand activation`,
    `Your weekly momentum check-in`,
    `Where your message is strongest (and weakest)`,
    `From clarity to conversion: next steps`,
  ];

  return (
    <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand-muted mb-2">
          Ready-to-Use Content Drafts
        </p>
        <h2 className="bs-h3 mb-2">Activation copy you can use right away</h2>
        <p className="bs-body-sm text-brand-muted max-w-3xl">
          Drafts are auto-generated from your current diagnostic context and are meant to be edited in the workbook.
        </p>
      </div>

      <article className="rounded-lg border border-brand-border p-4">
        <p className="text-sm font-semibold text-brand-navy">Positioning Statement (Draft)</p>
        <p className="bs-body-sm text-brand-midnight mt-2">{positioning}</p>
      </article>

      <article className="rounded-lg border border-brand-border p-4">
        <p className="text-sm font-semibold text-brand-navy">Elevator Pitch (Draft)</p>
        <p className="bs-body-sm text-brand-midnight mt-2">
          {brandName} helps {textValue(brandContext.target_audience, "the right audience")} achieve
          stronger outcomes through a {archetype}-aligned brand system built for consistent activation.
        </p>
      </article>

      <article className="rounded-lg border border-brand-border p-4">
        <p className="text-sm font-semibold text-brand-navy">Social Drafts by Message Pillar</p>
        <div className="mt-2 space-y-2">
          {socialDrafts.map((post) => (
            <p key={post.id} className="bs-body-sm text-brand-midnight">
              {post.copy}
            </p>
          ))}
        </div>
      </article>

      {(productTier === "blueprint" || productTier === "blueprint_plus") && (
        <>
          <article className="rounded-lg border border-brand-border p-4">
            <p className="text-sm font-semibold text-brand-navy">Email Subject Line Library (10)</p>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              {blueprintSubjects.map((subject) => (
                <p key={subject} className="bs-small text-brand-midnight">
                  • {subject}
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-brand-border p-4">
            <p className="text-sm font-semibold text-brand-navy">Homepage Headline Options (3)</p>
            <p className="bs-body-sm text-brand-midnight mt-2">
              1) {brandName}: Clear positioning. Consistent activation. Measurable momentum.
            </p>
            <p className="bs-body-sm text-brand-midnight">
              2) Build a brand your team can activate without guesswork.
            </p>
            <p className="bs-body-sm text-brand-midnight">
              3) Turn brand strategy into daily action across every channel.
            </p>
          </article>
        </>
      )}

      {productTier === "blueprint_plus" && (
        <article className="rounded-lg border border-brand-border p-4">
          <p className="text-sm font-semibold text-brand-navy">Blueprint+ Persona and Channel Variants</p>
          <p className="bs-body-sm text-brand-midnight mt-2">
            Includes persona-specific message variants, channel-specific copy blocks, and campaign-cycle
            sequencing tied to your archetype and pillar priorities.
          </p>
        </article>
      )}
    </section>
  );
}

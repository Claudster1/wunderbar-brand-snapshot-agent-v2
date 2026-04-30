import {
  WUNDERBAR_IMPLEMENTATION_OPTIONS_URL,
  WUNDERBAR_IMPLEMENTATION_PATHS_URL,
} from "@/lib/wunderbarExternalUrls";

type ImplementationIntroProps = {
  /** Shorter band for paid tiers already moving into Foundation / Activation tabs. */
  variant?: "default" | "compact";
};

const externalLinkClass =
  "text-brand-blue font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded";

export function ImplementationIntro({ variant = "default" }: ImplementationIntroProps) {
  if (variant === "compact") {
    return (
      <section className="border-t border-brand-border/50 pt-6 sm:pt-7">
        <div className="max-w-2xl mx-auto text-center">
          <p className="bs-body-sm text-brand-muted leading-relaxed m-0">
            Ready to operationalize?{" "}
            <a
              href={WUNDERBAR_IMPLEMENTATION_OPTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={externalLinkClass}
            >
              Implementation options →
            </a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-brand-border/50 pt-8 sm:pt-9">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="bs-h3 mb-3">
          From diagnostic to activation
        </h3>

        <p className="bs-body-sm text-brand-muted leading-relaxed">
          A diagnostic creates clarity. Activation creates results. Whether your team
          implements these insights internally or you work with Wunderbar to operationalize
          them across positioning, messaging, visibility, and conversion — the goal is
          the same: turning what you now know into measurable brand performance.
        </p>

        <div className="mt-6">
          <a
            href={WUNDERBAR_IMPLEMENTATION_PATHS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 ${externalLinkClass}`}
          >
            Explore implementation paths &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}

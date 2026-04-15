import {
  WUNDERBAR_IMPLEMENTATION_OPTIONS_URL,
  WUNDERBAR_IMPLEMENTATION_PATHS_URL,
} from "@/lib/wunderbarExternalUrls";

type ImplementationIntroProps = {
  variant?: "default" | "compact";
};

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
              className="text-brand-blue font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded"
            >
              Implementation options →
            </a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-brand-border/50 pt-8 sm:pt-9 text-center">
      <h3 className="text-xl font-semibold text-brand-navy mb-3">
        Turning insight into action
      </h3>

      <p className="max-w-2xl mx-auto text-[15px] leading-relaxed text-slate-700">
        Some teams take these insights and implement them internally. Others
        choose to work with us to operationalize what you’re seeing here — across
        messaging, visibility, and conversion.
      </p>

      <div className="mt-6">
        <a
          href={WUNDERBAR_IMPLEMENTATION_PATHS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-brand-blue font-medium hover:underline"
        >
          Explore implementation options →
        </a>
      </div>
    </section>
  );
}

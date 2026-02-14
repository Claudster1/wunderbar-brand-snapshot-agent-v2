export default function BrandSuitePage() {
  return (
    <div className="w-full bg-white text-brand-midnight">
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl font-semibold text-brand-navy mb-4">
          A Smarter, Faster Way to Strengthen Your Brand
        </h1>

        <p className="text-lg text-brand-midnight leading-relaxed max-w-3xl mx-auto">
          The WunderBrand Suite™ gives founders and small businesses a clear,
          AI-powered path to understand, elevate, and align their brand — from a
          fast diagnostic to a complete strategic system.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a href="/brand-snapshot" className="btn-primary">
            Start Your Free WunderBrand Snapshot™ →
          </a>
          <a href="#suite" className="btn-secondary">
            Explore the Suite →
          </a>
        </div>
      </section>

      {/* SUITE CARDS */}
      <section id="suite" className="max-w-6xl mx-auto px-6 py-20 grid gap-12">
        <SuiteCard
          title="WunderBrand Snapshot™"
          price="Free"
          description="A fast diagnostic that reveals your WunderBrand Score™ and how you perform across the five core brand pillars."
          href="/brand-snapshot"
          features={[
            "WunderBrand Score™",
            "Pillar Scores",
            "Brief insights",
            "Personalized summary",
          ]}
        />

        <SuiteCard
          title="WunderBrand Snapshot+™"
          price="$497"
          description="A personalized deep-dive report with strategic insights, clarity opportunities, and a prioritized plan."
          href="/snapshot-plus"
          features={[
            "Full strategic analysis",
            "Pillar deep dives",
            "Clarity opportunity map",
            "First 5 brand actions",
            "AI-ready prompts (lite)",
          ]}
        />

        <SuiteCard
          title="WunderBrand Blueprint™"
          price="$997"
          description="Your complete AI-powered brand foundation — messaging, narrative, voice, and visual direction."
          href="/blueprint"
          features={[
            "Positioning system",
            "Messaging framework",
            "Voice & tone",
            "Brand narrative",
            "Visual direction",
            "Content prompts",
          ]}
        />

        <SuiteCard
          title="WunderBrand Blueprint+™"
          price="$1,997"
          description="Our most comprehensive system for growing businesses — advanced strategy, segmentation, and brand assets."
          href="/blueprint-plus"
          features={[
            "Everything in Blueprint™",
            "Audience segmentation",
            "Messaging matrix",
            "Color palette psychology",
            "Campaign-level prompts",
            "Brand themes",
          ]}
        />
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-navy text-white text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Start with clarity. Grow with confidence.
        </h2>

        <p className="max-w-2xl mx-auto mb-8">
          Choose the product that meets you where you are — and move forward with a clearer,
          more confident brand foundation.
        </p>

        <a href="/brand-snapshot" className="btn-primary-inverse">
          Start My Free WunderBrand Snapshot™ →
        </a>
      </section>
    </div>
  );
}

function SuiteCard({
  title,
  price,
  description,
  href,
  features,
}: {
  title: string;
  price: string;
  description: string;
  href: string;
  features: string[];
}) {
  return (
    <div className="border border-brand-border p-8 rounded-xl shadow-sm bg-white">
      <h3 className="text-2xl font-semibold text-brand-navy">{title}</h3>
      <p className="text-sm text-brand-blue font-semibold mt-1">{price}</p>

      <p className="mt-4 text-[15px] leading-relaxed">{description}</p>

      <ul className="mt-6 space-y-2 text-[15px] text-brand-midnight">
        {features.map((f, idx) => (
          <li key={idx}>• {f}</li>
        ))}
      </ul>

      <a
        href={href}
        className="inline-block mt-6 px-6 py-3 bg-brand-blue text-white rounded-md shadow hover:bg-brand-blueHover transition"
      >
        Learn More →
      </a>
    </div>
  );
}



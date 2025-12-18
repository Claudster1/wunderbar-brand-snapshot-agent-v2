export default function SnapshotPlusPage() {
  return (
    <div className="w-full bg-white text-brand-midnight">
      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-semibold text-brand-navy mb-4">
          Elevate Your Brand with Immediate, Personalized Strategic Insights
        </h1>

        <p className="text-lg text-brand-midnight leading-relaxed max-w-3xl mx-auto">
          Brand Snapshot+™ expands your free Brand Snapshot™ into a deeper, more
          actionable report — including tailored recommendations, clarity opportunities,
          and a prioritized plan for strengthening your brand.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/checkout/snapshot-plus"
            className="px-6 py-3 bg-brand-blue text-white font-semibold rounded-md shadow-lg hover:bg-brand-blueHover transition"
          >
            Unlock Brand Snapshot+™ →
          </a>

          <a
            href="#sample"
            className="px-6 py-3 border border-brand-blue text-brand-blue font-semibold rounded-md hover:bg-brand-gray transition"
          >
            See What’s Inside
          </a>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className="bg-brand-gray py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-brand-navy mb-4">
            Why Brand Snapshot+™ Exists
          </h2>

          <p className="text-brand-midnight leading-relaxed max-w-3xl">
            Your free Brand Snapshot™ reveals what’s working and where clarity may be missing.
            Snapshot+™ goes deeper — showing why, and what to do next, so you can strengthen your
            messaging, positioning, and customer experience with confidence.
          </p>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section id="sample" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-semibold text-brand-navy text-center mb-12">
          What’s Included in Brand Snapshot+™
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <Deliverable
            title="Strategic Brand Overview"
            items={[
              "Clear explanation of current brand perception",
              "Strengths and clarity gaps",
              "Opportunities for alignment",
            ]}
          />

          <Deliverable
            title="Pillar-by-Pillar Deep Insights"
            items={[
              "Positioning",
              "Messaging",
              "Visibility",
              "Credibility",
              "Conversion",
            ]}
          />

          <Deliverable
            title="Clarity Opportunities Map"
            items={[
              "High-impact improvements",
              "Where brand friction exists",
              "Areas to refine for trust & clarity",
            ]}
          />

          <Deliverable
            title="First 5 Brand Actions"
            items={[
              "Action steps tailored to your brand",
              "Priority order for maximum impact",
            ]}
          />

          <Deliverable
            title="Score Narrative"
            items={[
              "Explanation of your brand alignment",
              "How your pillars work together",
              "What your score reveals",
            ]}
          />

          <Deliverable
            title="Content Prompts (Lite Edition)"
            items={[
              "Messaging prompts",
              "Brand-aligned content starters",
            ]}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-16 text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Ready to strengthen your brand?
        </h2>

        <p className="max-w-2xl mx-auto mb-8">
          Brand Snapshot+™ gives you immediate clarity — and a path forward. Unlock your personalized report
          and start refining your brand with confidence.
        </p>

        <a
          href="/checkout/snapshot-plus"
          className="px-8 py-4 bg-brand-blue text-white font-semibold rounded-md shadow hover:bg-brand-blueHover transition"
        >
          Unlock Brand Snapshot+™ →
        </a>
      </section>
    </div>
  );
}

function Deliverable({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-brand-navy mb-3">{title}</h3>
      <ul className="space-y-1">
        {items.map((i, idx) => (
          <li key={idx} className="text-brand-midnight">
            • {i}
          </li>
        ))}
      </ul>
    </div>
  );
}



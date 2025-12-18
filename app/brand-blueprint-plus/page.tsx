export default function BlueprintPlusPage() {
  return (
    <div className="w-full bg-white text-brand-midnight">
      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-semibold text-brand-navy mb-4">
          Your Complete Brand Strategy System — Built in Minutes
        </h1>

        <p className="text-lg text-brand-midnight leading-relaxed max-w-3xl mx-auto">
          Brand Blueprint+™ transforms your Brand Snapshot™ insights into a
          consulting-grade brand strategy — including positioning, messaging,
          narrative frameworks, a customer journey map, and a 12-month content roadmap.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/checkout/blueprint-plus"
            className="px-6 py-3 bg-brand-blue text-white font-semibold rounded-md shadow-lg hover:bg-brand-blueHover transition"
          >
            Unlock Brand Blueprint+™ →
          </a>

          <a
            href="#sample"
            className="px-6 py-3 border border-brand-blue text-brand-blue font-semibold rounded-md hover:bg-brand-gray transition"
          >
            View Sample Report
          </a>
        </div>
      </section>

      {/* TRANSFORMATION */}
      <section className="bg-brand-gray py-16">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-semibold text-brand-navy mb-3">
              Where most brands get stuck
            </h2>
            <ul className="space-y-2 text-brand-midnight">
              <li>• Inconsistent messaging</li>
              <li>• Unclear positioning</li>
              <li>• Random, unfocused content</li>
              <li>• No differentiated narrative</li>
              <li>• Internal misalignment</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-brand-navy mb-3">
              What Blueprint+™ gives you
            </h2>
            <ul className="space-y-2 text-brand-midnight">
              <li>• Unified brand story</li>
              <li>• Clear, ownable positioning</li>
              <li>• A repeatable messaging system</li>
              <li>• A mapped customer journey</li>
              <li>• A 12-month content roadmap</li>
              <li>• An AI prompt ecosystem tailored to your brand</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section id="sample" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-semibold text-brand-navy text-center mb-12">
          What’s Included in Your Personalized Brand Blueprint+™
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <Deliverable
            title="Narrative Strategy"
            items={[
              "Brand Story (long + short)",
              "Elevator Pitch",
              "Voice & tone guidelines",
              "Proof pillars",
            ]}
          />

          <Deliverable
            title="Positioning Platform"
            items={[
              "Positioning Statement",
              "Differentiation Matrix",
              "Category Frame",
              "Competitive stance",
            ]}
          />

          <Deliverable
            title="Customer Journey Map"
            items={[
              "Awareness to advocacy",
              "Emotional drivers & blockers",
              "Brand opportunities",
            ]}
          />

          <Deliverable
            title="12-Month Content Roadmap"
            items={[
              "Monthly themes",
              "Messaging angles",
              "Growth priorities",
            ]}
          />

          <Deliverable
            title="Visual Direction Guidance"
            items={[
              "Mood + inspiration categories",
              "Suggested brand styles",
              "Personality alignment",
            ]}
          />

          <Deliverable
            title="AI Prompt Library"
            items={[
              "Messaging prompts",
              "Campaign prompts",
              "Social + email prompts",
              "Persona-aligned prompts",
              "Sales prompts",
            ]}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-16 text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Ready to elevate your brand?
        </h2>
        <p className="max-w-2xl mx-auto mb-8">
          Unlock your personalized Brand Blueprint+™ — your complete, strategy-first
          foundation for clarity, momentum, and growth.
        </p>

        <a
          href="/checkout/blueprint-plus"
          className="px-8 py-4 bg-brand-blue text-white font-semibold rounded-md shadow hover:bg-brand-blueHover transition"
        >
          Unlock Brand Blueprint+™ →
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



// app/blueprint/page.tsx

export default function BlueprintPage() {
  return (
    <div className="w-full bg-white text-brand-midnight">
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-4xl font-semibold text-brand-navy mb-4">
          Build a Brand That Feels Clear, Consistent, and Confident.
        </h1>
        <p className="text-lg leading-relaxed max-w-3xl mx-auto">
          Brand Blueprint™ is your personalized, AI-powered strategic brand
          system — designed to help founders and small businesses articulate
          their value and communicate with greater clarity across every
          touchpoint.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <a href="/checkout/blueprint" className="btn-primary">
            Build My Brand Blueprint™ →
          </a>
          <a href="#details" className="btn-secondary">
            See What's Included →
          </a>
        </div>
      </section>

      {/* DETAILS */}
      <section id="details" className="max-w-5xl mx-auto px-6 py-20 space-y-16">
        <DetailBlock
          title="Brand Positioning System"
          body="A clear articulation of who you serve, the problem you solve, 
                and the value you deliver — plus your differentiators and 
                competitive angle."
          items={[
            "Positioning statement",
            "Value proposition",
            "Customer problem framing",
            "Competitive clarity",
          ]}
        />

        <DetailBlock
          title="Brand Narrative"
          body="A compelling message arc that helps customers immediately 
                understand who you are and why you matter."
          items={[
            "Brand story",
            "Customer journey narrative",
            "Elevator pitch (3 variations)",
          ]}
        />

        <DetailBlock
          title="Voice & Tone System"
          body="Clear communication guidelines, including tone variations and 
                writing rules to keep your brand consistent."
          items={["Voice pillars", "Tone guidance", "Do/Don't examples"]}
        />

        <DetailBlock
          title="Messaging Framework"
          body="Everything you need to communicate your value across your 
                website, sales materials, and content."
          items={[
            "Core message",
            "Supporting messages",
            "Benefits stack",
            "Objection responses",
          ]}
        />

        <DetailBlock
          title="Visual Direction"
          body="Strategic guidance for visual consistency — without needing a 
                designer."
          items={["Brand themes", "Color psychology", "Mood direction"]}
        />

        <DetailBlock
          title="AI Content Prompts"
          body="A library of AI-ready prompts built with your brand voice and 
                messaging baked in."
          items={["Social media prompts", "Email prompts", "Website prompts"]}
        />
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-navy text-white text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Build the Brand You’ve Been Trying to Explain.
        </h2>
        <p className="max-w-2xl mx-auto mb-8">
          Get a complete brand foundation — clear, confident, and consistent —
          ready to use across every part of your business.
        </p>
        <a href="/checkout/blueprint" className="btn-primary-inverse">
          Build My Brand Blueprint™ →
        </a>
      </section>
    </div>
  );
}

function DetailBlock({
  title,
  body,
  items,
}: {
  title: string;
  body: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-brand-navy">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed">{body}</p>
      <ul className="mt-4 space-y-2 text-[15px] text-brand-midnight">
        {items.map((item, idx) => (
          <li key={idx}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}



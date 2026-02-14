// components/pricing/PricingFAQ.tsx
const faqs = [
  {
    q: "Do I have to start with WunderBrand Snapshot™?",
    a: "No — but it's the fastest way to see your WunderBrand Score™ and confirm what level will help most.",
  },
  {
    q: "Are these one-time purchases?",
    a: "Yes. Each plan is a one-time purchase for the deliverable. (Later we can add subscriptions if you want.)",
  },
  {
    q: "Will this feel gimmicky with Wundy™?",
    a: "No. Wundy™ is a friendly brand mascot and facilitator — the experience remains premium and consulting-level.",
  },
  {
    q: "What's AEO?",
    a: "AEO is about improving how your brand shows up when people ask AI assistants questions in your category. It complements SEO and is included at increasing depth across paid tiers.",
  },
];

export function PricingFAQ() {
  return (
    <div className="rounded-2xl border border-[#E0E3EA] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#021859]">FAQ</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-xl border border-[#E0E3EA] bg-[#F5F7FB] p-5">
            <div className="text-sm font-semibold text-[#021859]">{f.q}</div>
            <div className="mt-2 text-sm leading-relaxed text-[#0C1526]">{f.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// components/pricing/PricingComparison.tsx
export function PricingComparison() {
  const rows = [
    {
      feature: "WunderBrand Score™ + 5-pillar analysis",
      free: "Included",
      plus: "Included",
      bp: "Included",
      bpp: "Included",
    },
    {
      feature: "Personalized strategic recommendations",
      free: "Foundational",
      plus: "Expanded",
      bp: "Activation-ready",
      bpp: "Advanced",
    },
    {
      feature: "Primary pillar diagnosis (highest-leverage opportunity)",
      free: "Included",
      plus: "Included",
      bp: "Included",
      bpp: "Included",
    },
    {
      feature: "Brand Archetype",
      free: "Indicator preview (locked)",
      plus: "Full profile",
      bp: "Full profile",
      bpp: "Full profile + Secondary archetype",
    },
    {
      feature: "Competitive Vulnerability Signal",
      free: "Identified (locked)",
      plus: "Full analysis",
      bp: "Full analysis",
      bpp: "Full analysis + Competitive Intelligence Brief",
    },
    {
      feature: "Marketing Spend Efficiency Signal",
      free: "Identified (locked)",
      plus: "Full breakdown",
      bp: "Full breakdown",
      bpp: "Full breakdown",
    },
    {
      feature: "Revenue Impact Statement",
      free: "—",
      plus: "Yes",
      bp: "Yes",
      bpp: "Yes",
    },
    {
      feature: "Visibility & Discoverability Prompt",
      free: "—",
      plus: "Included",
      bp: "Included",
      bpp: "Included",
    },
    {
      feature: "SEO Strategy Prompt",
      free: "—",
      plus: "—",
      bp: "Included",
      bpp: "Included",
    },
    {
      feature: "AEO / Answer Engine Optimization Prompt",
      free: "—",
      plus: "—",
      bp: "Included",
      bpp: "Included",
    },
    {
      feature: "AEO Advanced: Thought Leadership & Authority System",
      free: "—",
      plus: "—",
      bp: "—",
      bpp: "Included",
    },
    {
      feature: "AI Prompt Pack",
      free: "—",
      plus: "Foundational marketing prompts for positioning, messaging, voice, social, and planning.",
      bp: "Execution prompts for email, website, SEO/content, lead generation, and campaign activation.",
      bpp: "Advanced prompt library for full-funnel, persona, campaigns, PR/reputation, and sales enablement.",
    },
    {
      feature: "Interactive Brand Workbook",
      free: "—",
      plus: "—",
      bp: "Included",
      bpp: "Included",
    },
    {
      feature: "Downloadable deliverables",
      free: "Web results",
      plus: "PDF report",
      bp: "PDF + workbook outputs",
      bpp: "PDF + advanced strategic outputs",
    },
    {
      feature: "Strategy Activation Session",
      free: "—",
      plus: "—",
      bp: "—",
      bpp: "Included (30 min)",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#E0E3EA] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#021859]">Compare plans</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[#0C1526]">
        Start with diagnostic clarity, then move into activation-ready strategy when you are ready.
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[#5A6B7E]">
        Frameworks define your strategy system; prompt assets operationalize that strategy in AI tools.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E0E3EA] text-[#021859]">
              <th className="py-3 pr-4">Feature</th>
              <th className="py-3 pr-4 align-top">
                <div className="font-semibold">WunderBrand Snapshot™</div>
                <div className="mt-1 text-xs font-normal leading-relaxed text-[#5A6B7E]">
                  Free baseline diagnostic for fast brand clarity.
                </div>
              </th>
              <th className="py-3 pr-4 align-top">
                <div className="font-semibold">WunderBrand Snapshot+™</div>
                <div className="mt-1 text-xs font-normal leading-relaxed text-[#5A6B7E]">
                  Deeper analysis with actionable strategic direction.
                </div>
              </th>
              <th className="py-3 pr-4 align-top">
                <div className="font-semibold">WunderBrand Blueprint™</div>
                <div className="mt-1 text-xs font-normal leading-relaxed text-[#5A6B7E]">
                  Activation-ready brand strategy system and workbook.
                </div>
              </th>
              <th className="py-3 align-top">
                <div className="font-semibold">WunderBrand Blueprint+™</div>
                <div className="mt-1 text-xs font-normal leading-relaxed text-[#5A6B7E]">
                  Most advanced strategic architecture and activation support.
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.feature} className="border-b border-[#E0E3EA]">
                <td className="py-3 pr-4 font-medium text-[#0C1526]">{r.feature}</td>
                <td className="py-3 pr-4">{r.free}</td>
                <td className="py-3 pr-4">{r.plus}</td>
                <td className="py-3 pr-4">{r.bp}</td>
                <td className="py-3">{r.bpp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-xl border border-[#E0E3EA] bg-[#F8FAFD] p-5">
        <h3 className="text-base font-semibold text-[#021859]">Deliverables by tier</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#5A6B7E]">
          A clear view of what you walk away with at each level.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-[#E0E3EA] bg-white p-4">
            <h4 className="text-sm font-semibold text-[#021859]">WunderBrand Snapshot™</h4>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#0C1526]">
              <li>• WunderBrand Score™</li>
              <li>• 5-pillar diagnostic breakdown</li>
              <li>• Primary pillar diagnosis</li>
              <li>• Foundational next-step guidance</li>
            </ul>
          </div>

          <div className="rounded-lg border border-[#E0E3EA] bg-white p-4">
            <h4 className="text-sm font-semibold text-[#021859]">WunderBrand Snapshot+™</h4>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#0C1526]">
              <li>• Everything in Snapshot™</li>
              <li>• Expanded pillar analysis</li>
              <li>• Prioritized strategic recommendations</li>
              <li>• Foundational prompt pack (positioning, messaging, voice, social, planning)</li>
              <li>• Visibility & Discoverability Prompt</li>
              <li>• Downloadable PDF report</li>
            </ul>
          </div>

          <div className="rounded-lg border border-[#E0E3EA] bg-white p-4">
            <h4 className="text-sm font-semibold text-[#021859]">WunderBrand Blueprint™</h4>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#0C1526]">
              <li>• Everything in Snapshot+™</li>
              <li>• Brand Archetype</li>
              <li>• Messaging Framework</li>
              <li>• Activation prompt library (email, website, SEO/content, lead-gen, campaigns)</li>
              <li>• SEO + AEO prompts</li>
              <li>• Interactive Brand Workbook</li>
              <li>• PDF + workbook outputs</li>
            </ul>
          </div>

          <div className="rounded-lg border border-[#E0E3EA] bg-white p-4">
            <h4 className="text-sm font-semibold text-[#021859]">WunderBrand Blueprint+™</h4>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#0C1526]">
              <li>• Everything in Blueprint™</li>
              <li>• Messaging Matrix</li>
              <li>• Campaign Architecture</li>
              <li>• Advanced prompt system (marketing, sales enablement, funnel orchestration, PR)</li>
              <li>• AEO Advanced authority system</li>
              <li>• Strategy Activation Session (30 min)</li>
              <li>• Advanced strategic deliverables</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

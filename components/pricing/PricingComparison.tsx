// components/pricing/PricingComparison.tsx
export function PricingComparison() {
  const rows = [
    { feature: "Brand Alignment Score™", free: "✓", plus: "✓", bp: "✓", bpp: "✓" },
    { feature: "Pillar Scores", free: "✓", plus: "✓", bp: "✓", bpp: "✓" },
    { feature: "Expanded insights", free: "—", plus: "✓", bp: "✓", bpp: "✓" },
    { feature: "AEO opportunities", free: "Starter", plus: "Starter", bp: "Standard", bpp: "Advanced" },
    { feature: "Prompt pack", free: "—", plus: "Lite", bp: "Pro", bpp: "Advanced" },
    { feature: "Messaging system", free: "—", plus: "—", bp: "✓", bpp: "✓" },
    { feature: "Messaging matrix", free: "—", plus: "—", bp: "—", bpp: "✓" },
    { feature: "AI orchestration guidelines", free: "—", plus: "—", bp: "—", bpp: "✓" },
    { feature: "Downloadable PDF", free: "—", plus: "✓", bp: "✓", bpp: "✓" },
  ];

  return (
    <div className="rounded-2xl border border-[#E0E3EA] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#021859]">Compare plans</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[#0C1526]">
        Start free, then upgrade when you want deeper strategy and more reusable assets.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E0E3EA] text-[#021859]">
              <th className="py-3 pr-4">Feature</th>
              <th className="py-3 pr-4">Brand Snapshot™</th>
              <th className="py-3 pr-4">Brand Snapshot+™</th>
              <th className="py-3 pr-4">Brand Snapshot Blueprint™</th>
              <th className="py-3">Brand Snapshot Blueprint+™</th>
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
    </div>
  );
}

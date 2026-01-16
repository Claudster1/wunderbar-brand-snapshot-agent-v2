// components/dashboard/RefinementPanel.tsx
import Link from "next/link";

interface RefinementPanelProps {
  report: {
    id: string;
    businessName?: string;
  };
}

export function RefinementPanel({ report }: RefinementPanelProps) {
  return (
    <section className="bg-[#F5F7FB] p-8 rounded-xl">
      <h3 className="text-lg font-semibold text-[#021859] mb-2">
        Request a Snapshot+™ Refinement
      </h3>

      <p className="text-sm text-[#0C1526] mb-4 leading-relaxed">
        Want to go deeper on a specific pillar or adjust assumptions?
        You can request a focused refinement based on additional context.
      </p>

      <ul className="text-sm text-[#0C1526] mb-4 space-y-1">
        <li>• Clarify positioning or audience nuance</li>
        <li>• Incorporate new competitors or channels</li>
        <li>• Refine messaging or conversion assumptions</li>
      </ul>

      <Link
        href={`/refinement-request?report=${report.id}`}
        className="inline-flex rounded-[10px] bg-[#07B0F2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#059BD8] no-underline"
      >
        Request Refinement →
      </Link>
    </section>
  );
}

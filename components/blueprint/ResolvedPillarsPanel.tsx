// components/blueprint/ResolvedPillarsPanel.tsx
// Panel component displaying resolved pillars from Snapshot+™

export function ResolvedPillarsPanel({ pillars }: { pillars: string[] }) {
  return (
    <div className="bg-slate-50 border border-brand-border rounded-xl p-6 mb-12">
      <h2 className="text-lg font-semibold text-brand-navy mb-3">
        What This Blueprint Builds On
      </h2>

      <p className="text-[15px] mb-4 max-w-2xl">
        Your Snapshot+™ highlighted the following focus areas. This Blueprint™
        provides the structure, language, and tools to activate them.
      </p>

      <ul className="grid grid-cols-2 gap-3 text-sm">
        {pillars.map((pillar) => (
          <li key={pillar} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-blue" />
            {pillar}
          </li>
        ))}
      </ul>
    </div>
  );
}

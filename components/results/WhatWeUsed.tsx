// components/results/WhatWeUsed.tsx
// Component explaining how the Snapshot+ report was generated

export function WhatWeUsed({ contextCoverage }: { contextCoverage: number }) {
  return (
    <div className="rounded-lg border border-slate-200 p-5 space-y-3">
      <h4 className="font-semibold text-slate-900">
        How this report was generated
      </h4>

      <p className="text-sm text-slate-700">
        Your Snapshot+™ is based on the information you provided during your
        WunderBrand Snapshot™, combined with pattern analysis across similar brands.
      </p>

      <p className="text-sm text-slate-700">
        We analyzed:
      </p>

      <ul className="list-disc pl-5 text-sm text-slate-700">
        <li>Your positioning and offer clarity</li>
        <li>Your messaging consistency and tone</li>
        <li>Your visibility across web and/or social channels</li>
        <li>Your brand signals that impact trust and conversion</li>
      </ul>

      <p className="text-xs text-slate-600">
        Context coverage: {contextCoverage}%
      </p>
    </div>
  );
}

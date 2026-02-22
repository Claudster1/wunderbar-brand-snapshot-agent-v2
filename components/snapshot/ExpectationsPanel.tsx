// components/snapshot/ExpectationsPanel.tsx
// Component explaining what users can expect from the WunderBrand Snapshot™ process

export function ExpectationsPanel() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
      <h3 className="font-medium text-slate-900 mb-2">
        What to expect
      </h3>

      <ul className="space-y-1">
        <li>• Takes about <strong>15–20 minutes</strong></li>
        <li>• No prep or documents needed</li>
        <li>• We'll ask about your business, audience, and visibility</li>
        <li>• Your WunderBrand Score™ appears immediately</li>
      </ul>

      <p className="mt-3 text-slate-600">
        The clarity of your results reflects the clarity of your inputs — honest answers work best.
      </p>
    </div>
  );
}

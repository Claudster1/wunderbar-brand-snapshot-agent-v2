// components/results/DeepenInsightBadge.tsx

export function DeepenInsightBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      <span>Additional strategic context could deepen this insight.</span>
    </div>
  );
}

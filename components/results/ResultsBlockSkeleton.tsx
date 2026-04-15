/** Lightweight placeholder while below-the-fold Results blocks load (dynamic import). */
export function ResultsBlockSkeleton({ label = "Loading section…" }: { label?: string }) {
  return (
    <div
      className="rounded-xl border border-brand-border/60 bg-[#f8fafc] px-5 py-10 sm:px-6 sm:py-12"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="mx-auto max-w-md space-y-3">
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200/90" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-200/80" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200/70" />
      </div>
    </div>
  );
}

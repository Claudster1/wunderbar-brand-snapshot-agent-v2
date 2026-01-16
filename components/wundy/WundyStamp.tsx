// components/wundy/WundyStamp.tsx
export function WundyStamp() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E0E3EA] bg-white px-5 py-4 shadow-sm">
      <div
        className="h-10 w-10 rounded-xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(39,205,242,0.65), rgba(7,176,242,0.25), rgba(2,24,89,0.08))",
        }}
      />
      <div className="text-left">
        <div className="text-sm font-semibold text-[#021859]">Wundy</div>
        <div className="text-xs text-slate-600">
          Brand mascot & facilitator — keeping things easy, not gimmicky.
        </div>
      </div>
    </div>
  );
}

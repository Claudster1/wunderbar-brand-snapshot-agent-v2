// components/snapshot/ContextSignals.tsx

"use client";

export interface ContextSignal {
  label: string;
  provided: boolean;
  optional?: boolean;
}

interface ContextSignalsProps {
  signals: ContextSignal[];
  showOptional?: boolean;
}

export function ContextSignals({
  signals,
  showOptional = true,
}: ContextSignalsProps) {
  const displaySignals = showOptional
    ? signals
    : signals.filter((s) => !s.optional);

  const providedCount = displaySignals.filter((s) => s.provided).length;
  const totalCount = displaySignals.length;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">
          Context Signals
        </h4>
        <span className="text-xs text-slate-500">
          {providedCount}/{totalCount} provided
        </span>
      </div>

      <div className="space-y-2">
        {displaySignals.map((signal, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                signal.provided
                  ? "bg-green-500"
                  : signal.optional
                  ? "bg-slate-300"
                  : "bg-amber-400"
              }`}
            />
            <span
              className={
                signal.provided
                  ? "text-slate-700"
                  : signal.optional
                  ? "text-slate-500"
                  : "text-amber-700"
              }
            >
              {signal.label}
              {signal.optional && !signal.provided && (
                <span className="text-xs text-slate-400 ml-1">(optional)</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {providedCount < totalCount && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-slate-500">
            Some insights are based on partial context. Providing additional
            strategic inputs can increase precision and relevance.
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Your insights become more precise as more strategic context is provided.
            </p>
            <button
              onClick={() => {
                // Scroll to or show strategic context section
                const element = document.getElementById("strategic-context");
                element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }}
              className="text-xs text-brand-blue hover:underline font-medium"
            >
              Add Strategic Context
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

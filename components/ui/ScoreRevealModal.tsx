"use client";

import ModalShell from "./ModalShell";

interface ScoreRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalScore: number;
  pillars: {
    positioning: number;
    messaging: number;
    visibility: number;
    credibility: number;
    conversion: number;
  };
}

export default function ScoreRevealModal({
  isOpen,
  onClose,
  finalScore,
  pillars,
}: ScoreRevealModalProps) {
  const alignmentLabel =
    finalScore >= 80
      ? "Excellent Alignment"
      : finalScore >= 60
      ? "Strong Foundation"
      : finalScore >= 40
      ? "Emerging Clarity"
      : "Needs Focused Attention";

  const describe = (score: number) => {
    if (score >= 18) return "High-performing area";
    if (score >= 15) return "Consistently strong";
    if (score >= 12) return "Mixed but promising";
    if (score >= 9) return "Developing area";
    return "Priority improvement";
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} width="max-w-3xl">
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-semibold text-brand-navy text-center">
            Your Brand Alignment Score™
          </h2>
          <p className="text-[15px] leading-relaxed text-brand-midnight text-center mt-2 max-w-xl mx-auto">
            Based on your responses and the sentiment of your brand touchpoints, here’s a clear
            view of how confidently and consistently your brand is showing up today—and where
            targeted refinements can create the most meaningful lift.
          </p>
        </div>

        {/* SCORE DISPLAY */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-6xl font-bold text-brand-blue">{finalScore}</div>
          <div className="text-[15px] text-slate-600">{alignmentLabel}</div>

          <div className="w-full max-w-md bg-slate-200 h-3 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-brand-blue transition-all duration-700"
              style={{ width: `${finalScore}%` }}
            />
          </div>
        </div>

        {/* PILLAR BREAKDOWN */}
        <div className="bg-brand-gray/60 border border-brand-border rounded-lg p-5">
          <h3 className="text-lg font-semibold text-brand-navy mb-4">
            How Your Score Breaks Down
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
            {Object.entries(pillars).map(([key, score]) => (
              <div
                key={key}
                className="flex flex-col gap-1 bg-white rounded-md border border-brand-border p-4 shadow-sm"
              >
                <div className="flex justify-between">
                  <span className="font-semibold capitalize text-brand-midnight">
                    {key}
                  </span>
                  <span className="text-brand-blue font-semibold">{score}/20</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-blue transition-all duration-700"
                    style={{ width: `${(score / 20) * 100}%` }}
                  />
                </div>

                <p className="text-slate-600 text-[13px] mt-1">{describe(score)}</p>
              </div>
            ))}
          </div>

          <p className="text-[14px] text-slate-600 mt-4 leading-relaxed">
            These five pillars form the foundation of your Brand Alignment Score™. Together, they
            reveal how clearly you communicate value, how consistently your brand shows up across
            touchpoints, and how effectively your marketing converts interest into action.
          </p>
        </div>

        {/* FOOTER CTA */}
        <div className="text-center space-y-4">
          <button
            onClick={onClose}
            className="
              bg-brand-blue hover:bg-brand-blueHover 
              text-white font-semibold rounded-md 
              px-8 py-3 shadow-md shadow-brand-blue/30 transition
            "
          >
            Continue →
          </button>

          <p className="text-[13px] text-slate-500">
            You’ll now be guided to unlock your complete Brand Snapshot™.
          </p>
        </div>
      </div>
    </ModalShell>
  );
}



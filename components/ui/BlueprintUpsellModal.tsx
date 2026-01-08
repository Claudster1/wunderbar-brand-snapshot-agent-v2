"use client";

import ModalShell from "./ModalShell";

interface BlueprintUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  pillars: {
    positioning: number;
    messaging: number;
    visibility: number;
    credibility: number;
    conversion: number;
  };
  onUpgrade: () => void;
}

export default function BlueprintUpsellModal({
  isOpen,
  onClose,
  score,
  pillars,
  onUpgrade,
}: BlueprintUpsellModalProps) {
  // PERSONALIZED SCORE MESSAGE
  const foundationMessage =
    score >= 80
      ? "You already have a strong foundation — Blueprint™ turns that foundation into a scalable, market-ready brand system."
      : score >= 60
      ? "You’re positioned well — Blueprint™ helps you strengthen clarity, consistency, and market differentiation."
      : score >= 40
      ? "You’ve laid the groundwork — Blueprint™ gives you the structure and language to elevate your brand confidently."
      : "Your brand has significant room to grow — Blueprint™ provides the clarity and direction needed to create meaningful traction.";

  // LOWEST PILLAR ANALYSIS
  const entries = Object.entries(pillars);
  const lowest = entries.sort((a, b) => a[1] - b[1])[0];
  const [pillarName, pillarScore] = lowest;

  const pillarMessage = `
Your greatest opportunity lies in ${pillarName}, where your score is ${pillarScore}/20.

Blueprint™ includes the strategic framework and refined messaging needed to strengthen this pillar at the brand-system level.`;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} width="max-w-2xl">
      <div className="space-y-8">
        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-brand-navy">
            Unlock Your Brand Snapshot Blueprint™
          </h2>
          <p className="text-[15px] leading-relaxed text-brand-midnight mt-2 max-w-xl mx-auto">
            A complete, AI-ready brand system built from your Snapshot+™ insights — refined into
            positioning, messaging, personality, and on-brand language you can use everywhere
            instantly.
          </p>
        </div>

        {/* PERSONALIZED INSIGHTS */}
        <div className="bg-brand-gray/60 border border-brand-border rounded-md p-5 text-[15px] leading-relaxed text-brand-midnight whitespace-pre-line">
          <p>{foundationMessage}</p>
          <p className="mt-3">{pillarMessage}</p>
        </div>

        {/* WHAT’S INCLUDED */}
        <div className="bg-white border border-brand-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-brand-navy mb-3">
            What Your Blueprint™ Delivers
          </h3>

          <ul className="space-y-2 text-[15px] text-brand-midnight">
            <li>• A complete brand positioning system tailored to your business</li>
            <li>• A refined brand narrative, value statements, and on-brand language</li>
            <li>• Brand personality, tone, and communication guidelines</li>
            <li>• AI-ready prompts for writing on-brand content across platforms</li>
            <li>• Messaging frameworks for your website, campaigns, and sales content</li>
            <li>• A clarity-first structure your team (and AI tools) can use instantly</li>
            <li>• Delivered as a polished, presentation-ready PDF</li>
          </ul>
        </div>

        {/* PRICING + CTA */}
        <div className="text-center space-y-4">
          <p className="text-brand-navy font-semibold text-xl">
            One-Time Investment: $749
          </p>

          <button
            onClick={onUpgrade}
            className="
              bg-brand-blue hover:bg-brand-blueHover 
              text-white font-semibold rounded-md 
              px-10 py-3 shadow-md shadow-brand-blue/30 transition
            "
          >
            Upgrade to Blueprint™ →
          </button>

          <button
            onClick={onClose}
            className="
              text-brand-midnight underline underline-offset-2 
              text-sm font-medium hover:text-brand-blue transition
            "
          >
            Not now
          </button>
        </div>
      </div>
    </ModalShell>
  );
}



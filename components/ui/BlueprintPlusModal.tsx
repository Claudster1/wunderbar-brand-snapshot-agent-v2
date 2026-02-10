"use client";

import { useRouter } from "next/navigation";
import ModalShell from "./ModalShell";

interface BlueprintPlusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BlueprintPlusModal({ isOpen, onClose }: BlueprintPlusModalProps) {
  const router = useRouter();

  function upgrade() {
    onClose();
    router.push("/checkout/blueprint-plus");
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} width="max-w-3xl">
      <div className="flex flex-col gap-8">
        {/* Heading */}
        <header>
          <h2 className="text-3xl font-semibold text-brand-navy">
            Brand Blueprint+™
          </h2>
          <p className="text-[16px] mt-3 leading-relaxed text-brand-midnight">
            For founders and teams who want a complete, consulting-grade brand system — tailored to
            their voice, audience, strategy, and goals. Blueprint+™ transforms your brand from
            “defined” to “deployment-ready.”
          </p>
        </header>

        {/* Value Section */}
        <div className="bg-brand-gray/70 p-6 rounded-xl border border-brand-border">
          <ul className="space-y-3 text-[15px] leading-relaxed text-brand-midnight">
            <li>
              <strong>Complete Brand System:</strong> Positioning, messaging, personality, tone,
              brand pillars, narrative frameworks, and value architecture.
            </li>
            <li>
              <strong>Visual Strategy Recommendations:</strong> Persona- and archetype-aligned color
              palettes, core symbolism, designed meaning profiles, and usage guidance.
            </li>
            <li>
              <strong>Audience intelligence:</strong> Psychographic insights, needs-state analysis,
              emotional drivers, and trust-building strategy.
            </li>
            <li>
              <strong>AI Deployment Pack:</strong> Prompts, workflows, and reusable templates for
              marketing, social, content, emails, sales, and product messaging.
            </li>
            <li>
              <strong>Your Brand Operating Manual:</strong> A polished 20–30 page document you can
              use across your tools and workflows.
            </li>
          </ul>
        </div>

        {/* Assurance */}
        <p className="text-[15px] text-brand-midnight leading-relaxed">
          Blueprint+™ is ideal for teams who want a complete, consistent brand built with the
          clarity and precision typically reserved for high-end consulting — without the cost,
          delay, or friction.
        </p>

        {/* CTA */}
        <button
          onClick={upgrade}
          className="
            w-full py-3 rounded-md 
            bg-brand-blue text-white font-semibold
            hover:bg-brand-blueHover shadow-lg shadow-brand-blue/30
            transition
          "
        >
          Upgrade to Blueprint+™ →
        </button>

        {/* Subtext */}
        <p className="text-center text-[13px] text-slate-500">
          Delivered within minutes. Human-quality. AI precision.
        </p>
      </div>
    </ModalShell>
  );
}



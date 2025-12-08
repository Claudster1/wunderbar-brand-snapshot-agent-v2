// components/SnapshotUpgradePanel.tsx
// Snapshot+™ upgrade panel with Wundy illustration and benefits list

"use client";

interface SnapshotUpgradePanelProps {
  upgradeCTA?: string;
  snapshotPlusCheckoutUrl?: string;
}

export function SnapshotUpgradePanel({
  upgradeCTA,
  snapshotPlusCheckoutUrl = "#",
}: SnapshotUpgradePanelProps) {
  return (
    <div className="mt-16 rounded-xl border border-brand-border bg-white shadow-md p-8 fade-in">
      <div className="flex items-start gap-6">
        {/* Wundy Illustration */}
        <img 
          src="/wundy/wundy-smile.png" 
          alt="Wundy" 
          className="w-20 h-20 object-contain"
        />

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-brand-navy mb-2">
            Continue Your Brand Transformation
          </h2>

          <p className="text-brand-midnight leading-relaxed mb-4">
            Your Brand Snapshot™ results show where your brand is strong —
            and where a few thoughtful refinements could elevate clarity,
            trust, and overall performance. Snapshot+™ gives you a deeper,
            personalized roadmap to help your brand show up with confidence
            and consistency.
          </p>

          {/* Benefits List */}
          <ul className="list-disc pl-6 text-brand-midnight mb-6 space-y-2">
            <li>Expanded breakdown of your five pillars</li>
            <li>Messaging clarity and offer positioning review</li>
            <li>Visual + verbal consistency scan</li>
            <li>Actionable recommendations tailored to your results</li>
          </ul>

          {/* Dynamic CTA (if provided) */}
          {upgradeCTA && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-brand-blue">
              <p className="text-sm text-brand-midnight leading-relaxed whitespace-pre-line">
                {upgradeCTA}
              </p>
            </div>
          )}

          {/* Upgrade Button */}
          <a 
            href={snapshotPlusCheckoutUrl} 
            className="inline-block bg-brand-blue hover:bg-brand-blueHover text-white font-semibold px-6 py-3 rounded-md shadow-md transition"
          >
            Upgrade to Snapshot+™ →
          </a>
        </div>
      </div>
    </div>
  );
}


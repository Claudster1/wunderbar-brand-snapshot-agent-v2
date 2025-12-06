// components/SnapshotUpgradePanel.tsx
// Snapshot+ upgrade panel with gradient background and CTA

"use client";

interface SnapshotUpgradePanelProps {
  upgradeCTA?: string;
}

export function SnapshotUpgradePanel({
  upgradeCTA,
}: SnapshotUpgradePanelProps) {
  const defaultCTA =
    "Ready to take your brand to the next level? Snapshot+ unlocks a complete Brand Blueprint with detailed positioning frameworks, messaging templates, content strategies, and conversion optimization roadmaps—all tailored to your specific brand and goals. You'll get done-for-you recommendations, step-by-step implementation guides, and ongoing support to turn insights into action.";

  return (
    <div className="animate-fade-in-up animation-delay-1000 mb-12">
      <div className="bg-gradient-to-br from-brand-blue via-brand-aqua to-brand-blue rounded-2xl p-8 shadow-xl border border-blue-300">
        <div className="text-white">
          <h2 className="text-2xl font-semibold mb-3">Upgrade to Snapshot+</h2>
          <p className="text-blue-50 leading-relaxed mb-6">
            {upgradeCTA || defaultCTA}
          </p>
          <a
            href="#"
            className="inline-block bg-white text-brand-blue px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg hover:shadow-xl"
          >
            Learn More About Snapshot+ →
          </a>
        </div>
      </div>
    </div>
  );
}


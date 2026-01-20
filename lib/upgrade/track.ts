export function trackUpgradeClick({
  testId,
  variant,
  pillar,
}: {
  testId: string;
  variant: "A" | "B";
  pillar: string;
}) {
  fetch("/api/track-upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "upgrade_cta_clicked",
      testId,
      variant,
      pillar,
    }),
  });
}

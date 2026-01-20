export function trackUpgradeView({
  email,
  variant,
  pillar,
}: {
  email: string;
  variant: "A" | "B";
  pillar: string;
}) {
  fetch("/api/track-upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "upgrade_view",
      email,
      variant,
      pillar,
    }),
  });
}

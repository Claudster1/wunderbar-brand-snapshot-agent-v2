export function trackUpgradeNudgeClick(pillar: string) {
  fetch("/api/track-upgrade-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "UPGRADE_NUDGE_CLICKED",
      pillar,
    }),
  });
}

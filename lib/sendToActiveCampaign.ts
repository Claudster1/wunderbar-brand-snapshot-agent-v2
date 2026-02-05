const AC_WEBHOOK_URL = process.env.ACTIVECAMPAIGN_WEBHOOK_URL ?? process.env.NEXT_PUBLIC_ACTIVECAMPAIGN_WEBHOOK_URL;

export async function sendToActiveCampaign(payload: {
  email: string;
  brandName: string;
  score: number;
  primaryPillar: string;
  stage: string;
  archetype: string;
  coverage: number;
}) {
  if (!AC_WEBHOOK_URL) return;
  try {
    await fetch(AC_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      fields: {
        brand_name: payload.brandName,
        brand_alignment_score: payload.score,
        primary_pillar: payload.primaryPillar,
        brand_stage: payload.stage,
        brand_archetype: payload.archetype,
        context_coverage_score: payload.coverage,
        snapshot_completed: true,
      },
      tags: [
        "snapshot:completed",
        payload.coverage < 80 ? "snapshot:coverage-gap" : null,
      ].filter(Boolean),
    }),
  });
  } catch (_) {
    // No-op when webhook is unavailable
  }
}

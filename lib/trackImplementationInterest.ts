export function trackImplementationInterest({
  path,
  primaryPillar,
  brandName,
}: {
  path: "guided" | "dfy";
  primaryPillar: string;
  brandName: string;
}) {
  if (typeof window === "undefined") return;

  // ActiveCampaign event tracking
  // @ts-ignore
  if (window.vgo) {
    // @ts-ignore
    window.vgo("setEmail", window.__USER_EMAIL__); // already captured post-report
    // @ts-ignore
    window.vgo("track", "Implementation Interest", {
      path,
      primaryPillar,
      brandName,
    });
  }
}

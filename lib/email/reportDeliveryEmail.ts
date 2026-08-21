// lib/email/reportDeliveryEmail.ts
//
// Transactional "your results are ready" email sent the moment a user captures
// their email on the results page. This is delivery of the user's OWN requested
// results (transactional), NOT marketing — it always sends, independent of any
// ActiveCampaign marketing automation.
//
// Copy: logo → unique report link → view on page → Export → soft suite education CTA.

import { WUNDERBAR_SUITE_RESULTS_FUNNEL_URL } from "@/lib/wunderbarExternalUrls";

/** Absolute PNG for HTML email clients (avoid SVG/WebP — Outlook etc.). */
export const DEFAULT_TRANSACTIONAL_EMAIL_LOGO_URL =
  "https://app.wunderbrand.ai/assets/pdf/wunderbar-logo.png";

export function buildSnapshotReportEmail(opts: {
  resultsUrl: string;
  productName?: string;
  firstName?: string;
  /** Optional override; defaults to the results-funnel suite URL. */
  suiteUrl?: string;
  /** Absolute HTTPS URL to a PNG logo. */
  logoUrl?: string;
}): { subject: string; text: string; html: string } {
  const productName = opts.productName?.trim() || "WunderBrand Snapshot\u2122";
  const greetingName = opts.firstName?.trim() ? ` ${opts.firstName.trim()}` : "";
  const suiteUrl = opts.suiteUrl?.trim() || WUNDERBAR_SUITE_RESULTS_FUNNEL_URL;
  const logoUrl = opts.logoUrl?.trim() || DEFAULT_TRANSACTIONAL_EMAIL_LOGO_URL;
  const subject = `Your ${productName} results are ready`;

  const text = [
    `Hi${greetingName},`,
    "",
    `Your ${productName} is unlocked. This is your unique link to your report — open it anytime:`,
    opts.resultsUrl,
    "",
    "On that page you'll find pillar scores, your archetype, priority actions, and a PDF you can share with your team.",
    "",
    "Why a strong brand matters:",
    "When ads, your website, sales, and content each tell a slightly different story, buyers get confused and trust drops.",
    "",
    "Clarity first. Growth that compounds.",
    "A strong brand locks that in—one message, one plan. Spend compounds. Buyers decide faster. Effort goes straight to growth.",
    "",
    "Snapshot+™, Blueprint™, and Blueprint+™ turn this diagnosis into that clarity—so growth becomes more efficient and more repeatable:",
    suiteUrl,
    "",
    "— The Wunderbar Digital Team",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#021859">
      <p style="margin:0 0 20px">
        <a href="${opts.resultsUrl}" style="text-decoration:none">
          <img src="${logoUrl}"
               alt="Wunderbar Digital"
               width="160"
               height="21"
               style="display:block;width:160px;height:auto;border:0;outline:none;text-decoration:none" />
        </a>
      </p>
      <p style="color:#07B0F2;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px">
        Your results are ready
      </p>
      <h2 style="color:#021859;margin:0 0 12px;font-size:22px;line-height:1.3">
        Your ${productName} is unlocked${greetingName ? `,${greetingName}` : ""}
      </h2>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 16px">
        This is your <strong>unique link</strong> to your report. Open it anytime to view your full results —
        then use <strong>Export</strong> to save a PDF you can share with your team.
      </p>
      <p style="margin:0 0 24px">
        <a href="${opts.resultsUrl}"
           style="display:inline-block;background:#07B0F2;color:#ffffff;text-decoration:none;
                  font-weight:700;padding:14px 28px;border-radius:5px;font-size:15px">
          Open my results &rarr;
        </a>
      </p>
      <ul style="color:#404040;line-height:1.7;margin:0 0 20px;padding-left:20px">
        <li>Pillar-by-pillar scores and insights</li>
        <li>Your brand archetype and what it means</li>
        <li>Ranked priority actions for your brand</li>
        <li>A PDF you can share with partners, investors, or your team</li>
      </ul>
      <div style="margin:0 0 24px;padding:18px 20px;border-radius:5px;border:1px solid rgba(7,176,242,0.35);background:#f8fcff">
        <p style="color:#07B0F2;font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px">
          Why brand matters
        </p>
        <p style="color:#021859;font-size:16px;font-weight:700;line-height:1.35;margin:0 0 10px">
          Clarity first. Growth that compounds.
        </p>
        <p style="color:#5A6B7E;line-height:1.55;margin:0 0 12px;font-size:14px">
          When ads, your website, sales, and content each tell a slightly different story,
          buyers get confused and trust drops.
        </p>
        <p style="color:#5A6B7E;line-height:1.55;margin:0 0 12px;font-size:14px">
          A strong brand locks that in—<strong>one message, one plan</strong>. Spend compounds.
          Buyers decide faster. Effort goes straight to growth.
        </p>
        <p style="color:#5A6B7E;line-height:1.55;margin:0 0 14px;font-size:14px">
          Snapshot+™, Blueprint™, and Blueprint+™ turn this diagnosis into that clarity—
          so growth becomes more efficient and more repeatable.
        </p>
        <a href="${suiteUrl}"
           style="display:inline-block;background:#ffffff;color:#07B0F2;text-decoration:none;
                  font-weight:700;padding:12px 22px;border-radius:5px;font-size:14px;
                  border:2px solid #07B0F2">
          Explore the WunderBrand Suite™ &rarr;
        </a>
      </div>
      <p style="color:#8794A3;font-size:13px;line-height:1.5;margin:0">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <a href="${opts.resultsUrl}" style="color:#07B0F2;word-break:break-all">${opts.resultsUrl}</a>
      </p>
      <p style="color:#8794A3;font-size:13px;margin:20px 0 0">&mdash; The Wunderbar Digital Team</p>
    </div>`;

  return { subject, text, html };
}

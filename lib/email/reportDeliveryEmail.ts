// lib/email/reportDeliveryEmail.ts
//
// Transactional "your results are ready" email sent the moment a user captures
// their email on the results page. This is delivery of the user's OWN requested
// results (transactional), NOT marketing — it always sends, independent of any
// ActiveCampaign marketing automation.
//
// Copy mirrors the results-page unlock UI: unique report link → view on page →
// download PDF via Export.

export function buildSnapshotReportEmail(opts: {
  resultsUrl: string;
  productName?: string;
  firstName?: string;
}): { subject: string; text: string; html: string } {
  const productName = opts.productName?.trim() || "WunderBrand Snapshot\u2122";
  const greetingName = opts.firstName?.trim() ? ` ${opts.firstName.trim()}` : "";
  const subject = `Your ${productName} results are ready`;

  const text = [
    `Hi${greetingName},`,
    "",
    `Your ${productName} is unlocked. This is your unique link to your report — open it anytime to view your full results on the page:`,
    opts.resultsUrl,
    "",
    "On that page you'll find:",
    "• Pillar-by-pillar scores and insights",
    "• Your brand archetype and what it means",
    "• Ranked priority actions for your brand",
    "• Export — download a PDF of your results anytime",
    "",
    "Tip: start with your biggest opportunity and pick one thing to act on this week.",
    "",
    "— The Wunderbar Digital Team",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#021859">
      <p style="color:#07B0F2;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px">
        Access your diagnostic
      </p>
      <h2 style="color:#021859;margin:0 0 12px;font-size:22px;line-height:1.3">
        Your ${productName} results are unlocked${greetingName ? `,${greetingName}` : ""}
      </h2>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 16px">
        This is your <strong>unique link</strong> to your report. Open it anytime to view your full results on the page.
        Use <strong>Export</strong> there to download a PDF whenever you need it.
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
        <li>Export on the page — download your PDF anytime</li>
      </ul>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 20px">
        <strong>Tip:</strong> start with your biggest opportunity and pick one thing to act on this week.
      </p>
      <p style="color:#8794A3;font-size:13px;line-height:1.5;margin:0">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <a href="${opts.resultsUrl}" style="color:#07B0F2;word-break:break-all">${opts.resultsUrl}</a>
      </p>
      <p style="color:#8794A3;font-size:13px;margin:20px 0 0">&mdash; The Wunderbar Digital Team</p>
    </div>`;

  return { subject, text, html };
}

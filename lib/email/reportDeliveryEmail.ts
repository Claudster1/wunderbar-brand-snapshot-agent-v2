// lib/email/reportDeliveryEmail.ts
//
// Transactional "your results are ready" email sent the moment a user captures
// their email on the results page. This is delivery of the user's OWN requested
// results (transactional), NOT marketing — it always sends, independent of any
// ActiveCampaign marketing automation.

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
    `Your ${productName} results are ready. Open them here:`,
    opts.resultsUrl,
    "",
    "This link stays live, so you can revisit your results anytime.",
    "",
    "A tip: start with your biggest opportunity and pick one thing to act on this week.",
    "",
    "— The Wunderbar Digital Team",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#021859">
      <h2 style="color:#021859;margin:0 0 12px">Your results are ready${greetingName ? `,${greetingName}` : ""}</h2>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 20px">
        Your <strong>${productName}</strong> is ready to view. It scores your brand across five pillars —
        Positioning, Messaging, Visibility, Credibility, and Conversion — and shows your biggest opportunity.
      </p>
      <p style="margin:0 0 24px">
        <a href="${opts.resultsUrl}"
           style="display:inline-block;background:#021859;color:#ffffff;text-decoration:none;
                  font-weight:700;padding:14px 28px;border-radius:5px;font-size:15px">
          View your results &rarr;
        </a>
      </p>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 8px">
        This link stays live, so you can come back to your results anytime.
      </p>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 20px">
        <strong>Tip:</strong> start with your biggest opportunity and pick one thing to act on this week.
      </p>
      <p style="color:#8794A3;font-size:13px;line-height:1.5;margin:0">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <a href="${opts.resultsUrl}" style="color:#3B6CB7;word-break:break-all">${opts.resultsUrl}</a>
      </p>
      <p style="color:#8794A3;font-size:13px;margin:20px 0 0">&mdash; The Wunderbar Digital Team</p>
    </div>`;

  return { subject, text, html };
}

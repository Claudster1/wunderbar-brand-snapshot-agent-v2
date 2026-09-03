// lib/email/purchaseStartReminderEmail.ts
// Nudge buyers who paid but have not completed their diagnostic yet.

import "server-only";

import { DEFAULT_TRANSACTIONAL_EMAIL_LOGO_URL } from "@/lib/email/reportDeliveryEmail";
import { sendTransactionalEmail, type SendResult } from "@/lib/email/transactional";

export type PurchaseStartReminderKey = "2d" | "7d" | "21d";

const PRODUCT_DISPLAY: Record<string, string> = {
  SNAPSHOT_PLUS: "WunderBrand Snapshot+\u2122",
  BLUEPRINT: "WunderBrand Blueprint\u2122",
  BLUEPRINT_PLUS: "WunderBrand Blueprint+\u2122",
  snapshot_plus: "WunderBrand Snapshot+\u2122",
  blueprint: "WunderBrand Blueprint\u2122",
  blueprint_plus: "WunderBrand Blueprint+\u2122",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function copyFor(
  key: PurchaseStartReminderKey,
  productName: string,
): { subject: string; headline: string; body: string; cta: string } {
  switch (key) {
    case "2d":
      return {
        subject: `Quick nudge — your ${productName} is ready when you are`,
        headline: "Your purchase is waiting",
        body: `You already unlocked ${productName}. Most people finish in one focused sitting — and your progress saves if you need to pause. One click opens your product with access unlocked.`,
        cta: `Start my ${productName} →`,
      };
    case "7d":
      return {
        subject: `Still on your list? Open your ${productName}`,
        headline: "Clarity compounds when you start",
        body: `It's been about a week since you purchased ${productName}. The sooner you complete the diagnostic, the sooner you have scores, priorities, and a plan you can put to work. Your one-click access link is below.`,
        cta: `Continue my ${productName} →`,
      };
    case "21d":
      return {
        subject: `Last nudge before your start link ages — ${productName}`,
        headline: "Don't leave your investment on the shelf",
        body: `You invested in ${productName}. Your one-click access link works for 90 days from purchase — after that, you can still open everything from your dashboard with this email. Finish the diagnostic while the link is easiest.`,
        cta: `Finish my ${productName} →`,
      };
  }
}

export function buildPurchaseStartReminderEmail(opts: {
  reminderKey: PurchaseStartReminderKey;
  productSku: string;
  firstName?: string | null;
  accessUrl: string;
  dashboardUrl: string;
  logoUrl?: string;
}): { subject: string; text: string; html: string } {
  const productName = PRODUCT_DISPLAY[opts.productSku] || "your WunderBrand product";
  const copy = copyFor(opts.reminderKey, productName);
  const firstName = (opts.firstName || "").trim() || "there";
  const logoUrl = opts.logoUrl?.trim() || DEFAULT_TRANSACTIONAL_EMAIL_LOGO_URL;

  const text = [
    `Hi ${firstName},`,
    "",
    copy.headline,
    "",
    copy.body,
    "",
    `Start here: ${opts.accessUrl}`,
    "",
    `Dashboard: ${opts.dashboardUrl}`,
    "",
    "— The Wunderbar Digital Team",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#021859">
      <p style="margin:0 0 20px">
        <img src="${escapeHtml(logoUrl)}" alt="Wunderbar Digital" width="160" height="21"
             style="display:block;width:160px;height:auto;border:0" />
      </p>
      <p style="color:#07B0F2;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px">
        Friendly reminder
      </p>
      <h1 style="color:#021859;margin:0 0 12px;font-size:22px;line-height:1.3">
        ${escapeHtml(copy.headline)}
      </h1>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 12px">Hi ${escapeHtml(firstName)},</p>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 20px">${escapeHtml(copy.body)}</p>
      <p style="margin:0 0 24px">
        <a href="${escapeHtml(opts.accessUrl)}"
           style="display:inline-block;background:#07B0F2;color:#ffffff;text-decoration:none;
                  font-weight:700;padding:14px 28px;border-radius:5px;font-size:15px">
          ${escapeHtml(copy.cta)}
        </a>
      </p>
      <p style="color:#8794A3;font-size:13px;line-height:1.6;margin:0">
        Prefer the dashboard?
        <a href="${escapeHtml(opts.dashboardUrl)}" style="color:#07B0F2;font-weight:600">Open dashboard</a>
      </p>
      <p style="color:#8794A3;font-size:13px;margin:20px 0 0">— The Wunderbar Digital Team</p>
    </div>`;

  return { subject: copy.subject, text, html };
}

export async function sendPurchaseStartReminderEmail(opts: {
  to: string;
  reminderKey: PurchaseStartReminderKey;
  productSku: string;
  firstName?: string | null;
  accessUrl: string;
  dashboardUrl: string;
}): Promise<SendResult> {
  const built = buildPurchaseStartReminderEmail(opts);
  return sendTransactionalEmail({
    to: opts.to,
    subject: built.subject,
    html: built.html,
    text: built.text,
  });
}

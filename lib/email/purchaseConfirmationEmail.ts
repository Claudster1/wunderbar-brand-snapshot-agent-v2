// lib/email/purchaseConfirmationEmail.ts
// Transactional purchase confirmation (Resend) — reinforces the buy + one-click access.

import "server-only";

import {
  POST_PURCHASE_EMAILS,
  type EmailTier,
  renderEmailPlainText,
} from "@/content/postPurchaseEmails";
import { DEFAULT_TRANSACTIONAL_EMAIL_LOGO_URL } from "@/lib/email/reportDeliveryEmail";
import { sendTransactionalEmail, type SendResult } from "@/lib/email/transactional";

const PRODUCT_DISPLAY: Record<EmailTier, string> = {
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

export function buildPurchaseConfirmationEmail(opts: {
  tier: EmailTier;
  firstName?: string;
  accessUrl: string;
  dashboardUrl: string;
  brandName?: string | null;
  amountPaidLabel?: string | null;
  logoUrl?: string;
}): { subject: string; text: string; html: string } {
  const copy = POST_PURCHASE_EMAILS[opts.tier];
  const productName = PRODUCT_DISPLAY[opts.tier];
  const firstName = (opts.firstName || "").trim() || "there";
  const brand = opts.brandName?.trim() || "";
  const amount = opts.amountPaidLabel?.trim() || "";
  const logoUrl = opts.logoUrl?.trim() || DEFAULT_TRANSACTIONAL_EMAIL_LOGO_URL;

  const reinforce =
    opts.tier === "blueprint_plus"
      ? `You invested in the full strategic system — ${productName}. That decision puts clarity, activation, and a Strategy Activation Session on your side.`
      : opts.tier === "blueprint"
        ? `You chose ${productName} — strategy mapped with an activation-ready plan. Smart move: you now have a clear path from diagnosis to execution.`
        : `You chose ${productName} — a deeper diagnostic with priorities you can act on immediately. That clarity compounds.`;

  const accessNote = brand
    ? `This purchase is licensed for <strong>${escapeHtml(brand)}</strong>. Use the button below anytime in the next 90 days to open your product with access already unlocked.`
    : `Use the button below anytime in the next 90 days to open your product with access already unlocked.`;

  const text = [
    renderEmailPlainText(opts.tier, {
      firstName,
      startLink: opts.accessUrl,
      dashboardLink: opts.dashboardUrl,
    }),
    "",
    reinforce.replace(/<[^>]+>/g, ""),
    brand ? `Licensed brand: ${brand}` : "",
    amount ? `Amount paid: ${amount}` : "",
    "",
    `One-click access (recommended): ${opts.accessUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const checklistHtml = copy.checklistItems
    .map((item) => `<li style="margin:0 0 6px">${escapeHtml(item)}</li>`)
    .join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#021859">
      <p style="margin:0 0 20px">
        <img src="${escapeHtml(logoUrl)}" alt="Wunderbar Digital" width="160" height="21"
             style="display:block;width:160px;height:auto;border:0" />
      </p>
      <p style="color:#07B0F2;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px">
        Purchase confirmed
      </p>
      <h1 style="color:#021859;margin:0 0 12px;font-size:22px;line-height:1.3">
        ${escapeHtml(copy.subject.replace(/^Your /, "").replace(/ —.*$/, "")) || escapeHtml(productName)}
      </h1>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 12px">Hi ${escapeHtml(firstName)},</p>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 12px">${escapeHtml(copy.opening)}</p>
      <p style="color:#021859;line-height:1.6;margin:0 0 20px;font-weight:600">${escapeHtml(reinforce)}</p>
      ${
        amount
          ? `<p style="color:#5A6B7E;font-size:14px;margin:0 0 8px">Receipt: <strong>${escapeHtml(productName)}</strong>${
              brand ? ` for <strong>${escapeHtml(brand)}</strong>` : ""
            } — ${escapeHtml(amount)}</p>`
          : ""
      }
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 20px">${accessNote}</p>
      <p style="margin:0 0 28px">
        <a href="${escapeHtml(opts.accessUrl)}"
           style="display:inline-block;background:#07B0F2;color:#ffffff;text-decoration:none;
                  font-weight:700;padding:14px 28px;border-radius:5px;font-size:15px">
          ${escapeHtml(copy.buttonLabel)}
        </a>
      </p>
      <p style="color:#021859;font-weight:700;margin:0 0 8px">What to have nearby</p>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 10px">${escapeHtml(copy.checklistIntro)}</p>
      <ul style="color:#404040;line-height:1.55;margin:0 0 16px;padding-left:20px">${checklistHtml}</ul>
      ${
        copy.uploadNote
          ? `<p style="color:#5A6B7E;line-height:1.6;margin:0 0 16px">${escapeHtml(copy.uploadNote)}</p>`
          : ""
      }
      <p style="color:#021859;font-weight:700;margin:0 0 8px">How it works</p>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 16px">${escapeHtml(copy.howItWorks)}</p>
      ${
        copy.sessionNote
          ? `<p style="color:#021859;line-height:1.6;margin:0 0 16px;padding:12px 14px;background:#F0F9FF;border-left:3px solid #07B0F2">${escapeHtml(copy.sessionNote)}</p>`
          : ""
      }
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 8px">${escapeHtml(copy.closing)}</p>
      <p style="color:#8794A3;font-size:13px;line-height:1.6;margin:16px 0 0">
        Prefer the dashboard later?
        <a href="${escapeHtml(opts.dashboardUrl)}" style="color:#07B0F2;font-weight:600">Open dashboard</a>
      </p>
      <p style="color:#8794A3;font-size:12px;line-height:1.6;margin:12px 0 0;word-break:break-all">
        One-click access link:<br>${escapeHtml(opts.accessUrl)}
      </p>
      <p style="color:#8794A3;font-size:13px;margin:20px 0 0">— The Wunderbar Digital Team</p>
    </div>`;

  return { subject: copy.subject, text, html };
}

export async function sendPurchaseConfirmationEmail(opts: {
  to: string;
  tier: EmailTier;
  firstName?: string;
  accessUrl: string;
  dashboardUrl: string;
  brandName?: string | null;
  amountPaidLabel?: string | null;
}): Promise<SendResult> {
  const built = buildPurchaseConfirmationEmail(opts);
  return sendTransactionalEmail({
    to: opts.to,
    subject: built.subject,
    html: built.html,
    text: built.text,
  });
}

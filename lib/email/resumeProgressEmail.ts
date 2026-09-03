// lib/email/resumeProgressEmail.ts
// Immediate transactional "save & continue" email (Resend).
// ActiveCampaign Sequence 9 still handles nurture follow-ups (+24h / +4d / +10d).

import "server-only";

import { sendTransactionalEmail, type SendResult } from "@/lib/email/transactional";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendResumeProgressEmail(params: {
  to: string;
  resumeUrl: string;
  firstName?: string;
}): Promise<SendResult> {
  const name = (params.firstName || "").trim().slice(0, 80);
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const safeGreeting = escapeHtml(greeting);
  const safeResumeUrl = escapeHtml(params.resumeUrl);
  const subject = "Your WunderBrand Snapshot™ — pick up where you left off";
  const text = [
    greeting,
    "",
    "Your diagnostic progress is saved. Use this link anytime to continue with Wundy™ exactly where you stopped:",
    "",
    params.resumeUrl,
    "",
    "If you didn’t request this, you can ignore this email — nothing else will happen.",
    "",
    "— The Wunderbar Digital Team",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#021859">
      <h2 style="color:#021859;margin:0 0 12px">Continue your WunderBrand Snapshot™</h2>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 16px">${safeGreeting}</p>
      <p style="color:#5A6B7E;line-height:1.6;margin:0 0 20px">
        Your diagnostic progress is saved. Tap the button below to pick up with Wundy™ exactly where you left off.
      </p>
      <p style="margin:0 0 24px">
        <a href="${safeResumeUrl}" style="display:inline-block;background:#07B0F2;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:5px">Continue my diagnostic</a>
      </p>
      <p style="color:#8794A3;font-size:13px;line-height:1.6;margin:0">
        If the button doesn’t work, copy and paste this link:<br>
        <span style="word-break:break-all">${safeResumeUrl}</span>
      </p>
      <p style="color:#8794A3;font-size:13px;margin:20px 0 0">
        If you didn’t request this, you can safely ignore this email.
      </p>
      <p style="color:#8794A3;font-size:13px;margin:16px 0 0">— The Wunderbar Digital Team</p>
    </div>`;

  return sendTransactionalEmail({ to: params.to, subject, html, text });
}

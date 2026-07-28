// POST /api/auth/magic-link/send
// Passwordless sign-in: emails a one-tap magic link (transactional, via Resend)
// that establishes a verified-email session. Always responds success to avoid
// account enumeration. Marketing email is unaffected (stays on ActiveCampaign).

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createMagicLinkToken, sanitizeRedirect } from "@/lib/auth/magicLink";
import { sendTransactionalEmail } from "@/lib/email/transactional";
import { publicSnapshotAppUrl } from "@/lib/publicSnapshotAppUrl";

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { EMAIL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "auth-magic-link-send", rateLimit: EMAIL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  // Uniform success response — never reveal whether an email exists / was sent.
  const genericOk = NextResponse.json({ ok: true });

  try {
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.EMAIL_FORM);
    if (sizeCheck) return sizeCheck;

    const body = (await req.json()) as {
      email?: string;
      redirect?: string;
      honeypot?: string;
    };

    // Honeypot — bots fill hidden fields; respond success but do nothing.
    if (typeof body.honeypot === "string" && body.honeypot.length > 0) {
      logger.warn("[Magic Link] Honeypot tripped — dropping request silently");
      return genericOk;
    }

    const email = (body.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      // Do not leak validation detail; generic success.
      return genericOk;
    }

    const { validateEmail } = await import("@/lib/security/emailValidation");
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) return genericOk;

    const redirect = sanitizeRedirect(body.redirect);
    const token = createMagicLinkToken(email, redirect);
    if (!token) {
      // No signing secret in production — cannot issue links. Fail loud in logs only.
      logger.error("[Magic Link] Cannot create token — session secret not configured");
      return genericOk;
    }

    const linkUrl = publicSnapshotAppUrl(`/api/auth/magic-link/verify?token=${encodeURIComponent(token)}`);

    const subject = "Your Wunderbar Digital sign-in link";
    const text = [
      "Click the link below to sign in to your Wunderbar Digital account. It expires in 15 minutes.",
      "",
      linkUrl,
      "",
      "If you didn't request this, you can safely ignore this email.",
      "",
      "— The Wunderbar Digital Team",
    ].join("\n");
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#021859">
        <h2 style="color:#021859;margin:0 0 12px">Sign in to Wunderbar Digital</h2>
        <p style="color:#5A6B7E;line-height:1.6;margin:0 0 20px">Click the button below to sign in to your account. This link expires in 15 minutes.</p>
        <p style="margin:0 0 24px">
          <a href="${linkUrl}" style="display:inline-block;background:#07B0F2;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:5px">Sign in</a>
        </p>
        <p style="color:#8794A3;font-size:13px;line-height:1.6;margin:0">If the button doesn't work, copy and paste this link:<br><span style="word-break:break-all">${linkUrl}</span></p>
        <p style="color:#8794A3;font-size:13px;margin:20px 0 0">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#8794A3;font-size:13px;margin:16px 0 0">— The Wunderbar Digital Team</p>
      </div>`;

    const result = await sendTransactionalEmail({ to: email, subject, html, text });
    if (!result.ok) {
      logger.error("[Magic Link] Send failed", { provider: result.provider, error: result.error });
    }

    return genericOk;
  } catch (err) {
    logger.error("[Magic Link] Error", { error: err instanceof Error ? err.message : String(err) });
    return genericOk;
  }
}

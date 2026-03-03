"use client";

const SMS_OPT_IN_KEY = "wb_sms_opted_in";
const EMAIL_MARKETING_OPT_IN_KEY = "wb_email_marketing_opted_in";

export function getSmsOptInPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SMS_OPT_IN_KEY) === "true";
}

export function setSmsOptInPreference(value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SMS_OPT_IN_KEY, value ? "true" : "false");
}

export function getEmailMarketingOptInPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(EMAIL_MARKETING_OPT_IN_KEY) === "true";
}

export function setEmailMarketingOptInPreference(value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EMAIL_MARKETING_OPT_IN_KEY, value ? "true" : "false");
}

export async function submitSmsConsent(params: {
  email: string;
  source: string;
  optedIn: boolean;
  phoneMobile?: string | null;
}): Promise<void> {
  const trimmedEmail = params.email.trim().toLowerCase();
  if (!trimmedEmail) return;

  await fetch("/api/sms/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: trimmedEmail,
      source: params.source,
      sms_opted_in: params.optedIn,
      phone_mobile: params.phoneMobile || null,
    }),
  }).catch(() => {
    // Non-blocking: don't interrupt primary user flows.
  });
}

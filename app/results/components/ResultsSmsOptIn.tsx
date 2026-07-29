"use client";

import { useCallback, useState } from "react";
import { getPersistedEmail } from "@/lib/persistEmail";
import { setSmsOptInPreference } from "@/lib/smsConsent";

type Props = {
  reportId: string;
  email?: string;
};

function normalizePhoneToE164(input: string): string {
  const cleaned = input.trim().replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) {
    return /^\+[1-9]\d{7,14}$/.test(cleaned) ? cleaned : "";
  }
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
}

export function ResultsSmsOptIn({ reportId, email }: Props) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      const e164 = normalizePhoneToE164(phone);
      if (!e164) {
        setError("Enter a valid mobile number including country code (e.g. +16575551234).");
        return;
      }
      const resolvedEmail = (email || getPersistedEmail() || "").trim().toLowerCase();
      if (!resolvedEmail) {
        setError("We couldn't find your email — please refresh and try again.");
        return;
      }
      setStatus("saving");
      try {
        const res = await fetch("/api/sms/results-optin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, email: resolvedEmail, phone: e164, honeypot }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error || "Something went wrong. Please try again.");
          setStatus("error");
          return;
        }
        setSmsOptInPreference(true);
        setStatus("done");
      } catch {
        setError("Something went wrong. Please try again.");
        setStatus("error");
      }
    },
    [phone, email, reportId, honeypot],
  );

  if (status === "done") {
    return (
      <div className="results-sms-optin results-sms-optin--done" role="status">
        <p className="results-sms-optin__done-title">Check your phone 📱</p>
        <p className="results-sms-optin__done-body">
          We just texted your #1 fix. Reply anytime and we&apos;ll walk you through it.
        </p>
      </div>
    );
  }

  return (
    <div className="results-sms-optin">
      {!open ? (
        <button
          type="button"
          className="results-sms-optin__toggle"
          onClick={() => setOpen(true)}
        >
          <span aria-hidden>💬</span> Want a 2-min text walkthrough of your #1 fix?
        </button>
      ) : (
        <form className="results-sms-optin__form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="results-sms-phone" className="results-sms-optin__label">
            Drop your mobile and we&apos;ll text your top fix (optional).
          </label>
          <div className="results-sms-optin__row">
            <input
              id="results-sms-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="results-sms-optin__input"
              placeholder="+1 657 555 1234"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              disabled={status === "saving"}
            />
            <button
              type="submit"
              className="results-sms-optin__submit"
              disabled={status === "saving" || !phone.trim()}
            >
              {status === "saving" ? "Sending…" : "Text me"}
            </button>
          </div>
          {/* Honeypot — hidden from humans, bots fill it. */}
          <input
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="results-sms-optin__hp"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
          {error ? <p className="results-sms-optin__error">{error}</p> : null}
          <p className="results-sms-optin__legal">
            By entering your number you agree to receive calls and texts from Wunderbar Digital;
            consent isn&apos;t a condition of purchase. Msg frequency varies, msg &amp; data rates
            may apply. Reply HELP for help, STOP to opt out. See our{" "}
            <a
              href="https://wunderbardigital.com/privacy-policy?utm_source=wunderbrand_app&utm_medium=sms_optin&utm_campaign=sms_consent&utm_content=privacy_policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>{" "}
            &amp;{" "}
            <a
              href="https://wunderbardigital.com/terms-of-service?utm_source=wunderbrand_app&utm_medium=sms_optin&utm_campaign=sms_consent&utm_content=messaging_terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Messaging Terms
            </a>
            .
          </p>
        </form>
      )}
    </div>
  );
}

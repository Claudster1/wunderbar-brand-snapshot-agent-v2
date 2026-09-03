"use client";

import { useState } from "react";

type Props = {
  reportId: string;
  returnTo: string;
};

/**
 * Remint verified session for an already email-unlocked report when the
 * visitor knows the owner email (return visits after cookie expiry).
 */
export function ReportAccessRemint({ reportId, returnTo }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/snapshot/ensure-access-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ reportId, email: normalized }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error || "Could not restore access.");
        setStatus("error");
        return;
      }
      window.location.assign(returnTo);
    } catch {
      setError("Something went wrong. Try the sign-in link instead.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="m-0 text-[13px] font-bold text-[#021859]">Already unlocked this Snapshot?</p>
      <p className="m-0 text-[13px] leading-relaxed text-[#5A6B7E]">
        Enter the same email you used on the results page to restore access.
      </p>
      <label htmlFor="report-access-remint-email" className="sr-only">
        Email
      </label>
      <input
        id="report-access-remint-email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="box-border w-full rounded-[5px] border border-[#D6DFE8] px-3 py-2.5 text-[14px] text-[#021859] outline-none focus:border-[#07B0F2]"
      />
      {error ? <p className="m-0 text-[13px] font-semibold text-[#B91C1C]">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-11 w-full items-center justify-center rounded-[5px] border-2 border-[#07B0F2] bg-transparent text-[14px] font-bold text-[#07B0F2] disabled:opacity-60"
      >
        {status === "loading" ? "Restoring…" : "Restore access"}
      </button>
    </form>
  );
}

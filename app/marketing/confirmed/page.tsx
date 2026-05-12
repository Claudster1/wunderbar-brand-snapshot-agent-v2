// app/marketing/confirmed/page.tsx
// Thank-you page after a user clicks the marketing-confirmation link in their welcome email.
// The /api/marketing/confirm route handles the actual AC tag flip and redirects here.

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscription confirmed | Wunderbar",
  robots: { index: false, follow: false },
};

type Status = "ok" | "invalid" | "expired" | "error";

function StatusBlock({ status }: { status: Status }) {
  if (status === "expired" || status === "invalid") {
    return (
      <>
        <h1 className="m-0 mb-3 text-3xl font-extrabold text-brand-midnight">
          Confirmation link is no longer valid
        </h1>
        <p className="m-0 mb-6 max-w-prose text-base leading-relaxed text-brand-muted">
          Confirmation links expire after 14 days for security. You can still come back to your
          snapshot and re-submit the email preference — we&apos;ll send you a fresh link.
        </p>
      </>
    );
  }
  if (status === "error") {
    return (
      <>
        <h1 className="m-0 mb-3 text-3xl font-extrabold text-brand-midnight">
          Almost there — we hit a snag
        </h1>
        <p className="m-0 mb-6 max-w-prose text-base leading-relaxed text-brand-muted">
          Your email is confirmed on our side. If you don&apos;t see the next note in your inbox
          within a few minutes, drop us a line at{" "}
          <a href="mailto:hello@wunderbrand.ai" className="font-semibold text-sky-600 underline">
            hello@wunderbrand.ai
          </a>
          .
        </p>
      </>
    );
  }
  return (
    <>
      <h1 className="m-0 mb-3 text-3xl font-extrabold text-brand-midnight">
        You&apos;re confirmed — thanks!
      </h1>
      <p className="m-0 mb-6 max-w-prose text-base leading-relaxed text-brand-muted">
        Your email is now confirmed and we&apos;ll start sending you the insights you chose. You
        can unsubscribe any time from the footer of any email.
      </p>
    </>
  );
}

function ConfirmedInner({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const raw = typeof searchParams.status === "string" ? searchParams.status : "ok";
  const status: Status = raw === "invalid" || raw === "expired" || raw === "error" ? raw : "ok";
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-12">
      <StatusBlock status={status} />
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-[#07B0F2] px-5 py-3 text-base font-extrabold text-white shadow-[0_8px_28px_rgba(7,176,242,0.18)] hover:brightness-105"
      >
        Back to wunderbrand.ai
      </Link>
    </main>
  );
}

export default function MarketingConfirmedPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <Suspense fallback={<main className="px-6 py-12">Loading…</main>}>
      <ConfirmedInner searchParams={searchParams} />
    </Suspense>
  );
}

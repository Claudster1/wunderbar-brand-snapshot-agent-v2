// app/checkout/success/page.tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { sku?: string; session_id?: string };
}) {
  const sku = searchParams?.sku || "";

  // Set paid plan flag in localStorage after successful checkout
  useEffect(() => {
    localStorage.setItem("has_paid_plan", "true");
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#0C1526]">
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-semibold text-[#021859]">You're in.</h1>
        <p className="mt-4 text-[17px] leading-relaxed">
          Payment confirmed. Next, we'll generate your deliverable and make it available for download.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={searchParams?.session_id ? `/dashboard?session_id=${encodeURIComponent(searchParams.session_id)}` : "/dashboard"}
            className="rounded-[10px] bg-[#07B0F2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#059BD8] no-underline"
          >
            Access my purchase →
          </Link>

          <Link
            href="/brand-snapshot"
            className="rounded-[10px] border border-[#E0E3EA] bg-white px-6 py-3 text-sm font-semibold text-[#021859] hover:bg-[#F5F7FB] no-underline"
          >
            Start Brand Snapshot™ →
          </Link>
        </div>

        {sku ? (
          <p className="mt-8 text-sm text-slate-600">
            Purchased: <span className="font-semibold text-[#021859]">{sku}</span>
          </p>
        ) : null}
      </section>
    </main>
  );
}

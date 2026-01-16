// app/checkout/cancel/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Checkout canceled | Wunderbar Digital",
};

export default function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: { sku?: string };
}) {
  const sku = searchParams?.sku || "";
  return (
    <main className="min-h-screen bg-white text-[#0C1526]">
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-semibold text-[#021859]">No problem.</h1>
        <p className="mt-4 text-[17px] leading-relaxed">
          Your checkout was canceled. You can pick up anytime.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/brand-snapshot-suite#plans"
            className="rounded-[10px] bg-[#07B0F2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#059BD8] no-underline"
          >
            View plans →
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
            Plan: <span className="font-semibold text-[#021859]">{sku}</span>
          </p>
        ) : null}
      </section>
    </main>
  );
}

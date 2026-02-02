// app/checkout/cancel/page.tsx
export default function CheckoutCancelPage() {
  return (
    <main className="max-w-xl mx-auto py-24 text-center">
      <h1 className="text-2xl font-semibold mb-4">Checkout canceled</h1>

      <p className="mb-8">No charge was made. You can try again anytime.</p>

      <a
        href="/brand-snapshot"
        className="inline-block px-6 py-3 rounded-md border"
      >
        Return to Brand Snapshot →
      </a>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="max-w-xl mx-auto py-24 text-center">
      <h1 className="text-3xl font-semibold mb-4">You’re all set</h1>

      <p className="text-lg mb-8">
        Your purchase was successful. We’re preparing your access now.
      </p>

      <a
        href="/dashboard"
        className="inline-block px-6 py-3 rounded-md bg-brand-blue text-white"
      >
        Go to my dashboard →
      </a>
    </main>
  );
}

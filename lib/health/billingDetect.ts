// Detect provider billing / quota failures from API error text.

const BILLING_RE =
  /insufficient_quota|credit_balance|credit balance|no credits remaining|billing|payment.?required|spend.?limit|too low to access|exceeded your current quota|quota.?exceeded|plan.?and.?billing/i;

export function isBillingOrQuotaError(message: string | undefined | null): boolean {
  if (!message) return false;
  return BILLING_RE.test(message);
}

/**
 * Stripe Checkout: required brand field + extract purchased brand from completed sessions.
 * One purchase licenses one brand; additional brands require a new purchase.
 */

import type Stripe from "stripe";

export const CHECKOUT_BRAND_FIELD_KEY = "brand_name";

/** Required text field on Checkout Session / Payment Link–compatible key. */
export function checkoutBrandCustomFields(): Stripe.Checkout.SessionCreateParams.CustomField[] {
  return [
    {
      key: CHECKOUT_BRAND_FIELD_KEY,
      label: {
        type: "custom",
        custom: "Brand this purchase is for",
      },
      type: "text",
      optional: false,
    },
  ];
}

/** Static policy copy (not an input). */
export function checkoutBrandPolicyCustomText(): Stripe.Checkout.SessionCreateParams.CustomText {
  return {
    submit: {
      message: "One brand per purchase. All sales are final.",
    },
  };
}

/**
 * Resolve the licensed brand from a completed Checkout Session.
 * Prefers metadata, then the canonical custom field, then any brand-named text field
 * (covers Dashboard Payment Links with differently keyed fields).
 */
export function brandNameFromCheckoutSession(
  session: Pick<Stripe.Checkout.Session, "metadata" | "custom_fields">,
): string | null {
  const fromMeta = session.metadata?.brand_name?.trim();
  if (fromMeta) return fromMeta;

  const fields = session.custom_fields;
  if (!Array.isArray(fields) || fields.length === 0) return null;

  const canonical = fields.find((f) => f.key === CHECKOUT_BRAND_FIELD_KEY);
  const canonicalVal = canonical?.text?.value?.trim();
  if (canonicalVal) return canonicalVal;

  for (const f of fields) {
    if (f.type !== "text") continue;
    const val = f.text?.value?.trim();
    if (!val) continue;
    if (/brand/i.test(f.key)) return val;
  }

  const textVals = fields
    .filter((f) => f.type === "text" && f.text?.value?.trim())
    .map((f) => f.text!.value!.trim());
  if (textVals.length === 1) return textVals[0] ?? null;

  return null;
}

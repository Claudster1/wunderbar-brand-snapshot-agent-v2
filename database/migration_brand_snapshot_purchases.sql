-- Enable UUID helpers if not already
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Purchases for WunderBrand Suite™ products
CREATE TABLE IF NOT EXISTS public.brand_snapshot_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Customer identifiers
  user_email text NOT NULL,
  user_id uuid NULL, -- optional: link later when you add auth

  -- Stripe identifiers
  stripe_customer_id text NULL,
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id text NULL,

  -- What they bought
  product_sku text NOT NULL, -- SNAPSHOT_PLUS | BLUEPRINT | BLUEPRINT_PLUS
  stripe_price_id text NOT NULL,
  amount_total integer NULL, -- cents
  currency text NULL,

  -- State
  status text NOT NULL DEFAULT 'paid', -- paid | refunded | failed
  fulfilled boolean NOT NULL DEFAULT false,

  -- Links to generated artifacts later
  report_id text NULL,      -- optional: points to a report record
  pdf_url text NULL         -- optional: storage public url or signed url pointer
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_bsp_user_email ON public.brand_snapshot_purchases (user_email);
CREATE INDEX IF NOT EXISTS idx_bsp_status ON public.brand_snapshot_purchases (status);
CREATE INDEX IF NOT EXISTS idx_bsp_product_sku ON public.brand_snapshot_purchases (product_sku);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bsp_set_updated_at ON public.brand_snapshot_purchases;
CREATE TRIGGER trg_bsp_set_updated_at
BEFORE UPDATE ON public.brand_snapshot_purchases
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Optional: enforce lowercase email (defense-in-depth)
ALTER TABLE public.brand_snapshot_purchases
  ADD CONSTRAINT bsp_email_lowercase CHECK (user_email = lower(user_email));

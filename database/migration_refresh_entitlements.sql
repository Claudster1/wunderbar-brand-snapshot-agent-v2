-- ============================================
-- REFRESH ENTITLEMENTS TABLE
-- Tracks refresh/edit eligibility per purchase, per brand.
--
-- Rules:
--   Snapshot (Free)  → Always free retake (no row needed)
--   Snapshot+ ($497)  → Always paid ($47/refresh), no free refreshes
--   Blueprint ($997)  → 1 free refresh within 90 days of delivery, then $97/refresh
--   Blueprint+ ($1,997) → Unlimited edits & refreshes for first year, then paid
--
-- Brand locking: refreshes apply to the assessed brand only.
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who
  user_email TEXT NOT NULL,

  -- What product this entitlement came from
  product_tier TEXT NOT NULL,            -- snapshot_plus | blueprint | blueprint_plus
  purchase_id UUID,                      -- FK to brand_snapshot_purchases.id

  -- Brand locking — refreshes are for this brand only
  brand_name TEXT NOT NULL,              -- The company name assessed at purchase time

  -- Refresh window
  window_start TIMESTAMP NOT NULL DEFAULT NOW(),
  window_end TIMESTAMP NOT NULL,         -- 90 days for Blueprint, 1 year for Blueprint+

  -- Refresh limits
  max_free_refreshes INTEGER NOT NULL DEFAULT 0,  -- 0 for Snapshot+, 1 for Blueprint, NULL-like via large num for Blueprint+
  refreshes_used INTEGER NOT NULL DEFAULT 0,

  -- Paid refresh pricing (after free refreshes are exhausted or window expires)
  paid_refresh_price INTEGER DEFAULT 0,  -- cents: 4700 for Snapshot+, 9700 for Blueprint

  -- AC reminder tracking
  reminder_60_day_sent BOOLEAN DEFAULT FALSE,
  reminder_30_day_sent BOOLEAN DEFAULT FALSE,
  reminder_7_day_sent BOOLEAN DEFAULT FALSE,
  expiry_notice_sent BOOLEAN DEFAULT FALSE,

  -- Status
  status TEXT DEFAULT 'active',          -- active | expired | upgraded

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_ent_email ON refresh_entitlements(user_email);
CREATE INDEX IF NOT EXISTS idx_refresh_ent_tier ON refresh_entitlements(product_tier);
CREATE INDEX IF NOT EXISTS idx_refresh_ent_status ON refresh_entitlements(status);
CREATE INDEX IF NOT EXISTS idx_refresh_ent_window_end ON refresh_entitlements(window_end);
CREATE INDEX IF NOT EXISTS idx_refresh_ent_brand ON refresh_entitlements(user_email, brand_name);

-- updated_at trigger
CREATE TRIGGER update_refresh_entitlements_updated_at
  BEFORE UPDATE ON refresh_entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

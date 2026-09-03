-- Track post-purchase “start your diagnostic” reminder sends.
-- Used by /api/cron/purchase-start-reminders (daily).

ALTER TABLE public.brand_snapshot_purchases
  ADD COLUMN IF NOT EXISTS start_reminder_2d_sent_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS start_reminder_7d_sent_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS start_reminder_21d_sent_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_bsp_unfulfilled_paid
  ON public.brand_snapshot_purchases (created_at)
  WHERE status = 'paid' AND fulfilled = false;

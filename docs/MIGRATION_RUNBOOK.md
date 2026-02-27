# Database Migration Runbook

> WunderBrand Snapshot™ — Supabase Migration Order & Deployment Playbook

## Prerequisites

- Supabase project with access to the SQL Editor
- Service role key in `.env.local` (or production environment)
- Backup of the current database before running destructive migrations

---

## Migration Execution Order

Migrations must be run **in order** because later migrations depend on tables/columns created by earlier ones. All migrations use `IF NOT EXISTS` / `IF EXISTS` guards and are safe to re-run.

**Naming:** The survey responses table is created as `nps_responses` by `migration_nps_responses.sql` and then renamed to `experience_survey_responses` by `migration_rename_nps_to_experience.sql`. Customer-facing naming is "WunderBrand Experience Score™" (the metric) and "WunderBrand Experience Survey" (the survey); internal/technical naming uses `experience_survey_responses`, `experience_score`, `experience_category`, etc.

### Phase 1: Core Schema (Foundation)

Run these first — they create the base tables that everything depends on.

| # | File | Creates |
|---|------|---------|
| 1 | `schema.sql` | `users`, `brand_snapshot_sessions`, `brand_snapshot_results`, `brand_snapshot_reports`, `brand_snapshot_plus_reports`, `brand_blueprint_sessions`, `brand_blueprint_results`, `brand_blueprint_plus_reports`, `user_purchases`, `onboarding_status`, triggers |

### Phase 2: Feature Tables (Independent)

These create standalone tables. Order among them does not matter.

| # | File | Creates |
|---|------|---------|
| 2 | `migration_brand_snapshot_reports.sql` | Ensures `brand_snapshot_reports` exists (safe re-run) |
| 3 | `migration_create_brand_snapshots.sql` | `brand_snapshots` table |
| 4 | `migration_brand_snapshot_purchases.sql` | `brand_snapshot_purchases` table |
| 5 | `migration_analytics_events.sql` | `analytics_events` table |
| 6 | `migration_benchmark_data.sql` | `benchmark_data` table |
| 7 | `migration_brand_team_members.sql` | `brand_team_members` table |
| 8 | `migration_create_support_requests.sql` | `support_requests` table |
| 9 | `migration_refinement_requests.sql` | `brand_snapshot_refinements` table |
| 10 | `migration_snapshot_refinement_requests.sql` | `snapshot_refinement_requests` table |
| 11 | `migration_security_events.sql` | `security_events` table |
| 12 | `migration_nps_responses.sql` | `nps_responses` table (legacy name; see Phase 3 for rename to `experience_survey_responses`) |
| 13 | `migration_testimonials.sql` | `testimonials` table |
| 14 | `migration_voc_survey.sql` | `voc_surveys`, `voc_responses` tables |
| 15 | `migration_session_followups.sql` | `session_followups` table |
| 16 | `migration_add_brand_blueprint_plus_reports.sql` | Ensures Blueprint+ table exists |
| 17 | `migration_refresh_entitlements.sql` | `refresh_entitlements` table |
| 18 | `migration_blueprint_enrichment.sql` | `blueprint_enrichment` table |
| 19 | `migration_brand_workbook.sql` | `brand_workbook` table |
| 20a | `migration_create_blueprint_reports.sql` | `blueprint_reports` table (used by `/api/blueprint/pdf`, `/api/assets/analyze`, `/api/workbook/export`) |
| 20b | `migration_add_user_brands.sql` | `user_brands` table (multi-brand support) |
| 20c | `migration_shared_links.sql` | `shared_links` table (shareable report/deliverable links) |
| 20d | `migration_crm_inbound_ops.sql` | CRM-lite inbound tables (`crm_contacts`, `crm_inquiries`, `crm_activities`, `crm_tasks`, `crm_sync_log`) |

### Phase 3: Alter-Table Migrations (Depend on Phase 1–2)

These add columns, constraints, or indexes to tables that must already exist.

| # | File | Modifies |
|---|------|----------|
| 20 | `migration_rename_nps_to_experience.sql` | Renames `nps_responses` → `experience_survey_responses`, renames indexes to `experience_*` (run after Phase 2) |
| 20b | `migration_rename_nps_columns.sql` | Renames `nps_score`/`nps_category` columns in `testimonials`, `voc_responses`, and `voc_analysis` tables (run after VoC + testimonials tables exist) |
| 21 | `migration_add_columns_and_constraints.sql` | Adds columns, constraints, indexes to core tables |
| 22 | `migration_add_refinement_columns.sql` | Adds `score_history` etc. to `brand_snapshot_reports` |
| 23 | `migration_add_snapshot_progress_columns.sql` | Adds save/resume columns to `brand_snapshot_reports` |
| 24 | `migration_email_verification.sql` | Adds email verification columns to `brand_snapshot_reports` |
| 25 | `migration_brand_standards_data.sql` | Adds JSONB column to `brand_workbook` |
| 26 | `migration_workbook_finalization.sql` | Adds finalization tracking to `brand_workbook` |
| 27 | `migration_brand_asset_uploads.sql` | Storage bucket + `brand_asset_uploads` table |

### Phase 4: Security & RLS

| # | File | Purpose |
|---|------|---------|
| 28 | `migration_enable_rls.sql` | Enables RLS on all public tables |
| 29 | `migration_rls_policies.sql` | Creates initial RLS policies |
| 30 | `migration_add_missing_rls_policies.sql` | Fills in missing service-role policies |

### Phase 5: Performance & Cleanup

| # | File | Purpose |
|---|------|---------|
| 31 | `migration_performance_indexes.sql` | Composite indexes for common queries |
| 32 | `migration_fix_warnings.sql` | Fixes Supabase linter warnings (v1) |
| 33 | `migration_fix_linter_warnings_v2.sql` | Fixes additional linter warnings |

### Storage

| # | File | Purpose |
|---|------|---------|
| 34 | `storage_reports_bucket.sql` | Creates the `reports` storage bucket |

---

## How to Run Migrations

### Option A: Supabase SQL Editor (Recommended for first setup)

1. Open the Supabase dashboard → SQL Editor
2. Copy-paste each migration file in order
3. Click **Run**
4. Verify no errors in the output panel

### Option B: CLI (for automation)

```bash
# Set your connection string
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# Run all migrations in order
for file in \
  database/schema.sql \
  database/migration_brand_snapshot_reports.sql \
  database/migration_create_brand_snapshots.sql \
  database/migration_brand_snapshot_purchases.sql \
  database/migration_analytics_events.sql \
  database/migration_benchmark_data.sql \
  database/migration_brand_team_members.sql \
  database/migration_create_support_requests.sql \
  database/migration_refinement_requests.sql \
  database/migration_snapshot_refinement_requests.sql \
  database/migration_security_events.sql \
  database/migration_nps_responses.sql \
  database/migration_rename_nps_to_experience.sql \
  database/migration_testimonials.sql \
  database/migration_voc_survey.sql \
  database/migration_rename_nps_columns.sql \
  database/migration_session_followups.sql \
  database/migration_add_brand_blueprint_plus_reports.sql \
  database/migration_refresh_entitlements.sql \
  database/migration_blueprint_enrichment.sql \
  database/migration_brand_workbook.sql \
  database/migration_create_blueprint_reports.sql \
  database/migration_add_user_brands.sql \
  database/migration_shared_links.sql \
  database/migration_crm_inbound_ops.sql \
  database/migration_add_columns_and_constraints.sql \
  database/migration_add_refinement_columns.sql \
  database/migration_add_snapshot_progress_columns.sql \
  database/migration_email_verification.sql \
  database/migration_brand_standards_data.sql \
  database/migration_workbook_finalization.sql \
  database/migration_brand_asset_uploads.sql \
  database/migration_enable_rls.sql \
  database/migration_rls_policies.sql \
  database/migration_add_missing_rls_policies.sql \
  database/migration_performance_indexes.sql \
  database/migration_fix_warnings.sql \
  database/migration_fix_linter_warnings_v2.sql \
  database/storage_reports_bucket.sql; do
  echo "Running $file..."
  psql "$DATABASE_URL" -f "$file"
done
```

---

## Pre-Deployment Checklist

- [ ] **Backup database** — Supabase Dashboard → Database → Backups (or `pg_dump`)
- [ ] **Review migration SQL** — Ensure no `DROP TABLE` or destructive operations
- [ ] **Check environment variables** — Run `npx tsx scripts/health-check.ts` locally
- [ ] **Run against staging first** — Never run untested migrations directly on production
- [ ] **Verify RLS** — After Phase 4, confirm API routes still return data

## Post-Deployment Verification

```bash
# 1. Health check
curl https://YOUR_DOMAIN/api/health

# 2. Run the automated test suite
npm test

# 3. Verify a sample snapshot flow end-to-end
# - Start a new snapshot conversation
# - Complete the diagnostic
# - Confirm report generation succeeds
# - Check Supabase for the new row in brand_snapshot_reports

# 4. Verify webhook integrations
# - Trigger a test Stripe webhook (Stripe CLI: stripe trigger checkout.session.completed)
# - Confirm no 500 errors in Vercel/server logs
```

### CRM Smoke Checklist (5-minute)

Run this after each deploy touching CRM, Slack, or cron logic:

```bash
# 0) Set env vars locally for command convenience
export APP_URL="https://app.wunderbrand.ai"
export ADMIN_KEY="YOUR_ADMIN_API_KEY"
export CRON_SECRET="YOUR_CRON_SECRET"

# 1) Read-only CRM smoke endpoint (admin protected)
curl -sS "$APP_URL/api/admin/crm/smoke" \
  -H "Authorization: Bearer $ADMIN_KEY"

# Expect: {"ok":true,...}

# 2) Trigger stale reminder cron manually (auth protected)
curl -i "$APP_URL/api/cron/crm-stale-reminders" \
  -H "Authorization: Bearer $CRON_SECRET"

# Expect: HTTP 200 and JSON with scanned/reminded counts

# 3) Open inbox list API (admin protected)
curl -sS "$APP_URL/api/admin/crm/inquiries?status=all&source=all&limit=5" \
  -H "Authorization: Bearer $ADMIN_KEY"

# Expect: inquiries array + analytics summary
```

Manual UI + Slack checks:

- Open `/admin/inbound` and verify filters (`All owners`, `Unassigned`, `Mine`) return expected rows.
- From Slack reminder, click `Claim` then verify owner updates in inbox and timeline.
- Click `Snooze 4h` then verify inquiry stays out of immediate stale reminder reruns.
- Click `In Progress` / `Responded` and verify status updates in both Slack confirmation and inbox.
- Verify `Open in CRM` deep link opens `/admin/inbound?inquiry=<id>` with the card expanded.

## Rollback Strategy

1. **Column additions** (`ADD COLUMN IF NOT EXISTS`): Safe — no data loss. Rollback by `DROP COLUMN` if needed.
2. **Table creations** (`CREATE TABLE IF NOT EXISTS`): Safe — rollback by `DROP TABLE` (only if table has no production data).
3. **RLS policies**: Rollback by `DROP POLICY policy_name ON table_name`.
4. **Indexes**: Rollback by `DROP INDEX index_name`.

> **Rule of thumb**: Always take a point-in-time backup before running migrations on production. Supabase provides daily automatic backups on Pro plans.

---

## Emergency Contacts

| Role | Action |
|------|--------|
| Database issue | Check Supabase status page: https://status.supabase.com |
| Deployment failure | Roll back Vercel deployment to previous version |
| Stripe webhook errors | Check Stripe Dashboard → Developers → Webhooks → Recent events |
| Feature toggle | Set `FEATURE_FLAG_<NAME>=false` in Vercel env vars (see `lib/featureFlags.ts`) |

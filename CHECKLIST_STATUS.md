# Checklist Status Report

## ✅ Completed Items

### [✅] Add progress + last_step columns
**Status: COMPLETE**
- Migration file: `database/migration_add_snapshot_progress_columns.sql`
- Columns added: `status`, `last_step`, `progress`, `updated_at`
- Indexes created for `status` and `updated_at`

### [✅] Add resume CTA for drafts
**Status: COMPLETE**
- Location: `components/SnapshotHistoryCard.tsx`
- Logic: `showResumeCTA = snapshot.status === "draft"`
- Shows "Resume →" link when status is "draft", "View →" otherwise

### [✅] Build /dashboard/history route
**Status: COMPLETE**
- Location: `app/dashboard/history/page.tsx`
- Uses `getSnapshots()` function
- Displays `SnapshotHistoryCard` components

## ⚠️ Items Needing Implementation

### [⚠️] Wire saveSnapshotProgress() to enrichment steps
**Status: NEEDS IMPLEMENTATION**
- Function exists: `lib/saveSnapshotProgress.ts`
- Need to: Call `saveSnapshotProgress()` after each step/question in the chat flow
- Suggested locations:
  - Chat component that handles Wundy responses
  - API route that processes chat messages
  - After each question is answered in `brandSnapshotFlow.json`

**Action Required:**
1. Find the chat component/hook that processes Wundy responses
2. Add `saveSnapshotProgress()` call after each step completion
3. Pass: `reportId`, `lastStep` (step ID), `progress` (current answers)

### [⚠️] Load progress on resume
**Status: PARTIAL**
- Function exists: `lib/loadSnapshotProgress.ts`
- Resume CTA exists in `SnapshotHistoryCard`
- Need to: Load progress when user clicks "Resume" and restore chat state

**Action Required:**
1. Create API route `/api/snapshot/resume` that calls `loadSnapshotProgress()`
2. Update `/brand-snapshot` page to check for `?resume={id}` query param
3. Load progress data and restore chat state to `last_step`
4. Pre-populate answers from `progress` JSONB field

### [⚠️] Verify upgrade nudges only show to non-buyers
**Status: NEEDS IMPLEMENTATION**
- Current: `getUpgradeNudge()` doesn't check purchase status
- Location: `lib/upgradeNudgeLogic.ts`
- Used in: `components/results/ResultsUpgradeCTA.tsx`

**Action Required:**
1. Add `ProductAccess` parameter to `getUpgradeNudge()`
2. Check `hasSnapshotPlus`, `hasBlueprint`, `hasBlueprintPlus`
3. Return `null` if user already has access to suggested product
4. Update call sites to pass user's product access

**Suggested Fix:**
```typescript
export function getUpgradeNudge(
  snapshot: {
    brand_alignment_score: number;
    primary_pillar: string;
    context_coverage: number;
  },
  access?: ProductAccess
): UpgradeNudge | null {
  // Don't show Snapshot+ nudge if user already has it
  if (snapshot.context_coverage < 70) {
    if (access?.hasSnapshotPlus) return null;
    // ... existing logic
  }
  
  // Don't show Blueprint nudge if user already has it
  if (snapshot.brand_alignment_score < 80) {
    if (access?.hasBlueprint) return null;
    // ... existing logic
  }
}
```

### [⚠️] Confirm AC triggers fire from view + click events
**Status: VERIFIED BUT NEEDS TESTING**
- Analytics system: `lib/analytics.ts` dispatches custom events
- AC integration: `app/layout.tsx` listens for events and forwards to `vgo`
- Events tracked:
  - `suite_explore_clicked` in `ResultsUpgradeCTA`
  - `snapshot_completed` in `lib/snapshotTracking.ts`
  - `snapshot_plus_viewed` in `lib/snapshotTracking.ts`

**Action Required:**
1. Test that events fire when CTAs are clicked
2. Verify events appear in ActiveCampaign dashboard
3. Confirm automations trigger based on events
4. Add view events for key pages (results, snapshot-plus, blueprint)

**Suggested Additions:**
- Add `useEffect` in `ResultsPage` to track `results_page_viewed`
- Add `useEffect` in `SnapshotPlusPage` to track `snapshot_plus_page_viewed`
- Add click tracking to all upgrade CTAs

## Summary

**Completed: 3/7 items**
**Needs Implementation: 4/7 items**

### Priority Actions:
1. **HIGH**: Wire `saveSnapshotProgress()` to chat flow steps
2. **HIGH**: Implement resume functionality with progress loading
3. **MEDIUM**: Add purchase checks to upgrade nudges
4. **LOW**: Add view event tracking and verify AC triggers

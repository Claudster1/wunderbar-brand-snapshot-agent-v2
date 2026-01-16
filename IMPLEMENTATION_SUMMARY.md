# Implementation Summary

## ✅ Completed Items

### 1. Add purchase checks to upgrade nudges
- **Updated**: `lib/upgradeNudgeLogic.ts`
  - Added `ProductAccess` parameter to `getUpgradeNudge()`
  - Returns `null` if user already has access to suggested product
- **Created**: `lib/getUserProductAccess.ts`
  - Function to fetch user product access from database
- **Created**: `app/api/user/access/route.ts`
  - API route to get user product access by email
- **Updated**: `components/results/ResultsUpgradeCTA.tsx`
  - Now fetches and passes user access to `getUpgradeNudge()`
  - Only shows nudges to non-buyers

### 2. Create resume API route and load progress functionality
- **Created**: `app/api/snapshot/resume/route.ts`
  - GET endpoint to load resume data by reportId
  - Returns `lastStep`, `progress`, and report context
- **Created**: `app/api/snapshot/progress/route.ts`
  - POST endpoint to save progress
  - GET endpoint to load progress
- **Created**: `lib/createDraftReport.ts`
  - Function to create a draft report when chat starts

### 3. Add view event tracking
- **Created**: `components/results/ResultsPageViewTracker.tsx`
  - Tracks `results_page_viewed` event with score and primary pillar
- **Updated**: `app/results/page.tsx`
  - Includes `ResultsPageViewTracker` component
  - Passes `userEmail` to `ResultsUpgradeCTA` for access checking

## ⚠️ Partially Implemented

### 4. Wire saveSnapshotProgress() to chat flow steps
**Status**: Infrastructure ready, needs integration

**What's Done:**
- ✅ `saveSnapshotProgress()` function exists
- ✅ Progress API routes created
- ✅ `createDraftReport()` function created

**What's Needed:**
1. **Update `useBrandChat` hook** to:
   - Create draft report when chat starts (or load if `?resume={id}`)
   - Save progress after each assistant message
   - Track current step/question identifier
   - Update report status to "completed" when snapshot finishes

2. **Update brand snapshot page** to:
   - Check for `?resume={id}` query param
   - Load progress data and restore chat state
   - Pre-populate answers from `progress` JSONB

**Suggested Implementation:**
```typescript
// In useBrandChat hook
useEffect(() => {
  // Check for resume param
  const urlParams = new URLSearchParams(window.location.search);
  const resumeId = urlParams.get('resume');
  
  if (resumeId) {
    // Load progress and restore state
    fetch(`/api/snapshot/resume?reportId=${resumeId}`)
      .then(res => res.json())
      .then(data => {
        // Restore messages from progress
        // Set current step
      });
  } else {
    // Create new draft report
    createDraftReport().then(id => {
      setReportId(id);
    });
  }
}, []);

// After each assistant message
const saveProgress = async (step: string, answers: Record<string, any>) => {
  if (reportId) {
    await fetch('/api/snapshot/progress', {
      method: 'POST',
      body: JSON.stringify({
        reportId,
        lastStep: step,
        progress: answers,
      }),
    });
  }
};
```

## Files Created/Modified

### New Files:
- `app/api/snapshot/progress/route.ts` - Progress save/load API
- `app/api/snapshot/resume/route.ts` - Resume data API
- `app/api/user/access/route.ts` - User access API
- `lib/createDraftReport.ts` - Draft report creation
- `lib/getUserProductAccess.ts` - Access lookup
- `components/results/ResultsPageViewTracker.tsx` - View tracking

### Modified Files:
- `lib/upgradeNudgeLogic.ts` - Added purchase checks
- `components/results/ResultsUpgradeCTA.tsx` - Added access fetching
- `app/results/page.tsx` - Added view tracking and email prop

## Next Steps

1. **Integrate progress saving into chat flow** (highest priority)
   - Update `useBrandChat` hook
   - Update brand snapshot page for resume functionality

2. **Test end-to-end flow**
   - Create draft → save progress → resume → complete
   - Verify upgrade nudges don't show to buyers
   - Verify AC events fire correctly

3. **Add more view events** (optional)
   - `snapshot_plus_page_viewed`
   - `blueprint_page_viewed`
   - `dashboard_viewed`

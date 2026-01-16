# Chat Progress Integration - Complete

## ✅ Implementation Summary

Progress saving has been fully integrated into the chat flow. Users can now:
- Start a snapshot and have progress automatically saved
- Resume a draft snapshot from where they left off
- Have their conversation state restored when resuming

## Changes Made

### 1. Updated `useBrandChat` Hook (`src/hooks/useBrandChat.ts`)

**Added:**
- `reportId` state to track the current draft report
- `useEffect` hook to initialize on mount:
  - Checks for `?resume={id}` query parameter
  - Loads existing progress if resuming
  - Creates new draft report if starting fresh
- `extractAnswers()` function to parse conversation history
- `saveProgress()` function to save progress after each step
- Progress saving after each assistant message
- Status update to "completed" when snapshot finishes

**Key Features:**
- Automatically creates draft report when chat starts
- Saves progress after each assistant response
- Tracks step number based on message count
- Restores messages from progress when resuming
- Updates report status when snapshot completes

### 2. Created API Routes

**`/api/snapshot/draft` (POST)**
- Creates a new draft report with status "draft"
- Returns `reportId` for progress tracking
- Sets initial values for required fields

**`/api/snapshot/progress` (POST/GET)**
- POST: Saves progress with `lastStep` and `progress` JSONB
- GET: Loads progress by `reportId`
- Used by chat hook to persist state

**`/api/snapshot/resume` (GET)**
- Loads full resume data including progress and report context
- Returns `lastStep`, `progress`, and report metadata
- Used when user clicks "Resume" from history

**`/api/snapshot/complete` (POST)**
- Updates report status from "draft" to "completed"
- Called when snapshot finishes

### 3. Progress Data Structure

Progress is stored as JSONB with:
```typescript
{
  messages: BrandChatMessage[], // Full conversation history
  response_0: string,           // User responses indexed
  response_1: string,
  businessName?: string,          // Extracted structured data
  hasWebsite?: boolean,
  industry?: string,
  lastUpdated: string,           // ISO timestamp
  completed?: boolean,            // Completion flag
  completedAt?: string           // Completion timestamp
}
```

### 4. Resume Flow

1. User clicks "Resume →" on draft snapshot in history
2. Navigates to `/brand-snapshot?resume={reportId}`
3. `useBrandChat` hook detects resume param
4. Fetches progress data from `/api/snapshot/resume`
5. Restores messages from `progress.messages`
6. Continues conversation from `lastStep`

## Usage

### Starting New Snapshot
```typescript
// Automatically creates draft when chat initializes
const { messages, sendMessage } = useBrandChat();
// Draft report created in background
```

### Resuming Draft
```typescript
// Navigate with resume param
/brand-snapshot?resume={reportId}

// Hook automatically:
// 1. Detects resume param
// 2. Loads progress
// 3. Restores messages
// 4. Continues from last step
```

### Progress Saving
```typescript
// Automatically saves after each assistant message
// Step identifier: "step_1", "step_2", etc.
// Progress includes full conversation history
```

## Database Schema

The `brand_snapshot_reports` table now includes:
- `status` (TEXT) - "draft" | "completed"
- `last_step` (TEXT) - Current step identifier
- `progress` (JSONB) - Full progress data
- `updated_at` (TIMESTAMPTZ) - Auto-updated timestamp

## Testing Checklist

- [ ] Start new snapshot → verify draft created
- [ ] Answer questions → verify progress saved after each step
- [ ] Close browser mid-conversation
- [ ] Return to history → see draft with "Resume" button
- [ ] Click Resume → verify messages restored
- [ ] Continue conversation → verify new progress saved
- [ ] Complete snapshot → verify status updated to "completed"

## Notes

- Progress is saved asynchronously (non-blocking)
- If save fails, conversation continues (graceful degradation)
- Messages are stored in progress for full state restoration
- Step identifiers are sequential ("step_1", "step_2", etc.)
- Draft reports are filtered by `status = 'draft'` in history

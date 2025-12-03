# Complete Brand Snapshot™ Flow

## Architecture Overview

```
USER
  ↓
WUNDY AGENT (Chat Interface)
  ↓ (JSON Output)
NEXT.JS API → DATABASE (Supabase)
  ↓ (email event)
ACTIVE CAMPAIGN
  ↓ (email with report link)
USER CLICKS LINK
  ↓
next.js page: /report/[id]
  ↓ (fetches from DB)
BRAND SNAPSHOT™ REPORT (dynamic webpage)
  ↓
Optional: PDF, Blueprint CTA, Share buttons
```

## Step-by-Step Flow

### 1. User Interaction (Chat)
- User interacts with Wundy through the chat interface
- Wundy asks questions following the conversational flow
- User provides answers naturally

### 2. Scoring & JSON Output
- When all questions are answered, Wundy calculates scores
- Wundy outputs JSON ONLY (no scores displayed in chat)
- JSON includes:
  - User information (name, email, company, etc.)
  - Brand data (what they do, who they serve, etc.)
  - Marketing data
  - Visual brand data
  - Scores (pillar scores + Brand Alignment Score™)
  - Full report (insights, recommendations)

### 3. Front-End Processing
- Chat hook (`useBrandChat.ts`) detects JSON in response
- Extracts scores and sends to parent page via `postMessage` for visual display
- When final JSON is detected (with email and optIn), automatically:
  - Saves to Supabase via `/api/report/save`
  - Syncs to ActiveCampaign via `/api/activecampaign`
  - Generates unique `reportId` for the report link

### 4. Database Storage (Supabase)
- Report saved to `brand_snapshot_reports` table
- Includes:
  - `report_id` (unique identifier)
  - User information
  - Scores
  - Full report JSON
  - Timestamp

### 5. ActiveCampaign Sync
- Contact created/updated in ActiveCampaign
- Custom fields populated with all brand snapshot data
- Tags applied based on scores and opt-in status
- Report link included in custom field for email automation

### 6. Email Delivery
- ActiveCampaign sends email with report link
- Link format: `https://yourdomain.com/report/[reportId]`
- Email includes personalized content based on scores

### 7. Report Page Access
- User clicks link in email
- Navigates to `/report/[id]` page
- Page fetches report data from Supabase via `/api/report/get`
- Displays full Brand Snapshot™ report

### 8. Report Display
- Shows Brand Alignment Score™ with visual meter
- Displays pillar breakdown with individual scores
- Shows insights for each pillar
- Lists recommendations
- Includes website notes (if provided)

### 9. Report Actions
- **Download PDF**: `/api/report/pdf?id=[reportId]` (to be implemented)
- **Share on LinkedIn**: Opens LinkedIn share dialog
- **Start Your Blueprint™**: Links to `/blueprint` page

## API Endpoints

### `/api/brand-snapshot` (POST)
- Handles chat messages
- Calls OpenAI with system prompt
- Returns Wundy's response

### `/api/report/save` (POST)
- Saves report to Supabase
- Requires: Full Wundy JSON
- Returns: `{ reportId, id, success }`

### `/api/report/get` (GET)
- Fetches report from Supabase
- Query param: `?id=[reportId]`
- Returns: Full report data

### `/api/activecampaign` (POST)
- Syncs data to ActiveCampaign
- Requires: Full Wundy JSON
- Returns: `{ success, contactId }`

## Environment Variables Required

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### ActiveCampaign
- `ACTIVE_CAMPAIGN_API_KEY`
- `ACTIVE_CAMPAIGN_API_URL`
- `AC_FIELD_*` (optional, for custom field IDs)

### OpenAI
- `OPENAI_API_KEY`

### Base URL
- `NEXT_PUBLIC_BASE_URL` (for report links in emails)

## Database Schema (Supabase)

```sql
CREATE TABLE brand_snapshot_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT UNIQUE NOT NULL,
  user_name TEXT,
  email TEXT,
  company_name TEXT,
  industry TEXT,
  brand_alignment_score INTEGER,
  pillar_scores JSONB,
  pillar_insights JSONB,
  recommendations JSONB,
  website_notes TEXT,
  summary TEXT,
  opt_in BOOLEAN,
  full_report JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## ActiveCampaign Setup

1. Create custom fields for all data points
2. Set up email automation that:
   - Triggers when contact receives `brand_snapshot_completed` tag
   - Includes report link in email: `{{REPORT_LINK_FIELD}}`
   - Personalizes content based on score tags

## Testing the Flow

1. Complete a brand snapshot conversation
2. Verify JSON is output (check browser console)
3. Check Supabase for saved report
4. Check ActiveCampaign for synced contact
5. Click report link to verify report page loads
6. Test PDF download (when implemented)
7. Test share buttons

## Error Handling

- If Supabase save fails: Error logged, user sees error message
- If ActiveCampaign sync fails: Report still saved, error logged
- If report fetch fails: 404 page shown
- All errors are logged to console for debugging


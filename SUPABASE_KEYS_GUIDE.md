# How to Find Your Supabase URL and API Keys

## Quick Answer

**Close the "Connect to your project" modal** - that's for database connections, not what you need.

Instead, go to: **Settings → API** (in the left sidebar)

## Step-by-Step Guide

### 1. Navigate to API Settings

1. In Supabase Dashboard, look at the **left sidebar**
2. Click on **Settings** (gear icon)
3. Click on **API** in the settings menu

### 2. What You'll See

On the API settings page, you'll find:

#### Project URL
- **Label:** "Project URL" or "URL"
- **Value:** `https://sfrvslkjjxmmlzazxdwa.supabase.co` (your actual URL)
- **Use for:** `NEXT_PUBLIC_SUPABASE_URL`

#### API Keys Section

You'll see several keys:

1. **anon / public key**
   - **Label:** "anon" or "public" 
   - **Looks like:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
   - **Use for:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Safe to expose:** Yes (that's why it's called "anon")

2. **service_role key**
   - **Label:** "service_role"
   - **Looks like:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
   - **Use for:** `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_SECRET_KEY`
   - **⚠️ NEVER expose:** This has admin privileges!

## What About the "Connect to your project" Modal?

That modal is for:
- Direct database connections (Postgres)
- Connection strings for ORMs
- Database passwords

**You don't need this for Next.js/Vercel!** You only need the API keys from Settings → API.

## Visual Guide

```
Supabase Dashboard
├── SQL Editor
├── Table Editor
├── Authentication
├── Storage
├── Edge Functions
├── Database
└── Settings ⚙️  ← Click here
    ├── General
    ├── API 🔑  ← Click here (THIS IS WHERE YOU NEED TO GO!)
    ├── Database
    ├── Auth
    └── ...
```

## What to Copy

From Settings → API page, copy:

1. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
2. **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## Where to Add Them

### In Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each one there

### In Local Development:
1. Add to `.env.local` file (never commit this file!)

## Security Reminder

- ✅ **anon key** - Safe to expose (used in client-side code)
- ❌ **service_role key** - NEVER expose (server-side only)
- ❌ **Database password** - NEVER expose (not needed for Next.js anyway)

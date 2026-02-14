# Supabase Setup Guide

This guide will help you get the required Supabase environment variables for the WunderBrand Snapshot™ Agent.

## Required Environment Variables

You need **3 environment variables** from your Supabase project:

1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key (safe for client-side)
3. `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (admin key, server-side only)

## How to Get These Values

### Step 1: Log in to Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Log in to your account
3. Select your project (or create a new one if you haven't already)

### Step 2: Get Your Project URL and Keys

1. In your Supabase project dashboard, click on **Settings** (gear icon in the left sidebar)
2. Click on **API** in the settings menu
3. You'll see a page with your API credentials

### Step 3: Copy the Values

On the API settings page, you'll find:

#### Project URL
- **Label:** "Project URL" or "URL"
- **Value:** Something like `https://xxxxxxxxxxxxx.supabase.co`
- **Copy this to:** `NEXT_PUBLIC_SUPABASE_URL`

#### Anon/Public Key
- **Label:** "anon" or "public" key
- **Value:** A long JWT token starting with `eyJ...`
- **Copy this to:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Note:** This key is safe to expose in client-side code (that's why it's called "anon")

#### Service Role Key
- **Label:** "service_role" key
- **Value:** A long JWT token starting with `eyJ...`
- **Copy this to:** `SUPABASE_SERVICE_ROLE_KEY`
- **⚠️ WARNING:** This key has admin privileges. **NEVER** expose it in client-side code or commit it to Git. Only use it in server-side code (API routes).

### Step 4: Add to Your Environment Variables

#### For Local Development (`.env.local`)

Create or update `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Click on **Environment Variables**
4. Add each variable:
   - Click **Add New**
   - Enter the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the value
   - Select **Production**, **Preview**, and **Development** (or as needed)
   - Click **Save**
5. Repeat for all three variables

**Important:** After adding environment variables in Vercel, you need to **redeploy** your project for the changes to take effect.

## Current Hardcoded Values

I notice there are hardcoded fallback values in `lib/supabase.ts`. These appear to be from a previous setup. You should:

1. Replace them with your own Supabase project values
2. Remove the hardcoded fallbacks (or keep them as fallbacks if you prefer, but use your own values)

## Security Notes

- ✅ **Safe to expose:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (they're prefixed with `NEXT_PUBLIC_` which means they're exposed to the browser)
- ❌ **Never expose:** `SUPABASE_SERVICE_ROLE_KEY` (this is only used in server-side API routes)

## Verify Your Setup

After adding the environment variables:

1. Restart your local dev server (`npm run dev`)
2. Check that the app loads without errors
3. Test the report save functionality to ensure Supabase connection works

## Need Help?

If you're having trouble finding these values:
1. Make sure you're logged into the correct Supabase project
2. Check that your project is active (not paused)
3. The API keys are always available in Settings → API


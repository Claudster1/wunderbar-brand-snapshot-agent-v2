# ⚠️ SECURITY NOTICE: API Keys Exposed

## What Happened

Real API keys were temporarily added to `VERCEL_DEPLOYMENT.md` and committed to Git. These have been removed, but if the repository is public or was shared, the keys may have been exposed.

## Immediate Action Required

### 1. Rotate Your API Keys

**Supabase Keys:**
1. Go to https://supabase.com/dashboard → Your Project → Settings → API
2. Regenerate your **anon key** (the one that was exposed)
3. Update it in:
   - Vercel environment variables
   - Your local `.env.local` file

**ActiveCampaign API Key:**
1. Go to ActiveCampaign → Settings → Developer
2. Generate a new API token
3. Update it in:
   - Vercel environment variables
   - Your local `.env.local` file

### 2. Check Repository Visibility

- If your repository is **public**: Keys are exposed to anyone
- If your repository is **private**: Only people with access can see them
- Check: GitHub → Settings → Repository visibility

### 3. Review Git History

The keys were in commit history. If this is a security concern:
- Consider using GitHub's secret scanning
- If repository was public, assume keys are compromised

## Where to Add Keys (Correct Way)

### ✅ DO: Add keys in Vercel Dashboard
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add each key there
3. They're encrypted and secure

### ✅ DO: Add keys in `.env.local` (local only)
- This file is in `.gitignore` (won't be committed)
- Only for local development

### ❌ DON'T: Add keys in documentation files
- Files like `.md` get committed to Git
- Anyone with repo access can see them

### ❌ DON'T: Add keys in code files
- Never hardcode keys in `.ts`, `.js`, `.tsx` files
- Always use environment variables

## Best Practices

1. **Never commit secrets** - Use `.gitignore` for `.env.local`
2. **Use placeholders in docs** - `your_api_key_here` not real keys
3. **Rotate keys regularly** - Especially if exposed
4. **Use secret management** - Vercel's environment variables are encrypted
5. **Review before committing** - Check `git diff` before pushing

## Current Status

- ✅ Keys removed from documentation
- ✅ File updated with placeholders only
- ⚠️ You should rotate the exposed keys
- ✅ Future keys should only go in Vercel dashboard

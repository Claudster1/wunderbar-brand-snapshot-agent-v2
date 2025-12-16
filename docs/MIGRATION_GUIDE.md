# Migration Guide: Moving Brand Snapshot App to New Computer

This guide ensures a smooth migration without breaking the application.

## 📋 Pre-Migration Checklist

### 1. **Backup Current Environment**

Before moving, ensure you have:

- ✅ All source code (should be in git)
- ✅ `.env.local` file with all environment variables
- ✅ Any local database dumps (if using local Supabase)
- ✅ Any custom fonts or assets in `/public/fonts`
- ✅ Supabase project credentials

## 🚀 Migration Steps

### Step 1: Clone Repository

```bash
# On new computer, clone the repository
git clone <your-repo-url>
cd brand-snapshot
```

### Step 2: Install Node.js

**Required:** Node.js >= 20.0.0

```bash
# Check Node version
node --version

# If needed, install Node 20+ using nvm or download from nodejs.org
```

### Step 3: Install Dependencies

```bash
npm install
```

This installs all packages from `package.json`:
- `@supabase/ssr`
- `@supabase/supabase-js`
- `@react-pdf/renderer`
- `next`
- `react`
- `openai`
- And all dev dependencies

### Step 4: Set Up Environment Variables

Create `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here # fallback (older setups)
SUPABASE_SECRET_KEY=your_secret_key_here # Supabase "Secret" key (server-only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here # fallback alias (older setups)
SUPABASE_URL=https://YOUR-PROJECT.supabase.co

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Base URL (for redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Or for production:
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

**⚠️ CRITICAL:** 
- Never commit `.env.local` to git
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to client-side code
- Get these values from your Supabase dashboard

### Step 5: Generate Supabase Types

```bash
# Option 1: Using project ID (requires Supabase CLI login)
npm run types:supabase

# Option 2: Using database URL (more reliable)
npx supabase gen types typescript \
  --schema public \
  --project-id YOUR_PROJECT_ID \
  --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
  > supabase/types.ts
```

### Step 6: Verify Database Connection

Test that your Supabase connection works:

```bash
# Start dev server
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/brand-snapshot \
  -H "Content-Type: application/json" \
  -d '{"user_email": "test@example.com", "brand_alignment_score": 78, "pillar_scores": {"positioning":14,"messaging":15,"visibility":16,"credibility":12,"conversion":13}}'
```

### Step 7: Check for Missing Assets

Verify these directories exist and have required files:

```bash
# Fonts for PDF generation
ls -la public/fonts/
# Should have: HelveticaNeue-Regular.ttf, HelveticaNeue-Medium.ttf, HelveticaNeue-Bold.ttf

# Assets
ls -la src/assets/
# Should have: wundy-logo.jpeg, wundy-smile.png, etc.
```

If fonts are missing, download them and place in `/public/fonts/`.

## 🔍 Verification Checklist

After migration, verify:

- [ ] `npm run dev` starts without errors
- [ ] Can access `http://localhost:3000`
- [ ] API routes respond correctly
- [ ] Database queries work (test a report fetch)
- [ ] PDF generation works (if fonts are installed)
- [ ] Environment variables are loaded correctly

## 🐛 Common Issues & Solutions

### Issue: "supabaseUrl is required"
**Solution:** Check that `NEXT_PUBLIC_SUPABASE_URL` is set in `.env.local`

### Issue: "Module not found" errors
**Solution:** Run `npm install` again, ensure `node_modules` exists

### Issue: TypeScript errors about Database types
**Solution:** Run `npm run types:supabase` to regenerate types

### Issue: PDF generation fails
**Solution:** Ensure fonts exist in `/public/fonts/` directory

### Issue: Port 3000 already in use
**Solution:** 
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
npm run dev -- -p 3001
```

## 📦 What NOT to Migrate

Don't copy these (they'll be regenerated):

- `node_modules/` - Run `npm install` instead
- `.next/` - Build cache, regenerated on `npm run dev`
- `.env.local` - Create fresh with your credentials
- `supabase/types.ts` - Regenerate with `npm run types:supabase`

## 🔐 Security Reminders

1. **Never commit `.env.local`** - It's in `.gitignore` for a reason
2. **Service Role Key** - Keep `SUPABASE_SERVICE_ROLE_KEY` secret
3. **API Keys** - Don't share OpenAI API keys
4. **Database Credentials** - Store securely, use password manager

## 📝 Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Generate Supabase types
npm run types:supabase

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

## 🆘 If Something Breaks

1. **Check environment variables** - Most issues are missing env vars
2. **Verify Node version** - Must be >= 20.0.0
3. **Clear cache and reinstall**:
   ```bash
   rm -rf node_modules .next
   npm install
   npm run dev
   ```
4. **Check Supabase dashboard** - Ensure project is active
5. **Review error logs** - Check terminal output and browser console

## 📞 Support

If issues persist:
- Check Supabase dashboard for project status
- Verify all environment variables are correct
- Ensure database migrations have been run
- Review error messages in terminal and browser console


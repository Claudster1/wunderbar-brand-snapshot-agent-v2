# Vercel Deployment Guide

This guide covers everything you need to know for deploying this Next.js app to Vercel.

## ✅ What Works Out of the Box

- **Next.js 14** - Fully optimized for Vercel
- **Edge Runtime** - All OG image routes use edge runtime (perfect for Vercel)
- **API Routes** - All API routes work seamlessly on Vercel
- **Static Generation** - Automatic static optimization
- **Image Optimization** - Vercel handles this automatically (sharp is installed)

## 🔧 Required Configuration

### 1. Environment Variables

Add these environment variables in your Vercel project dashboard:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (e.g., `https://your-project.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key (get from Supabase dashboard)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-only, get from Supabase dashboard)
- `OPENAI_API_KEY` - Your OpenAI API key (get from https://platform.openai.com/api-keys)
- `NEXT_PUBLIC_BASE_URL` - Your Vercel deployment URL or custom domain (e.g., `https://www.brandsnapshot.ai`)

**Optional:**
- `ACTIVE_CAMPAIGN_API_KEY` - Your ActiveCampaign API token (get from ActiveCampaign dashboard)
- `ACTIVE_CAMPAIGN_API_URL` - Your ActiveCampaign API URL (e.g., `https://YOUR-ACCOUNT.api-us1.com`)
- `REPORT_STORAGE_BUCKET` - Supabase storage bucket name (defaults to `brand-snapshot-reports`)

### 2. Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Enter the variable name
   - Enter the value
   - Select environments: **Production**, **Preview**, and **Development**
   - Click **Save**
4. **Important:** After adding variables, redeploy your project

### 3. Base URL Configuration

For `NEXT_PUBLIC_BASE_URL`, you have two options:

**Option A: Use Vercel's automatic URL detection (Recommended)**
```bash
# In Vercel, set NEXT_PUBLIC_BASE_URL to:
# For production: https://your-app.vercel.app
# Or use Vercel's automatic URL: https://${VERCEL_URL}
```

**Option B: Use a custom domain**
```bash
NEXT_PUBLIC_BASE_URL=https://www.brandsnapshot.ai
```

The code automatically falls back to `https://brand-snapshot.vercel.app` if not set, but you should set your actual domain.

## 🚀 Deployment Steps

### First Deployment

1. **Connect your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click **Add New Project**
   - Import your Git repository
   - Vercel will auto-detect Next.js

2. **Configure build settings:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

3. **Add environment variables** (see above)

4. **Deploy!**

### Subsequent Deployments

Vercel automatically deploys on every push to your main branch. For preview deployments, it deploys on every pull request.

## 📝 Important Notes

### Build Configuration

- The `next.config.js` has `output: 'standalone'` enabled. This is fine:
  - **For Vercel:** Vercel will ignore this and use its own optimized build system
  - **For Docker:** This is required for Docker builds
  - **Using Both:** You can use Docker locally and deploy to Vercel - they work together!

### Edge Runtime

All OG image routes (`/api/og/*`) use Edge Runtime, which is perfect for Vercel's edge network. These routes will be fast and globally distributed.

### API Routes

All API routes work on Vercel without modification:
- `/api/brand-snapshot` - Chat endpoint
- `/api/snapshot` - Snapshot generation
- `/api/report/*` - Report endpoints
- `/api/og/*` - Open Graph images
- All other API routes

### Database Connections

Supabase connections work perfectly on Vercel. Make sure:
- `NEXT_PUBLIC_SUPABASE_URL` is set (for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` is set (for server-side API routes)

### File Storage

PDF reports are stored in Supabase Storage. Ensure:
- Your Supabase storage bucket is configured
- `REPORT_STORAGE_BUCKET` is set (or defaults to `brand-snapshot-reports`)

## 🔍 Troubleshooting

### Build Fails

1. **Check Node.js version:**
   - Vercel should auto-detect Node 20+ from `package.json`
   - If not, add `VERCEL_NODE_VERSION=20` in environment variables

2. **Check environment variables:**
   - Ensure all required variables are set
   - Check that `OPENAI_API_KEY` is set (build might fail without it)

3. **Check build logs:**
   - Go to your deployment → **Build Logs**
   - Look for specific error messages

### Runtime Errors

1. **"Missing credentials" errors:**
   - Verify all environment variables are set in Vercel
   - Make sure they're set for the correct environment (Production/Preview/Development)

2. **API route errors:**
   - Check Vercel function logs
   - Verify Supabase and OpenAI credentials

3. **OG image generation fails:**
   - Check that `NEXT_PUBLIC_BASE_URL` is set correctly
   - Verify SVG assets exist in `/public/assets/og/`

### Performance

- Vercel automatically optimizes Next.js apps
- Edge runtime routes are globally distributed
- Static pages are automatically cached
- API routes use Vercel's serverless functions

## 🔐 Security Checklist

- ✅ Never commit `.env.local` to Git
- ✅ `SUPABASE_SERVICE_ROLE_KEY` is server-only (not exposed to client)
- ✅ `OPENAI_API_KEY` is server-only
- ✅ All `NEXT_PUBLIC_*` variables are safe to expose (by design)
- ✅ Content Security Policy headers are configured

## 📊 Monitoring

Vercel provides:
- **Analytics** - Page views, performance metrics
- **Logs** - Function logs, build logs
- **Deployments** - Deployment history and status

## 🎯 Next Steps After Deployment

1. **Test all functionality:**
   - Brand Snapshot flow
   - Report generation
   - PDF downloads
   - OG image generation

2. **Set up custom domain** (if needed):
   - Go to **Settings** → **Domains**
   - Add your custom domain
   - Update `NEXT_PUBLIC_BASE_URL` to match

3. **Configure preview deployments:**
   - Preview deployments automatically use preview environment variables
   - Test on preview URLs before merging to production

## 📚 Additional Resources

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

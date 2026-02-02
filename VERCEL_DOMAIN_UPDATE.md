# Vercel Domain Update Checklist: app.brandsnapshot.ai

## ✅ Steps to Update Domain in Vercel

### 1. Add Domain in Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `app.brandsnapshot.ai`
5. Click **Add**

### 2. Configure DNS (Already Done in GoDaddy)
- ✅ DNS records should already be updated in GoDaddy
- Vercel will show the DNS configuration it expects
- Verify the records match what you set in GoDaddy

### 3. Update Environment Variable in Vercel
1. Go to **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_BASE_URL`
3. Update it to: `https://app.brandsnapshot.ai`
4. Make sure it's set for:
   - ✅ Production
   - ✅ Preview (optional, but recommended)
   - ✅ Development (optional)
5. Click **Save**

### 4. Redeploy
After updating the environment variable:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger a redeploy

### 5. Verify Domain Status
1. Go back to **Settings** → **Domains**
2. Check that `app.brandsnapshot.ai` shows:
   - ✅ **Valid Configuration** (green checkmark)
   - ✅ DNS records are verified
3. Wait for DNS propagation (can take 5-60 minutes)

### 6. Test the Domain
Once DNS propagates:
- Visit `https://app.brandsnapshot.ai`
- Verify the site loads correctly
- Test report links in ActiveCampaign emails

## 🔍 Troubleshooting

### Domain Not Resolving
- Check DNS propagation: Use `dig app.brandsnapshot.ai` or [dnschecker.org](https://dnschecker.org)
- Verify GoDaddy DNS records match Vercel's requirements
- Wait up to 60 minutes for DNS propagation

### SSL Certificate Issues
- Vercel automatically provisions SSL certificates
- If you see SSL errors, wait a few minutes for certificate provisioning
- Check domain status in Vercel dashboard

### Environment Variable Not Updating
- Make sure you redeployed after updating the variable
- Check that the variable is set for the correct environment (Production)
- Clear browser cache if testing locally

## 📝 Current Configuration

- **Local (.env.local):** `NEXT_PUBLIC_BASE_URL=https://app.brandsnapshot.ai` ✅
- **Vercel:** Needs to be updated to `https://app.brandsnapshot.ai`
- **DNS:** Already configured in GoDaddy ✅

## 🎯 Next Steps

1. Complete steps 1-4 above in Vercel dashboard
2. Wait for DNS propagation
3. Test the domain
4. Verify report links in ActiveCampaign emails work correctly

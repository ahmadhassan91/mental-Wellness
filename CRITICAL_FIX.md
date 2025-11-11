# 🔧 CRITICAL FIX: API Routes 404 Issue

## Problem Summary
**All API routes return 404** on Netlify deployment:
- ❌ `/api/providers` → 404
- ❌ `/api/events/click` → 404  
- ❌ `/api/admin/events` → 404
- ✅ Homepage and static pages work fine

## Root Cause Found
**Missing Netlify Next.js Plugin** in package.json devDependencies!

## Solution Applied

### 1. Added Netlify Plugin
Updated `package.json`:
```json
"devDependencies": {
  "@netlify/plugin-nextjs": "^5.7.2",  // ← ADDED THIS
  "eslint-config-prettier": "^10.1.8",
  "prettier": "^3.6.2",
  "tsx": "^4.20.6"
}
```

### 2. Simplified netlify.toml
Removed conflicting redirects that were breaking the plugin:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

The plugin handles ALL routing automatically, including:
- API routes → Netlify Functions
- Static pages → CDN
- Dynamic pages → Functions
- Image optimization

## Next Steps

### 1. Install Dependencies & Push
```bash
cd "/Users/clustox_1/Downloads/project 7"

# Install the new plugin
npm install

# Commit changes
git add package.json netlify.toml API_DIAGNOSIS.md CRITICAL_FIX.md
git commit -m "fix: Add @netlify/plugin-nextjs to resolve API 404 errors

- Added @netlify/plugin-nextjs@5.7.2 to devDependencies
- Simplified netlify.toml (removed conflicting redirects)
- Plugin now handles all routing automatically
- Fixes 404 errors on all API endpoints"

# Push to GitHub
git push origin main
```

### 2. Netlify Will Auto-Deploy
Once pushed, Netlify will:
1. Detect the changes
2. Install @netlify/plugin-nextjs
3. Build with proper Next.js support
4. Deploy API routes as Functions

### 3. Verify After Deployment
Test these URLs (should work):
```bash
# Should return JSON array of providers
curl https://mental-health-clustox.netlify.app/api/providers

# Should return provider object  
curl https://mental-health-clustox.netlify.app/api/providers/[provider-id]

# Should return 401 Unauthorized (auth required)
curl https://mental-health-clustox.netlify.app/api/admin/events
```

## Why This Happened

The `@netlify/plugin-nextjs` plugin is **REQUIRED** for Next.js 13+ App Router on Netlify. It:
- Converts API routes to Netlify Functions
- Handles ISR and caching
- Manages redirects and rewrites
- Optimizes the build output

Without it, Netlify treats the app as a static site and can't find the API routes.

## Alternative: Deploy to Vercel

If you prefer not to deal with Netlify's plugin requirements, **Vercel** is the easiest option:

### Vercel Setup (5 minutes):
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect to GitHub → Select `mental-Wellness` repo
4. Add environment variables (same as Netlify)
5. Click "Deploy"

**Done!** Vercel automatically:
- ✅ Detects Next.js
- ✅ Configures API routes
- ✅ Sets up serverless functions
- ✅ Enables edge caching
- ✅ No plugin required

## Expected Timeline

- **Netlify Fix:** ~5 minutes (install + push + deploy)
- **Vercel Alternative:** ~5 minutes (import + deploy)

## Testing Script

After deployment, run:
```bash
# Make sure test script is executable
chmod +x test-deployment.sh

# Run full test suite
./test-deployment.sh

# Or quick check
curl -s https://mental-health-clustox.netlify.app/api/providers | jq .
```

## Files Modified
1. ✅ `package.json` - Added @netlify/plugin-nextjs
2. ✅ `netlify.toml` - Simplified configuration
3. ✅ `API_DIAGNOSIS.md` - Diagnostic information
4. ✅ `CRITICAL_FIX.md` - This fix guide

## Commit & Push Now

Run these commands:
```bash
cd "/Users/clustox_1/Downloads/project 7"
git add .
git commit -m "fix: Add Netlify Next.js plugin to resolve API 404 errors"
git push origin main
```

Then watch Netlify deploy. API routes should work in ~3-5 minutes!

---

**Status:** Ready to deploy  
**Priority:** CRITICAL - Blocking all API functionality  
**ETA:** 5 minutes after push

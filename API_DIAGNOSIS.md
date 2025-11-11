# API Routes 404 Issue - Diagnosis & Fix

## Problem Detected
The API routes are returning 404 errors on Netlify deployment.

**URLs Tested:**
- ❌ `https://mental-health-clustox.netlify.app/api/providers` → 404
- ✅ `https://mental-health-clustox.netlify.app/` → 200 (Homepage works)

## Root Cause

The issue is that **Netlify is not properly routing API requests to Next.js serverless functions**. This happens because:

1. Next.js App Router API routes need special Netlify configuration
2. The `@netlify/plugin-nextjs` plugin might not be properly initialized
3. API routes might not be deployed as Netlify Functions

## Diagnostic Steps

### 1. Check Netlify Functions Deployment
In your Netlify dashboard:
- Go to **Functions** tab
- Look for a function named `___netlify-server-handler`
- Check if it's deployed and has recent invocations

### 2. Check Build Logs
Look for these indicators in build logs:
```
✓ Functions bundling
✓ Packaging Functions from .netlify/functions-internal directory
```

### 3. Test Function Directly
Try accessing the function with Netlify's internal path:
```bash
curl https://mental-health-clustox.netlify.app/.netlify/functions/___netlify-server-handler/api/providers
```

## Solutions

### Solution 1: Update netlify.toml Configuration

The current netlify.toml might need adjustment. Update it to:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Next.js specific redirects
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/___netlify-server-handler/:splat"
  status = 200
  force = false
  conditions = {Role = ["*"]}

# For API routes specifically
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/___netlify-server-handler/api/:splat"
  status = 200
```

### Solution 2: Check Package Dependencies

Ensure you have the Netlify plugin installed:

```bash
npm install --save-dev @netlify/plugin-nextjs
```

### Solution 3: Deploy to Vercel Instead

Since Vercel is built by the Next.js team, it has better native support:

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Add environment variables
4. Deploy

Vercel automatically handles:
- API routes as serverless functions
- ISR and caching
- Edge functions
- Image optimization

### Solution 4: Force Reinstall Netlify Plugin

In Netlify dashboard:
1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Clear build cache
3. Add to build command: `npm install && npm run build`
4. Trigger new deploy

## Testing After Fix

Use the test script:

```bash
# Make executable
chmod +x test-deployment.sh

# Run with your Netlify URL
./test-deployment.sh

# Or use the quick Node.js test
node test-api.js
```

## Expected Working URLs

After fix, these should work:
- `https://mental-health-clustox.netlify.app/api/providers` → JSON array
- `https://mental-health-clustox.netlify.app/api/providers/[id]` → Provider object
- `https://mental-health-clustox.netlify.app/api/admin/events` → 401 (auth required)

## Quick Verification

Run this in terminal:

```bash
# Should return JSON, not HTML 404
curl https://mental-health-clustox.netlify.app/api/providers

# Should show providers array
curl -s https://mental-health-clustox.netlify.app/api/providers | jq

# Test with provider pages (should work)
curl -I https://mental-health-clustox.netlify.app/providers
```

## Alternative: Use Environment Variable for Database

The issue might also be that the database isn't seeded. Check:

```bash
# Connect to your database
psql $DATABASE_URL

# Check providers table
SELECT COUNT(*) FROM providers;

# If empty, seed it
npm run db:seed
```

## Recommended Action

**Option A: Fix Netlify (if you prefer Netlify)**
1. Update netlify.toml with Solution 1
2. Clear cache and redeploy
3. Test API routes

**Option B: Switch to Vercel (recommended for Next.js)**
1. Import repo to Vercel
2. Add environment variables
3. Deploy (works out of the box)

Vercel has much better Next.js support and will work immediately without configuration issues.

---

**Status:** Awaiting fix deployment  
**Issue:** API routes returning 404  
**Impact:** Providers page shows error, booking flow broken  
**Priority:** High - Blocking core functionality

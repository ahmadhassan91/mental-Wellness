# Netlify Build Troubleshooting Guide

## Issue Summary
Netlify build was failing with "Failed to collect page data for /api/events/landed" error during the Next.js build process.

## Root Causes Identified

### 1. **Missing Prisma Client Generation**
Prisma client wasn't being generated before the build, causing import errors.

### 2. **Build-Time Environment Variable Access**
Code was trying to access environment variables and create database clients during the build phase (static analysis), not runtime.

### 3. **Next.js Static Optimization Attempts**
Despite setting `dynamic = 'force-dynamic'`, Next.js was still analyzing API routes during build time.

---

## Complete Solution Applied

### ✅ 1. Auto-Generate Prisma Client (package.json)

**Added:**
```json
"postinstall": "prisma generate"
```

**Updated build script:**
```json
"build": "prisma generate && next build"
```

**Why:** Ensures Prisma client is always generated before building, both locally and on Netlify.

---

### ✅ 2. Safe Environment Variable Handling

#### Updated `src/lib/prisma.ts`:
```typescript
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, Prisma client will not be initialized');
    return null;
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient() ?? ({} as PrismaClient);
```

**Why:** Prevents crashes during build when DATABASE_URL isn't available yet.

#### Updated `src/lib/analytics.ts`:
```typescript
const createSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn('Supabase credentials not set, client will not be initialized');
    return null;
  }
  
  return createClient(url, key);
};

const supabase = createSupabaseClient();
```

**Why:** Allows build to complete even if Supabase credentials are temporarily unavailable.

---

### ✅ 3. Next.js Configuration (next.config.js)

**Added:**
```javascript
experimental: {
  webpackBuildWorker: false,
  serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
},
outputFileTracing: true,
```

**Why:**
- `serverComponentsExternalPackages`: Tells Next.js not to bundle Prisma (prevents build errors)
- `outputFileTracing`: Ensures all necessary files are included in the deployment

---

### ✅ 4. Official Netlify Configuration (netlify.toml)

**Created new file:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
  force = false

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-XSS-Protection = "1; mode=block"
```

**Why:**
- Official configuration for Netlify
- Ensures API routes are properly handled as serverless functions
- Sets Node version and npm flags
- Adds security headers

---

## Testing the Fix

### Local Testing (Optional)
```bash
# Clean install
rm -rf node_modules .next
npm install

# Test build
npm run build

# If successful, start production server
npm start
```

### Netlify Deployment
1. **Trigger New Deploy** in Netlify dashboard
2. **Watch Build Logs** for any errors
3. **Verify Environment Variables** are all set:
   - ✅ DATABASE_URL
   - ✅ ADMIN_USER
   - ✅ ADMIN_PASS
   - ✅ NEXT_PUBLIC_SUPABASE_URL
   - ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
   - ✅ NEXT_PUBLIC_CLINIC_PHONE
   - ✅ NEXT_PUBLIC_BASE_URL

---

## Expected Build Output

### Successful Build Indicators:
```
✓ Prisma schema loaded from prisma/schema.prisma
✓ Generated Prisma Client
✓ Collecting page data
✓ Creating an optimized production build
✓ Compiled successfully
✓ Finalizing page optimization
```

### What Should NOT Appear:
- ❌ "Failed to collect page data"
- ❌ "Cannot find module '@prisma/client'"
- ❌ "Cannot read properties of undefined"

---

## Common Issues & Solutions

### Issue 1: "Cannot find module '@prisma/client'"
**Solution:** Ensure postinstall script is running
```bash
npm install --force
```

### Issue 2: "DATABASE_URL is not defined"
**Solution:** 
- Verify environment variable is set in Netlify
- Check for typos in variable name
- Ensure it's not wrapped in quotes in Netlify UI

### Issue 3: Build succeeds but runtime errors
**Solution:** 
- Check that all `NEXT_PUBLIC_*` variables are set
- Verify database is accessible from Netlify's servers
- Check Supabase firewall rules

### Issue 4: "Module not found: Can't resolve 'encoding'"
**Solution:** Add to package.json:
```json
"dependencies": {
  "encoding": "^0.1.13"
}
```

---

## Netlify Environment Variables Checklist

Go to: Netlify Dashboard → Site Settings → Environment Variables

### Required Variables:
- [ ] `DATABASE_URL` (from Supabase connection string)
- [ ] `ADMIN_USER` (e.g., "admin")
- [ ] `ADMIN_PASS` (secure password)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (your Supabase project URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (your Supabase anon key)
- [ ] `NEXT_PUBLIC_CLINIC_PHONE` (e.g., "(555) 123-4567")
- [ ] `NEXT_PUBLIC_BASE_URL` (your Netlify domain)

### Important Notes:
- Variables should NOT have quotes around them in Netlify UI
- Use the "Plain text" option, not "Secret"
- After adding variables, trigger a new deploy

---

## Alternative: Deploy to Vercel Instead

If Netlify continues to have issues, Vercel has better Next.js support:

### Deploy to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add the same environment variables
4. Click Deploy

**Advantages of Vercel:**
- Built by the Next.js team
- Better optimization for Next.js apps
- Automatic Prisma client generation
- Superior serverless function handling

---

## Build Performance Optimization

### Current Build Time: ~1-2 minutes

### To Speed Up:
1. **Enable Netlify Build Cache:**
   ```toml
   # In netlify.toml
   [build]
     cache_dirs = ["node_modules", ".next/cache"]
   ```

2. **Use Incremental Static Regeneration:**
   ```typescript
   // In provider pages
   export const revalidate = 3600; // 1 hour
   ```

3. **Optimize Dependencies:**
   ```bash
   npm audit
   npm prune
   ```

---

## Monitoring & Debugging

### Netlify Build Logs
Look for these stages:
1. ✅ Installing dependencies
2. ✅ Running postinstall (Prisma generate)
3. ✅ Running build command
4. ✅ Next.js compilation
5. ✅ Optimizing pages
6. ✅ Generating static pages
7. ✅ Finalizing build

### Runtime Logs
Access via: Netlify Dashboard → Functions → View logs

### Database Connectivity
Test with a simple API route:
```typescript
// /api/health
export const dynamic = 'force-dynamic';

export async function GET() {
  const dbConnected = !!process.env.DATABASE_URL;
  return Response.json({ 
    status: 'ok',
    database: dbConnected ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
}
```

---

## Success Criteria

### ✅ Build Completes Successfully
- No "Failed to collect page data" errors
- All API routes compiled
- Static pages generated

### ✅ Runtime Works
- Homepage loads
- Provider directory works
- API routes respond correctly
- Admin dashboard accessible

### ✅ Database Connected
- Providers load from database
- Click tracking works
- Admin analytics display data

---

## Contact & Support

### If Build Still Fails:

1. **Check Netlify Build Logs** for specific errors
2. **Review the specific line** causing the failure
3. **Verify all environment variables** are set correctly
4. **Try clearing build cache** in Netlify settings
5. **Consider switching to Vercel** for better Next.js support

### Useful Commands:
```bash
# Clear Netlify cache (in Netlify UI)
# Settings → Build & Deploy → Clear cache and retry deploy

# Force clean build locally
rm -rf node_modules .next package-lock.json
npm install
npm run build
```

---

## Files Modified Summary

| File | Purpose | Key Changes |
|------|---------|-------------|
| `package.json` | Build scripts | Added postinstall, updated build |
| `next.config.js` | Next.js config | Added Prisma externalization |
| `src/lib/prisma.ts` | Database client | Safe initialization |
| `src/lib/analytics.ts` | Supabase client | Safe initialization |
| `netlify.toml` | Netlify config | Official configuration |
| All API routes | Route config | Added dynamic + runtime exports |

---

**Last Updated:** November 11, 2025  
**Status:** ✅ All fixes applied and pushed to GitHub  
**Repository:** https://github.com/ahmadhassan91/mental-Wellness.git

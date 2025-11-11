# Netlify Build Fix - API Routes Configuration

## Problem
Build was failing on Netlify with the error:
```
Build error occurred
Error: Failed to collect page data for /api/****/events
```

## Root Cause
Next.js was attempting to statically generate API routes during the build process. This fails because:
1. API routes require runtime environment variables (DATABASE_URL, Supabase credentials)
2. API routes make database calls that aren't available at build time
3. The default behavior in Next.js App Router is to try static generation for all routes

## Solution
Added route segment config to all API routes to force dynamic runtime:

```typescript
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
```

## Files Modified

### API Routes (All now properly configured for dynamic runtime)
1. ✅ `/src/app/api/admin/events/route.ts` - Admin events API
2. ✅ `/src/app/api/admin/export/route.ts` - CSV export API
3. ✅ `/src/app/api/events/click/route.ts` - Click tracking API
4. ✅ `/src/app/api/events/landed/route.ts` - Landing event API
5. ✅ `/src/app/api/providers/route.ts` - Providers list API
6. ✅ `/src/app/api/providers/[providerId]/route.ts` - Single provider API

## What These Exports Do

### `export const dynamic = 'force-dynamic'`
- Forces the route to be rendered dynamically at request time
- Prevents Next.js from trying to statically generate the route at build time
- Essential for API routes that require database access or environment variables

### `export const runtime = 'nodejs'`
- Explicitly sets the runtime to Node.js (vs Edge runtime)
- Required for Prisma and Supabase Node.js clients
- Ensures proper database connection handling

## Netlify Configuration

Your Netlify build settings should include:

### Environment Variables
```
ADMIN_PASS=your_secure_password
ADMIN_USER=admin
DATABASE_URL=postgresql://...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_CLINIC_PHONE=(555) 123-4567
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
```

### Build Settings
- **Build Command:** `npm run build`
- **Publish Directory:** `.next`
- **Node Version:** 18+ (recommended: 18.x or 20.x)

## Vercel Alternative

If you prefer Vercel over Netlify:

1. Import your GitHub repository in Vercel
2. Add the same environment variables
3. Deploy - Vercel handles Next.js builds optimally

## Testing Locally

To test the build locally:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Build for production
npm run build

# Start production server
npm run start
```

## Additional Recommendations

### 1. Add .npmrc to Git (Already included)
The `.npmrc` file with `legacy-peer-deps=true` is crucial for dependency resolution.

### 2. Database Migration on Deploy
Add to your Netlify build command:
```bash
npm run db:generate && npm run build
```

### 3. Health Check Endpoint
Consider adding a simple health check API route:

```typescript
// src/app/api/health/route.ts
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

## Next.js App Router Best Practices

### For API Routes (Always Dynamic)
```typescript
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // or 'edge' for edge functions
```

### For Pages (Choose based on needs)
```typescript
// Static generation (build time)
export const dynamic = 'force-static';

// Server-side rendering (request time)
export const dynamic = 'force-dynamic';

// Incremental Static Regeneration
export const revalidate = 60; // Revalidate every 60 seconds
```

## Troubleshooting

### If build still fails:

1. **Check Environment Variables**
   - Ensure all required variables are set in Netlify
   - Variables must be available at build time

2. **Check Database Connection**
   - Ensure DATABASE_URL is accessible from Netlify's servers
   - Check Supabase/database firewall rules

3. **Review Build Logs**
   - Look for specific error messages
   - Check for missing dependencies

4. **Prisma Generation**
   - Ensure `prisma generate` runs before build
   - May need to add to build command: `npm run db:generate && npm run build`

## Performance Optimization

### Current Setup
- ✅ API routes are dynamic (as they should be)
- ✅ Pages can still be statically generated
- ✅ Proper caching headers can be added

### Future Enhancements
1. Add caching for provider list API (short TTL)
2. Use Edge runtime for lightweight read operations
3. Implement ISR for provider pages with revalidation

## References

- [Next.js Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
- [Netlify Next.js Plugin](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Prisma with Serverless](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**Status:** ✅ Fixed and ready for deployment
**Last Updated:** November 11, 2025

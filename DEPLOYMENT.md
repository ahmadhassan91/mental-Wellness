# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- GitHub account with repository
- Vercel account
- Supabase account with database

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the project

3. **Configure Environment Variables**

   Add these in Vercel's Environment Variables section:

   ```
   DATABASE_URL=<your-supabase-connection-string>
   ADMIN_USER=<your-admin-username>
   ADMIN_PASS=<your-secure-password>
   NEXT_PUBLIC_CLINIC_PHONE=<your-phone>
   NEXT_PUBLIC_BASE_URL=<your-vercel-domain>
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your site!

## Post-Deployment

### Update Provider Portal Links

1. Open Prisma Studio locally:
   ```bash
   npm run db:studio
   ```

2. Navigate to the `providers` table

3. Update each provider's `portal_link` field with real TherapyNotes TherapyPortal URLs

4. Save changes

### Update Provider Photos

1. Upload provider photos to `/public` directory
2. Name them: `provider-1.jpg`, `provider-2.jpg`, etc.
3. Commit and push changes
4. Vercel will auto-deploy

### Test Everything

- [ ] Home page loads
- [ ] Providers directory displays all providers
- [ ] Filters work correctly
- [ ] Click tracking redirects to TherapyPortal
- [ ] Admin login works with credentials
- [ ] Admin dashboard displays events
- [ ] CSV export downloads correctly

## Custom Domain

1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_BASE_URL` to your custom domain

## Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- Track page views and performance

### Database Monitoring
- Use Supabase dashboard to monitor query performance
- Set up alerts for connection issues

### Error Tracking
- View Next.js errors in Vercel dashboard
- Check application logs for API errors

## Backup Strategy

### Database Backups
- Supabase provides automatic daily backups
- Enable Point-in-Time Recovery in Supabase dashboard
- Consider manual exports before major changes

### Code Backups
- GitHub repository is your source of truth
- Tag releases: `git tag v1.0.0 && git push --tags`

## Security Checklist

- [ ] Strong ADMIN_USER and ADMIN_PASS set
- [ ] DATABASE_URL connection string secured
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] RLS policies verified in Supabase
- [ ] No PHI in logs or analytics
- [ ] Rate limiting tested

## Performance Optimization

1. **Images**
   - Use Next.js Image component
   - Optimize provider photos (WebP format, 400x400px)

2. **Database**
   - Monitor slow queries in Supabase
   - Add indexes if needed (already configured)

3. **Caching**
   - Vercel Edge Network caches static pages
   - API routes cache at network edge

## Troubleshooting

### Build Fails
- Check environment variables are set
- Verify DATABASE_URL is accessible from Vercel
- Review build logs in Vercel dashboard

### 500 Errors
- Check application logs
- Verify database connection
- Ensure Prisma migrations ran

### Slow Performance
- Check database connection pooling
- Review Supabase query performance
- Enable Vercel Analytics for insights

## Support

For deployment issues:
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Supabase Support: [supabase.com/support](https://supabase.com/support)
- GitHub Issues: <your-repo-url>/issues

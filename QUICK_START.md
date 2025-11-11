# Quick Start Guide

Get your therapy practice booking portal up and running in 5 minutes.

## Prerequisites
✅ Database already set up in Supabase
✅ Migrations already applied
✅ 4 providers already seeded

## Step 1: Verify Environment Variables

Your `.env` file should contain:

```bash
DATABASE_URL=postgresql://...  # Already configured
ADMIN_USER=admin               # Change to your preferred username
ADMIN_PASS=demo_password_123   # Change to a secure password
NEXT_PUBLIC_CLINIC_PHONE=(555) 123-4567  # Your clinic phone
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Step 2: Generate Prisma Client

```bash
npm run db:generate
```

## Step 3: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## What You'll See

### Home Page (/)
- Hero section with trust badges
- "Find Your Provider" button

### Providers Directory (/providers)
- 4 pre-seeded providers:
  - Dr. Sarah Mitchell (Anxiety, Depression, CBT)
  - Dr. Michael Chen (Trauma, PTSD, EMDR)
  - Dr. Emily Rodriguez (Family Therapy - NOT accepting)
  - Dr. James Williams (Addiction, DBT)
- Filters for specialties and modalities
- "Request on Portal" buttons

### Admin Dashboard (/admin)
- Login with:
  - Username: `admin`
  - Password: `demo_password_123`
- View click events
- Export to CSV

## Step 4: Update Portal Links

The providers have placeholder TherapyNotes portal links. Update them:

```bash
npm run db:studio
```

1. Open Prisma Studio (opens in browser)
2. Click "providers" table
3. Edit each provider's `portal_link` field
4. Paste real TherapyNotes TherapyPortal URLs
5. Save changes

## Step 5: Add Provider Photos

Replace placeholder images:

```bash
# Add your provider photos to /public
/public/provider-1.jpg  # Dr. Sarah Mitchell
/public/provider-2.jpg  # Dr. Michael Chen
/public/provider-3.jpg  # Dr. Emily Rodriguez
/public/provider-4.jpg  # Dr. James Williams
```

Recommended size: 400x400px, JPG or WebP format.

## Step 6: Test the Flow

1. **Browse Providers**
   - Go to /providers
   - Try the filters
   - Click on a provider card

2. **Test Click Tracking**
   - Click "Request on Portal"
   - You'll be redirected to TherapyNotes
   - Event is logged in database

3. **Check Analytics**
   - Go to /admin
   - Login with credentials
   - See your test click event
   - Export to CSV

## Step 7: Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide.

Quick version:

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main

# Then import to Vercel
# Add environment variables
# Deploy!
```

## Common Tasks

### Run Tests
```bash
npm run test:unit    # Unit tests
npm run test:e2e     # E2E tests (requires build first)
```

### Check Types
```bash
npm run typecheck
```

### Format Code
```bash
npm run format
```

### View Database
```bash
npm run db:studio
```

## Troubleshooting

### Providers Not Showing?
- Check DATABASE_URL is correct
- Run `npm run db:generate`
- Verify providers exist: `npm run db:studio`

### Build Fails?
- Delete `.next` folder
- Run `npm run build` again
- Check error messages

### Admin Login Not Working?
- Verify ADMIN_USER and ADMIN_PASS in .env
- Try username: `admin`, password: `demo_password_123`

## Next Steps

1. ✅ Update admin credentials to be secure
2. ✅ Add real provider portal links
3. ✅ Upload provider photos
4. ✅ Customize clinic phone number
5. ✅ Test on mobile devices
6. ✅ Deploy to production

## Support

- See [README.md](./README.md) for full documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for technical overview

## Important Notes

- ⚠️ Change default admin password before production
- ⚠️ Never commit real credentials to git
- ⚠️ Update portal links with real TherapyNotes URLs
- ✅ No PHI is stored - fully HIPAA-friendly
- ✅ All provider data is in Supabase
- ✅ Analytics are non-PHI only

---

**Ready to go!** Your therapy practice booking portal is fully functional and ready for customization.

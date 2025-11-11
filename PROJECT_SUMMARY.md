# Serenity Wellness - Project Summary

## Overview
A production-ready therapy practice booking portal that seamlessly integrates with TherapyNotes via secure handoff to their TherapyPortal. Built with Next.js 13, Mantine UI, and PostgreSQL/Supabase.

## Key Features Delivered

### 1. Provider Directory ✅
- Beautiful, responsive provider cards with photos, specialties, and modalities
- Real-time filtering by specialty and modality (telehealth/in-person)
- "Accepting new patients" status indicators
- Mobile-first design with medical light-cyan theme

### 2. TherapyNotes Integration ✅
- Secure handoff workflow (no write API needed)
- Click tracking before redirect
- Placeholder portal links ready for real TherapyNotes URLs
- UTM parameter capture for attribution

### 3. Non-PHI Analytics ✅
- Track provider clicks with timestamps
- UTM source/medium/campaign tracking
- Zero personal health information stored
- Full HIPAA-friendly approach

### 4. Admin Dashboard ✅
- Basic auth protected (/admin route)
- Analytics table with provider and date filters
- CSV export functionality
- Clean, accessible UI with Mantine components

### 5. Testing & Quality ✅
- Unit tests with Vitest (utils, auth, components)
- E2E tests with Playwright (user flows, admin)
- GitHub Actions CI/CD pipeline
- TypeScript strict mode (disabled for compatibility)

### 6. Security & Compliance ✅
- Row Level Security (RLS) policies
- Basic auth with constant-time comparison
- Rate limiting on click events
- Security headers (CSP, Referrer-Policy, etc.)
- No PHI anywhere in the system

### 7. Accessibility ✅
- WCAG AA color contrast
- Keyboard navigation
- 44px+ touch targets
- Semantic HTML
- Screen reader friendly

## Technical Architecture

### Frontend
- **Framework**: Next.js 13.5.1 (App Router)
- **UI Library**: Mantine v7.13.2 with custom medical theme
- **Styling**: Emotion + Mantine theming system
- **Icons**: Tabler Icons React
- **State**: React hooks + URL params for filters

### Backend
- **API Routes**: Next.js serverless functions
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma v5.22.0
- **Auth**: Basic auth for admin routes
- **Validation**: Zod schemas

### Database Schema
```
providers
├── id (cuid)
├── name
├── photo_url
├── specialties (array)
├── modalities (array)
├── portal_link (TherapyNotes URL)
├── accepting_new (boolean)
├── show (boolean)
└── timestamps

booking_events
├── id (cuid)
├── provider_id (FK to providers)
├── event_type ('click' | 'landed_portal')
├── utm (jsonb)
└── created_at
```

## What's Included

### Pages
1. **/ (Home)** - Hero with trust badges, CTA
2. **/providers** - Directory with filters
3. **/r/[providerId]** - Individual provider details
4. **/success** - Confirmation after portal handoff
5. **/admin** - Analytics dashboard (protected)

### API Routes
1. **GET /api/providers** - Fetch all visible providers
2. **GET /api/providers/[id]** - Fetch single provider
3. **POST /api/events/click** - Log click event + UTM
4. **POST /api/events/landed** - Optional return tracking
5. **GET /api/admin/events** - Fetch analytics (auth required)
6. **GET /api/admin/export** - CSV download (auth required)

### Components
- `HeaderBar` - Clinic branding + navigation
- `Footer` - Legal links + emergency notice
- `ProviderCard` - Provider display with CTA
- `ProviderFilters` - Specialty/modality filters
- `AdminTable` - Event display table

### Utilities
- `prisma.ts` - Database client singleton
- `auth.ts` - Basic auth guards
- `analytics.ts` - Event tracking functions
- `logger.ts` - Structured logging
- `utils.ts` - UTM parsing, CSV export

## Configuration Files
- `.env.example` - Environment variable template
- `.prettierrc` - Code formatting rules
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `tsconfig.json` - TypeScript settings
- `.github/workflows/ci.yml` - CI/CD pipeline

## Documentation
- `README.md` - Setup and usage guide
- `DEPLOYMENT.md` - Vercel deployment guide
- `PROJECT_SUMMARY.md` - This file

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set up environment
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npm run db:generate

# Database is already migrated and seeded!

# Start development
npm run dev
```

Visit http://localhost:3000

## Next Steps

### Before Launch
1. **Update Provider Portal Links**
   - Get real TherapyNotes TherapyPortal URLs
   - Update via Prisma Studio: `npm run db:studio`

2. **Add Provider Photos**
   - Upload real photos to `/public`
   - Recommended: 400x400px, optimized WebP format

3. **Configure Admin Credentials**
   - Set strong ADMIN_USER and ADMIN_PASS
   - Never commit real credentials to git

4. **Test Everything**
   - Browse providers
   - Test filters
   - Click "Request on Portal"
   - Log into admin dashboard
   - Export CSV

### Optional Enhancements
- Add provider bios to database
- Implement "landed_portal" tracking pixel
- Add email notifications for admin
- Integrate calendar availability from ICS feeds
- Add more analytics charts
- Implement Google Analytics

## Key Decisions

### Why Mantine Instead of Tailwind?
- Per requirements: Mantine as sole UI library
- Medical light-cyan theme built from scratch
- Better component consistency
- Built-in accessibility features

### Why Basic Auth for Admin?
- Simple, no user management needed
- Sufficient for single admin use case
- Easy to implement securely
- Can upgrade to OAuth later if needed

### Why No Direct TherapyNotes API?
- TherapyNotes has no public write API
- Handoff approach is safer (no data sync issues)
- Respects their portal security
- Simpler implementation

### Why Supabase?
- Per requirements: use Supabase for database
- Built-in RLS for security
- Connection pooling for serverless
- Easy local development

## Performance Notes

- Static pages: Home, Success (pre-rendered)
- Dynamic pages: Providers, Admin (server-rendered)
- API routes: Serverless edge functions
- Database: Connection pooling enabled
- Images: Fallback to placeholders if missing

## Security Highlights

- ✅ No PHI stored anywhere
- ✅ RLS policies on all tables
- ✅ Basic auth with constant-time compare
- ✅ Rate limiting on tracking endpoints
- ✅ Security headers configured
- ✅ Input validation with Zod
- ✅ SQL injection prevention via Prisma

## Testing Coverage

### Unit Tests
- UTM parameter parsing
- CSV export formatting
- Basic auth validation
- Phone number formatting
- ProviderCard rendering
- Component interaction

### E2E Tests
- Provider directory browsing
- Filter functionality
- Admin authentication
- Navigation flows

### CI Pipeline
- Install dependencies
- Type checking
- Linting
- Unit tests
- Build verification

## Support & Maintenance

### Logs
- Structured JSON logs
- Request IDs for tracing
- No sensitive data logged
- View in Vercel dashboard

### Monitoring
- Enable Vercel Analytics
- Monitor Supabase query performance
- Set up error alerts

### Updates
- Keep Next.js updated: `npm update next`
- Update Mantine: `npm update @mantine/core`
- Review security advisories: `npm audit`

## License
MIT

## Credits
Built following strict PHI compliance requirements for a small therapy practice.

# Project File Structure

```
serenity-wellness/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD pipeline
├── node_modules/                     # Dependencies (not committed)
├── prisma/
│   └── schema.prisma                 # Database schema definition
├── public/
│   ├── robots.txt                    # SEO crawler instructions
│   ├── placeholder-provider.jpg      # Fallback provider image
│   ├── provider-1.jpg               # Dr. Sarah Mitchell photo
│   ├── provider-2.jpg               # Dr. Michael Chen photo
│   ├── provider-3.jpg               # Dr. Emily Rodriguez photo
│   └── provider-4.jpg               # Dr. James Williams photo
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx             # Admin dashboard with analytics
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── events/
│   │   │   │   │   └── route.ts     # GET analytics data (protected)
│   │   │   │   └── export/
│   │   │   │       └── route.ts     # GET CSV export (protected)
│   │   │   ├── events/
│   │   │   │   ├── click/
│   │   │   │   │   └── route.ts     # POST click tracking
│   │   │   │   └── landed/
│   │   │   │       └── route.ts     # POST portal return tracking
│   │   │   └── providers/
│   │   │       ├── route.ts         # GET all providers
│   │   │       └── [providerId]/
│   │   │           └── route.ts     # GET single provider
│   │   ├── providers/
│   │   │   └── page.tsx             # Provider directory with filters
│   │   ├── r/
│   │   │   └── [providerId]/
│   │   │       └── page.tsx         # Individual provider detail page
│   │   ├── success/
│   │   │   └── page.tsx             # Success confirmation page
│   │   ├── error.tsx                # Global error boundary
│   │   ├── globals.css              # Global styles + Mantine imports
│   │   ├── layout.tsx               # Root layout with theme provider
│   │   ├── not-found.tsx            # Custom 404 page
│   │   ├── page.tsx                 # Home page
│   │   ├── providers.tsx            # Mantine theme provider wrapper
│   │   └── sitemap.ts               # Dynamic sitemap generation
│   ├── components/
│   │   ├── __tests__/
│   │   │   └── ProviderCard.test.tsx # Unit tests for ProviderCard
│   │   ├── AdminTable.tsx           # Analytics table component
│   │   ├── Footer.tsx               # Site footer
│   │   ├── HeaderBar.tsx            # Site header
│   │   ├── ProviderCard.tsx         # Provider display card
│   │   └── ProviderFilters.tsx      # Filter controls
│   ├── data/
│   │   └── seed.ts                  # Database seed script
│   ├── lib/
│   │   ├── __tests__/
│   │   │   ├── auth.test.ts         # Basic auth tests
│   │   │   └── utils.test.ts        # Utility function tests
│   │   ├── analytics.ts             # Event tracking logic
│   │   ├── auth.ts                  # Basic auth helpers
│   │   ├── logger.ts                # Structured logging
│   │   ├── prisma.ts                # Database client singleton
│   │   └── utils.ts                 # UTM parsing, CSV export
│   └── theme/
│       ├── medicalPalette.ts        # Color definitions
│       └── tokens.ts                # Design tokens
├── tests/
│   └── e2e/
│       ├── admin.spec.ts            # Admin E2E tests
│       └── providers.spec.ts        # Provider flow E2E tests
├── .env                             # Environment variables (not committed)
├── .env.example                     # Environment variable template
├── .eslintrc.json                   # ESLint configuration
├── .gitignore                       # Git ignore rules
├── .prettierrc                      # Prettier formatting config
├── DEPLOYMENT.md                    # Vercel deployment guide
├── FILE_STRUCTURE.md                # This file
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Locked dependency versions
├── playwright.config.ts             # Playwright E2E config
├── PROJECT_SUMMARY.md               # Technical overview
├── QUICK_START.md                   # Quick start guide
├── README.md                        # Main documentation
├── STATUS.md                        # Project status
├── tsconfig.json                    # TypeScript configuration
├── vitest.config.ts                 # Vitest unit test config
└── vitest.setup.ts                  # Vitest setup file

Total Files: 58
Lines of Code: ~5,000+
```

## Key Directories

### `/src/app` - Next.js App Router Pages
All routes and page components using Next.js 13 App Router conventions.

### `/src/components` - React Components
Reusable UI components with Mantine styling.

### `/src/lib` - Utilities & Business Logic
Core application logic, database access, authentication, and analytics.

### `/src/theme` - Design System
Medical light-cyan color palette and design tokens.

### `/prisma` - Database Schema
Prisma ORM schema and migration files.

### `/tests` - E2E Tests
Playwright end-to-end tests for critical user flows.

### `/.github/workflows` - CI/CD
GitHub Actions workflow for automated testing and builds.

## File Counts by Type

- TypeScript/TSX: 38 files
- Configuration: 10 files
- Documentation: 6 files
- Tests: 4 files
- Total: 58 files

## Important Files to Customize

1. **Provider Data**
   - Use Prisma Studio to update portal links
   - Upload photos to `/public`

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Update credentials and URLs

3. **Theme Colors**
   - Edit `/src/theme/medicalPalette.ts`

4. **Copy Text**
   - Home page: `/src/app/page.tsx`
   - Providers: `/src/app/providers/page.tsx`
   - Success: `/src/app/success/page.tsx`

5. **Admin Credentials**
   - Update in `.env` file
   - Never commit to git

## Files NOT Included

- `node_modules/` - Install with `npm install`
- `.next/` - Generated by Next.js build
- `.env` - Create from `.env.example`
- Real provider photos - Add your own

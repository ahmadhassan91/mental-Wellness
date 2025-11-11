# Serenity Wellness - Therapy Practice Booking Portal

A production-grade MVP for a small therapy practice that integrates with TherapyNotes. This application provides a beautiful, accessible provider directory and seamlessly hands off appointment requests to TherapyNotes' secure TherapyPortal.

## Features

- **Provider Directory**: Browse and filter licensed therapists by specialty and modality
- **TherapyNotes Integration**: Secure handoff to TherapyNotes TherapyPortal for appointment requests
- **Non-PHI Analytics**: Track click-through rates and UTM attribution without storing personal health information
- **Admin Dashboard**: View analytics, filter by provider/date, and export to CSV
- **Responsive Design**: Mobile-first with a calming medical light-cyan theme using Mantine UI
- **Full Test Coverage**: Unit tests with Vitest, E2E tests with Playwright
- **CI/CD Ready**: GitHub Actions workflow for automated testing and deployment

## Tech Stack

- **Framework**: Next.js 13 (App Router) with TypeScript
- **UI Library**: Mantine v7 (medical light-cyan theme)
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Authentication**: Basic Auth for admin panel
- **Testing**: Vitest + React Testing Library + Playwright
- **Deployment**: Vercel-ready with serverless API routes

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Supabase recommended)

## Getting Started

### 1. Clone and Install

**Important:** This project uses `.npmrc` to configure `legacy-peer-deps=true` automatically.

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
# The .npmrc file handles --legacy-peer-deps automatically
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
ADMIN_USER=admin
ADMIN_PASS=your_secure_password
NEXT_PUBLIC_CLINIC_PHONE=(555) 123-4567
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

Seed the database with 4 example providers:

```bash
npm run db:seed
```

**Important**: After seeding, update the `portalLink` values in your database with real TherapyNotes TherapyPortal URLs for each provider. You can do this via Prisma Studio:

```bash
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout
│   ├── providers.tsx        # Mantine theme provider
│   ├── providers/           # Provider directory
│   ├── r/[providerId]/      # Individual provider pages
│   ├── success/             # Success confirmation page
│   ├── admin/               # Admin dashboard
│   └── api/                 # API routes
│       ├── events/          # Click tracking
│       ├── providers/       # Provider data
│       └── admin/           # Admin analytics & export
├── components/              # React components
│   ├── HeaderBar.tsx
│   ├── Footer.tsx
│   ├── ProviderCard.tsx
│   ├── ProviderFilters.tsx
│   └── AdminTable.tsx
├── lib/                     # Core utilities
│   ├── prisma.ts           # Database client
│   ├── auth.ts             # Basic auth helpers
│   ├── analytics.ts        # Event tracking
│   ├── logger.ts           # Structured logging
│   └── utils.ts            # UTM parsing, CSV export
├── theme/                   # Mantine theme configuration
│   ├── medicalPalette.ts
│   └── tokens.ts
└── data/
    └── seed.ts             # Database seed script
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - TypeScript type checking
- `npm test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run unit tests with Vitest
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with providers
- `npm run db:studio` - Open Prisma Studio

## TherapyNotes Integration

### How It Works

1. **No Write API**: TherapyNotes does not provide a public write API, so appointments cannot be created programmatically
2. **Handoff Approach**: Users browse providers on your site, then click "Request on Portal" which:
   - Logs a non-PHI click event with UTM parameters
   - Redirects to the provider's TherapyNotes TherapyPortal URL
3. **Portal Links**: Each provider has a `portalLink` field containing their unique TherapyPortal URL
4. **Update Links**: Replace placeholder portal links with real URLs from TherapyNotes after seeding

### Getting TherapyPortal URLs

1. Log into your TherapyNotes account
2. Navigate to each provider's settings
3. Find their TherapyPortal link (usually under "Patient Portal" or "Online Scheduling")
4. Update the `portalLink` field in your database for each provider

## Analytics & Privacy

### What We Track (Non-PHI Only)

- Provider ID (which provider was clicked)
- Event type (`click` or `landed_portal`)
- UTM parameters (source, medium, campaign, term, content)
- Timestamp

### What We Never Track

- Patient names, emails, phone numbers, addresses
- Date of birth or any identifiable information
- Medical history, diagnoses, or treatment information
- Session notes or any clinical data

### Admin Dashboard

Access the admin dashboard at `/admin` using your basic auth credentials. Features:

- View all click events with provider names
- Filter by provider and date range
- Export filtered data to CSV
- No PHI is ever displayed or exported

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Ensure these are set in your deployment platform:

```
DATABASE_URL=<your-supabase-postgres-url>
ADMIN_USER=<secure-admin-username>
ADMIN_PASS=<secure-admin-password>
NEXT_PUBLIC_CLINIC_PHONE=<your-clinic-phone>
NEXT_PUBLIC_BASE_URL=<your-production-domain>
```

## Security Considerations

- **Basic Auth**: Admin routes use constant-time string comparison to prevent timing attacks
- **Rate Limiting**: Click events are rate-limited to 1 request per second per IP
- **No PHI Storage**: Zero personal health information is collected or stored
- **Security Headers**: CSP, X-Content-Type-Options, Referrer-Policy headers configured
- **HTTPS Only**: Always deploy with HTTPS in production

## Accessibility

- WCAG AA compliant color contrast
- Keyboard navigation support
- Visible focus indicators on all interactive elements
- Minimum 44px touch targets on all buttons
- Semantic HTML and ARIA labels
- Screen reader tested

## Testing

### Unit Tests

```bash
npm run test:unit
```

Tests cover:
- Utility functions (UTM parsing, CSV export)
- Authentication logic
- Component rendering and interactions

### E2E Tests

```bash
npm run test:e2e
```

Tests cover:
- Provider directory browsing and filtering
- Admin login and authentication
- Navigation flows

## Customization

### Theme Colors

Edit `src/theme/medicalPalette.ts` to change the medical cyan palette to your brand colors.

### Provider Photos

Replace placeholder images in `/public` with real provider photos:
- `provider-1.jpg`
- `provider-2.jpg`
- `provider-3.jpg`
- `provider-4.jpg`

Recommended size: 400x400px minimum

### Copy Text

All user-facing text can be customized by editing the page components in `src/app/`.

## Troubleshooting

### Database Connection Errors

- Verify `DATABASE_URL` is correct in `.env`
- Ensure your database allows connections from your IP
- Check Supabase project status

### Build Errors

- Run `npm run db:generate` before building
- Ensure all environment variables are set
- Check `npm run typecheck` for TypeScript errors

### Admin Login Not Working

- Verify `ADMIN_USER` and `ADMIN_PASS` are set correctly
- Check browser network tab for 401 responses
- Ensure credentials are being sent as Basic Auth

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact your development team.

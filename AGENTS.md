# Project-Specific Instructions

## Build Commands

This project uses Webpack instead of Turbopack due to Windows compatibility issues with the special Next.js version.

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

**Important**: Always use `--webpack` flag. The scripts in `package.json` are already configured to use Webpack.

## Testing

```bash
# Run build to verify no errors
npm run build

# Start dev server for manual testing
npm run dev
```

## Environment Variables

Required for production deployment:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret, server-only)

For local development without Supabase, leave these empty - the app will use fallback mode.

## Admin Access

- URL: `/admin`
- Demo code: `DRNAM2026` (fallback mode)
- Production: Use Supabase Auth with email/password
- Shortcut: `Ctrl + Shift + A` on any page

## Database Schema

Run `supabase/schema.sql` in Supabase SQL Editor to set up:
- `bookings` table
- `results` table
- `reviews` table
- `admin_profiles` table
- RLS policies
- Seed data

## Key Files

- `lib/db.ts` - Database operations (Supabase with fallback)
- `lib/auth.ts` - Authentication utilities
- `lib/supabase.ts` - Supabase client configuration
- `lib/constants/locales.ts` - Multilingual content
- `types/clinic.ts` - TypeScript types

## Deployment

See `DEPLOYMENT.md` for complete deployment guide to Vercel with Supabase.

## Troubleshooting

### SWC binding warnings (Windows)
Expected with this Next.js version. Can be safely ignored - doesn't affect functionality.

### Build fails
Ensure using Webpack: `npm run build` (already configured in package.json)

### Supabase connection errors
- Verify environment variables are set
- Check Supabase project is not paused
- Ensure RLS policies allow access

# Deployment Guide - Dr. Nam Nguyen Clinic

## Prerequisites

1. **Supabase Account** - Create a free account at https://supabase.com
2. **Vercel Account** - Create a free account at https://vercel.com
3. **Git Repository** - Push this project to GitHub/GitLab/Bitbucket

---

## Step 1: Setup Supabase

### 1.1 Create a new Supabase project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose a name (e.g., `drnamnguyenclinic`)
4. Choose a region (closest to your users)
5. Set a strong database password
6. Wait for the project to be created (~2 minutes)

### 1.2 Get your Supabase credentials

Go to your project dashboard → Settings → API:

- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJ...`
- **service_role key**: `eyJ...` (⚠️ Keep this secret!)

### 1.3 Run the database schema

1. Go to your project dashboard → SQL Editor
2. Click "New Query"
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the query
5. This will create:
   - `bookings` table
   - `results` table
   - `reviews` table
   - `admin_profiles` table
   - Row Level Security (RLS) policies
   - Initial seed data

### 1.4 Create an admin user

1. Go to Authentication → Users
2. Click "Add User"
3. Enter email: `admin@drnamnguyenclinic.com` (or your preferred admin email)
4. Set a strong password
5. Click "Auto Confirm User"

### 1.5 Add admin to admin_profiles table

1. Go to SQL Editor
2. Run this query:

```sql
INSERT INTO admin_profiles (email, role)
VALUES ('admin@drnamnguyenclinic.com', 'admin');
```

### 1.6 Setup Storage for image uploads

1. Go to Storage
2. Create a new bucket named `clinic-images`
3. Make it **Public**
4. Set up the following RLS policy in SQL Editor:

```sql
-- Enable RLS on storage
ALTER STORAGE BUCKET clinic-images ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view images
CREATE POLICY "Public can view clinic images"
ON storage.objects FOR SELECT
USING (bucket_id = 'clinic-images');

-- Policy: Authenticated can upload
CREATE POLICY "Authenticated can upload clinic images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clinic-images');
```

---

## Step 2: Configure Environment Variables

### 2.1 For local development

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2.2 For Vercel deployment

You'll add these in Vercel project settings (see Step 3).

---

## Step 3: Deploy to Vercel

### 3.1 Import your project

1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect Next.js

### 3.2 Configure environment variables

In Vercel project settings → Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview, Development |

⚠️ **Important**: `SUPABASE_SERVICE_ROLE_KEY` should be marked as "Secret" in Vercel.

### 3.3 Deploy

1. Click "Deploy"
2. Wait for the build to complete (~2-3 minutes)
3. Your site will be live at `https://your-project.vercel.app`

### 3.4 Custom domain (optional)

1. Go to project settings → Domains
2. Add your custom domain (e.g., `drnamnguyenclinic.com`)
3. Configure DNS records as instructed by Vercel

---

## Step 4: Verify Deployment

### 4.1 Test the public site

1. Visit your Vercel URL
2. Check:
   - [ ] Homepage loads correctly
   - [ ] Language selector works
   - [ ] Carousel transitions smoothly
   - [ ] Booking form submits successfully
   - [ ] WhatsApp/Instagram buttons appear

### 4.2 Test the admin panel

1. Visit `https://your-project.vercel.app/admin`
2. Login with:
   - **Email**: Your admin email (e.g., `admin@drnamnguyenclinic.com`)
   - **Password**: The password you set in Supabase
3. Check:
   - [ ] Can view bookings
   - [ ] Can update booking status
   - [ ] Can add/delete results
   - [ ] Can add/delete reviews
   - [ ] Can toggle section visibility
   - [ ] Changes persist after refresh

### 4.3 Test image upload

1. In admin panel → Results tab
2. Click "Thêm kết quả mới"
3. Upload an image
4. Verify it uploads to Supabase Storage
5. Check the image appears on the public homepage carousel

---

## Step 5: Monitor and Maintain

### 5.1 Supabase monitoring

- Go to Supabase dashboard → Database
- Monitor table sizes and query performance
- Check logs for errors

### 5.2 Vercel monitoring

- Go to Vercel dashboard → Analytics
- Monitor traffic and performance
- Check deployment logs

### 5.3 Backup strategy

Supabase automatically backs up your database daily. For additional safety:

1. Go to Supabase dashboard → Database → Backups
2. Consider enabling point-in-time recovery

---

## Troubleshooting

### Supabase connection errors

- Verify environment variables are set correctly
- Check Supabase project is not paused
- Ensure RLS policies allow public read access

### Auth errors

- Verify admin user exists in `admin_profiles` table
- Check email/password are correct
- Ensure user is confirmed in Supabase Auth

### Image upload errors

- Verify `clinic-images` bucket exists and is public
- Check RLS policies on storage
- Ensure file size is under 10MB

### Build errors on Vercel

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

---

## Security Checklist

- [ ] Supabase service role key is marked as secret in Vercel
- [ ] RLS policies are enabled on all tables
- [ ] Admin authentication is working with Supabase Auth
- [ ] No sensitive data is committed to Git
- [ ] `.env.local` is in `.gitignore`
- [ ] Custom domain has SSL enabled (automatic on Vercel)

---

## Local Development Without Supabase

The app supports a fallback mode for local development without Supabase:

1. Leave environment variables empty in `.env.local`
2. The app will use in-memory seed data
3. Admin login will use the demo code: `DRNAM2026`
4. Images will be saved to `public/uploads/` instead of Supabase Storage

⚠️ **Note**: Fallback mode is for development only. Always use Supabase for production.

# Deployment Guide - Vercel + Supabase

## Prerequisites

1. **Supabase Account** (free tier works)
   - Sign up at https://supabase.com
   - Create a new project
   - Get your project URL and anon key from Settings > API

2. **Vercel Account**
   - Sign up at https://vercel.com
   - Connect your GitHub repository

## Step 1: Set Up Supabase Database

1. Go to your Supabase project SQL Editor
2. Run the migration script from `supabase/migrations/001_initial_schema.sql`
3. Verify tables are created in the Table Editor

## Step 2: Configure Environment Variables

### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add these variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: Prefix frontend variables with `VITE_` so Vite can access them.

### For Local Development:

Create `backend/.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `frontend/.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will automatically detect the configuration
4. Set the environment variables in Vercel dashboard
5. Deploy!

## Step 4: Verify Deployment

1. Check that API routes work: `https://your-app.vercel.app/api/questionnaires`
2. Check that frontend loads: `https://your-app.vercel.app`
3. Test creating a questionnaire
4. Test real-time updates on the dashboard

## Troubleshooting

### API Routes Not Working
- Check that environment variables are set correctly
- Verify Supabase connection in Vercel logs
- Check that the `api` directory structure is correct

### Real-time Not Working
- Verify Supabase Realtime is enabled in your project
- Check that the `answers` table has Realtime enabled
- Check browser console for connection errors

### Build Errors
- Ensure all dependencies are in package.json
- Check that TypeScript compiles without errors
- Verify Vercel build logs

## Local Development

To run locally with Supabase:

1. Install dependencies: `npm run install:all`
2. Set up environment variables (see Step 2)
3. Run: `npm run dev`

Note: The backend Express server is kept for local development. In production, Vercel uses serverless functions from the `api` directory.


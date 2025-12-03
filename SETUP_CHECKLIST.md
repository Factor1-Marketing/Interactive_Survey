# Supabase + Vercel Setup Checklist

## ✅ Completed Migration Steps

- [x] Replaced SQLite with Supabase PostgreSQL
- [x] Replaced Socket.io with Supabase Realtime
- [x] Converted Express routes to Vercel serverless functions
- [x] Updated frontend to use Supabase client
- [x] Created database migration SQL
- [x] Updated configuration files

## 📋 Next Steps for Deployment

### 1. Supabase Setup
- [ ] Create Supabase account at https://supabase.com
- [ ] Create a new project
- [ ] Go to SQL Editor
- [ ] Run `supabase/migrations/001_initial_schema.sql`
- [ ] Verify tables are created (questionnaires, questions, answers)
- [ ] Enable Realtime for `answers` table (should be automatic from migration)
- [ ] Copy your project URL and anon key from Settings > API

### 2. Local Testing
- [ ] Create `backend/.env` with Supabase credentials
- [ ] Create `frontend/.env` with Supabase credentials (prefixed with VITE_)
- [ ] Run `npm run install:all` to install dependencies
- [ ] Run `npm run dev` to test locally
- [ ] Create a test questionnaire
- [ ] Submit test answers
- [ ] Verify real-time updates work

### 3. GitHub Setup
- [ ] Initialize git repository (if not already done)
- [ ] Create `.gitignore` (already created)
- [ ] Commit all changes
- [ ] Push to GitHub

### 4. Vercel Deployment
- [ ] Sign up/login to Vercel
- [ ] Import GitHub repository
- [ ] Add environment variables in Vercel:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy!
- [ ] Test deployed app

## 🔍 Verification

After deployment, verify:
- [ ] API routes work: `https://your-app.vercel.app/api/questionnaires`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Can create questionnaires
- [ ] Can submit answers
- [ ] Real-time updates work on dashboard

## 🐛 Troubleshooting

### API Routes Return 404
- Check `vercel.json` configuration
- Verify API functions are in `api/` directory
- Check Vercel build logs

### Real-time Not Working
- Verify Supabase Realtime is enabled
- Check browser console for errors
- Verify environment variables are set correctly

### Database Errors
- Verify migration SQL was run successfully
- Check Supabase table editor
- Verify RLS policies are set correctly

## 📝 Notes

- The Express server (`backend/src/server.ts`) is kept for local development
- In production, Vercel uses serverless functions from `api/` directory
- Supabase Realtime automatically broadcasts changes when answers are inserted
- No WebSocket server needed - Supabase handles real-time


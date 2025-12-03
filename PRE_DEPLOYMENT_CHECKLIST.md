# Pre-Deployment Checklist ✅

## Security Check ✅
- [x] No hardcoded credentials in code
- [x] All credentials use environment variables
- [x] .gitignore excludes .env files
- [x] .gitignore excludes database files (*.db)

## Database Setup ✅
- [x] SQL migration run successfully in Supabase
- [x] Tables created: questionnaires, questions, answers
- [x] RLS policies configured
- [x] Realtime enabled for answers table

## Code Ready ✅
- [x] All dependencies updated (Supabase instead of SQLite/Socket.io)
- [x] API routes converted to Vercel serverless functions
- [x] Frontend uses Supabase client
- [x] Real-time subscriptions implemented

## Before Pushing to GitHub

1. **Verify no sensitive files**:
   ```bash
   # Check for any .env files (should not exist or be ignored)
   # Check for database files (should be ignored)
   ```

2. **Get your Supabase credentials**:
   - Go to Supabase Dashboard > Settings > API
   - Copy:
     - Project URL (e.g., https://xxxxx.supabase.co)
     - anon/public key (starts with eyJ...)

3. **Test locally** (optional but recommended):
   - Create `backend/.env` with your Supabase credentials
   - Create `frontend/.env` with your Supabase credentials (prefixed with VITE_)
   - Run `npm run dev` and test the app

## GitHub Deployment Steps

1. **Initialize git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Supabase + Vercel setup"
   ```

2. **Create GitHub repository**:
   - Go to GitHub and create a new repository
   - Don't initialize with README (you already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

## Vercel Deployment Steps

1. **Import repository**:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure build settings** (should auto-detect):
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

3. **Add Environment Variables**:
   Go to Settings > Environment Variables and add:
   
   **For Production:**
   ```
   SUPABASE_URL = your_supabase_project_url
   SUPABASE_ANON_KEY = your_supabase_anon_key
   VITE_SUPABASE_URL = your_supabase_project_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```
   
   **Important**: Add these for all environments (Production, Preview, Development)

4. **Deploy!**
   - Click "Deploy"
   - Wait for build to complete
   - Test your deployed app

## Post-Deployment Verification

- [ ] Visit your Vercel URL
- [ ] Test creating a questionnaire
- [ ] Test submitting answers
- [ ] Verify real-time updates work on dashboard
- [ ] Check Vercel logs for any errors

## Troubleshooting

If deployment fails:
1. Check Vercel build logs
2. Verify environment variables are set correctly
3. Check that Supabase URL and keys are correct
4. Verify API routes are accessible


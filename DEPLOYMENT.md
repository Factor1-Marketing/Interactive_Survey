# Deployment Guide

## Vercel + Supabase Deployment

This guide covers deploying the questionnaire app to Vercel (frontend) and Supabase (database + real-time).

### Prerequisites

1. **Supabase Account** (free tier works)
   - Create a new project at https://supabase.com
   - Get your project URL and anon key from Settings > API

2. **Vercel Account**
   - Connect your GitHub repository

### Step 1: Set Up Supabase Database

1. Go to your Supabase project SQL Editor
2. Run this SQL to create the tables:

```sql
-- Create questionnaires table
CREATE TABLE IF NOT EXISTS questionnaires (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  questionnaire_id TEXT NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'open_ended')),
  question_text TEXT NOT NULL,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire_id ON questions(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_submitted_at ON answers(submitted_at);

-- Enable Row Level Security (optional, for public access)
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read/write (since no auth)
CREATE POLICY "Allow public read" ON questionnaires FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON questionnaires FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON answers FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON answers FOR INSERT WITH CHECK (true);
```

### Step 2: Update Environment Variables

**In Vercel Dashboard**, add these environment variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For local development**, create `backend/.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Convert Backend to Vercel Serverless Functions

The backend needs to be restructured as Vercel serverless functions. See `vercel.json` configuration.

### Step 4: Update Frontend for Supabase Real-time

The frontend will use Supabase real-time subscriptions instead of WebSocket.

### Alternative: Separate Backend Deployment

If you prefer to keep the Express server:

1. **Deploy Backend** to Railway, Render, or Fly.io
   - These platforms support persistent servers and WebSocket
   - Keep current Express + Socket.io setup

2. **Deploy Frontend** to Vercel
   - Update `VITE_WS_URL` to your backend URL
   - Update API base URL

This is simpler but requires managing two deployments.


# Questionnaire Vote Collection Web App

A real-time questionnaire application that allows admins to create questionnaires and view live results as participants submit answers.

## Features

- **Admin Dashboard**: Create questionnaires with multiple choice or open-ended questions
- **Participant Forms**: Accessible via unique links, no authentication required
- **Live Results Dashboard**: Real-time updates showing:
  - Multiple choice: Bar charts with vote counts and rankings
  - Open-ended: Word cloud with similarity grouping (words sized by frequency, positioned with frequent words in center)

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Vercel Serverless Functions + Supabase
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime subscriptions

## Local Development Setup

**Prerequisites**: Supabase account and project

1. **Set up Supabase**:
   - Create a project at https://supabase.com
   - Run the migration script from `supabase/migrations/001_initial_schema.sql` in the SQL Editor
   - Get your project URL and anon key from Settings > API

2. **Install dependencies**:
```bash
npm run install:all
```

3. **Configure environment variables**:

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

4. **Start development servers**:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000 (Express server for local dev)
- Frontend dev server on http://localhost:3000

## Deployment to Vercel

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

**Quick steps**:
1. Set up Supabase database (run migration SQL)
2. Push code to GitHub
3. Import repository in Vercel
4. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

## Usage

1. Navigate to `/admin` to create questionnaires
2. Share the participant link (`/form/:questionnaireId`) with participants
3. View live results at `/dashboard/:questionnaireId`

## Project Structure

```
/
├── api/                    # Vercel serverless functions
│   ├── questionnaires/     # Questionnaire API endpoints
│   └── answers/           # Answer API endpoints
├── backend/               # Backend code (shared with API functions)
│   └── src/
│       ├── lib/           # Supabase client
│       ├── services/      # Database and similarity services
│       └── types.ts        # TypeScript types
├── frontend/              # React frontend
│   └── src/
│       ├── components/    # React components
│       ├── hooks/         # Custom hooks (Supabase Realtime)
│       └── lib/           # Supabase client
└── supabase/              # Database migrations
    └── migrations/
```

## Environment Variables

**Backend**:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key

**Frontend**:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## License

MIT

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

-- Enable Row Level Security
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read/write (since no auth)
CREATE POLICY "Allow public read questionnaires" ON questionnaires FOR SELECT USING (true);
CREATE POLICY "Allow public insert questionnaires" ON questionnaires FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert questions" ON questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read answers" ON answers FOR SELECT USING (true);
CREATE POLICY "Allow public insert answers" ON answers FOR INSERT WITH CHECK (true);

-- Enable Realtime for answers table (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE answers;


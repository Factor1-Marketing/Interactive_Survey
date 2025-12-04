import { createClient } from '@supabase/supabase-js';
import { Questionnaire, Question, Answer } from '../lib/types.js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using placeholder values.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');

// Database types matching Supabase schema
export interface SupabaseQuestionnaire {
  id: string;
  title: string;
  created_at: string;
}

export interface SupabaseQuestion {
  id: string;
  questionnaire_id: string;
  type: 'multiple_choice' | 'open_ended';
  question_text: string;
  options: string[] | null;
  created_at: string;
}

export interface SupabaseAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  submitted_at: string;
}


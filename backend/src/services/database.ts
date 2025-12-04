import { supabase, SupabaseQuestionnaire, SupabaseQuestion, SupabaseAnswer } from '../lib/supabase.js';
import { Questionnaire, Question, Answer } from '../types.js';

export class DatabaseService {
  static async initialize() {
    // Supabase handles initialization automatically
    // Just verify connection
    const { error } = await supabase.from('questionnaires').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned, which is fine
      console.error('Supabase connection error:', error);
      throw new Error('Failed to connect to Supabase');
    }
    console.log('Supabase database connected');
  }

  // Questionnaire operations
  static async createQuestionnaire(questionnaire: Questionnaire): Promise<void> {
    const { error } = await supabase
      .from('questionnaires')
      .insert({
        id: questionnaire.id,
        title: questionnaire.title,
        created_at: questionnaire.createdAt,
      });

    if (error) throw error;
  }

  static async getQuestionnaire(id: string): Promise<Questionnaire | null> {
    const { data, error } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      createdAt: data.created_at,
    };
  }

  static async getAllQuestionnaires(): Promise<Questionnaire[]> {
    const { data, error } = await supabase
      .from('questionnaires')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questionnaires:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.warn('No questionnaires found or invalid data');
      return [];
    }

    return data.map((row: SupabaseQuestionnaire) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
    }));
  }

  // Question operations
  static async createQuestion(question: Question): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .insert({
        id: question.id,
        questionnaire_id: question.questionnaireId,
        type: question.type,
        question_text: question.questionText,
        options: question.options || null,
      });

    if (error) throw error;
  }

  static async getQuestionsByQuestionnaire(questionnaireId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('questionnaire_id', questionnaireId)
      .order('id');

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    // Ensure data is always an array
    if (!data || !Array.isArray(data)) {
      console.warn(`No questions found or invalid data for questionnaire ${questionnaireId}. Data:`, data);
      return [];
    }

    console.log(`Fetched ${data.length} questions for questionnaire ${questionnaireId}`);

    return data.map((row: SupabaseQuestion) => ({
      id: row.id,
      questionnaireId: row.questionnaire_id,
      type: row.type,
      questionText: row.question_text,
      options: row.options || undefined,
    }));
  }

  static async getQuestion(id: string): Promise<Question | null> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      questionnaireId: data.questionnaire_id,
      type: data.type,
      questionText: data.question_text,
      options: data.options || undefined,
    };
  }

  // Answer operations
  static async createAnswer(answer: Answer): Promise<void> {
    const { error } = await supabase
      .from('answers')
      .insert({
        id: answer.id,
        question_id: answer.questionId,
        answer_text: answer.answerText,
        submitted_at: answer.submittedAt,
      });

    if (error) throw error;
  }

  static async getAnswersByQuestion(questionId: string): Promise<Answer[]> {
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('question_id', questionId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching answers:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.warn(`No answers found or invalid data for question ${questionId}`);
      return [];
    }

    return data.map((row: SupabaseAnswer) => ({
      id: row.id,
      questionId: row.question_id,
      answerText: row.answer_text,
      submittedAt: row.submitted_at,
    }));
  }

  static async getAllAnswersByQuestionnaire(questionnaireId: string): Promise<Answer[]> {
    // Get questions first, then answers
    const questions = await this.getQuestionsByQuestionnaire(questionnaireId);
    const questionIds = questions.map(q => q.id);

    if (questionIds.length === 0) return [];

    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .in('question_id', questionIds)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching all answers:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.warn(`No answers found or invalid data for questionnaire ${questionnaireId}`);
      return [];
    }

    return data.map((row: SupabaseAnswer) => ({
      id: row.id,
      questionId: row.question_id,
      answerText: row.answer_text,
      submittedAt: row.submitted_at,
    }));
  }
}

export type QuestionType = 'multiple_choice' | 'open_ended';

export interface Questionnaire {
  id: string;
  title: string;
  createdAt: string;
}

export interface Question {
  id: string;
  questionnaireId: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // For multiple choice questions
}

export interface Answer {
  id: string;
  questionId: string;
  answerText: string;
  submittedAt: string;
}

export interface CreateQuestionnaireRequest {
  title: string;
  questions: Omit<Question, 'id' | 'questionnaireId'>[];
}

export interface SubmitAnswerRequest {
  questionId: string;
  answerText: string;
}

export interface MultipleChoiceStats {
  option: string;
  count: number;
  percentage: number;
}

export interface WordCloudData {
  text: string;
  value: number;
}


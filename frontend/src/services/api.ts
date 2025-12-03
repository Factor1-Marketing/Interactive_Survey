import axios from 'axios';

const API_BASE_URL = '/api';

export interface Questionnaire {
  id: string;
  title: string;
  createdAt: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  questionnaireId: string;
  type: 'multiple_choice' | 'open_ended';
  questionText: string;
  options?: string[];
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

export interface QuestionResult {
  question: Question;
  answers: any[];
  stats?: MultipleChoiceStats[];
  wordCloudData?: WordCloudData[];
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const questionnaireApi = {
  create: async (data: CreateQuestionnaireRequest): Promise<Questionnaire> => {
    const response = await api.post('/questionnaires', data);
    return response.data;
  },

  getAll: async (): Promise<Questionnaire[]> => {
    const response = await api.get('/questionnaires');
    return response.data;
  },

  getById: async (id: string): Promise<Questionnaire> => {
    const response = await api.get(`/questionnaires/${id}`);
    return response.data;
  },
};

export const answerApi = {
  submit: async (data: SubmitAnswerRequest): Promise<void> => {
    await api.post('/answers', data);
  },

  getByQuestionnaire: async (questionnaireId: string): Promise<QuestionResult[]> => {
    const response = await api.get(`/answers/questionnaire/${questionnaireId}`);
    return response.data;
  },
};


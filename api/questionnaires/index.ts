import { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import type { CreateQuestionnaireRequest, Questionnaire, Question } from '../../backend/src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Dynamic import for ES modules (runtime values only)
  const { DatabaseService } = await import('../../backend/src/services/database.js');
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { title, questions }: CreateQuestionnaireRequest = req.body;

      if (!title || !questions || questions.length === 0) {
        return res.status(400).json({ error: 'Title and at least one question are required' });
      }

      const questionnaireId = uuidv4();
      const questionnaire: Questionnaire = {
        id: questionnaireId,
        title,
        createdAt: new Date().toISOString()
      };

      await DatabaseService.createQuestionnaire(questionnaire);

      // Create questions
      for (const questionData of questions) {
        const question: Question = {
          id: uuidv4(),
          questionnaireId,
          type: questionData.type,
          questionText: questionData.questionText,
          options: questionData.options
        };
        await DatabaseService.createQuestion(question);
      }

      return res.status(201).json(questionnaire);
    } catch (error) {
      console.error('Error creating questionnaire:', error);
      return res.status(500).json({ error: 'Failed to create questionnaire' });
    }
  }

  if (req.method === 'GET') {
    try {
      const questionnaires = await DatabaseService.getAllQuestionnaires();
      return res.json(questionnaires);
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      return res.status(500).json({ error: 'Failed to fetch questionnaires' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


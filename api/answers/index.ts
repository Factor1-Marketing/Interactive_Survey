import { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../../backend/src/services/database.js';
import { SubmitAnswerRequest, Answer } from '../../backend/src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { questionId, answerText }: SubmitAnswerRequest = req.body;

      if (!questionId || !answerText) {
        return res.status(400).json({ error: 'Question ID and answer text are required' });
      }

      // Verify question exists
      const question = await DatabaseService.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      // Validate multiple choice answer
      if (question.type === 'multiple_choice' && question.options) {
        if (!question.options.includes(answerText)) {
          return res.status(400).json({ error: 'Invalid answer option' });
        }
      }

      const answer: Answer = {
        id: uuidv4(),
        questionId,
        answerText: answerText.trim(),
        submittedAt: new Date().toISOString()
      };

      await DatabaseService.createAnswer(answer);
      
      // Supabase Realtime will automatically broadcast the update
      return res.status(201).json(answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
      return res.status(500).json({ error: 'Failed to submit answer' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


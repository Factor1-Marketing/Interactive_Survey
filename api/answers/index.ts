import { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import type { SubmitAnswerRequest, Answer } from '../lib/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Dynamic import for ES modules (runtime values only)
  const { DatabaseService } = await import('../lib/database.js');
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
      console.log('Answer created successfully:', answer.id, 'for question:', questionId);
      console.log('Answer text:', answerText);
      
      // Supabase Realtime will automatically broadcast the update
      return res.status(201).json(answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
      return res.status(500).json({ error: 'Failed to submit answer' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


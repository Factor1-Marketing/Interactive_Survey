import { VercelRequest, VercelResponse } from '@vercel/node';
import { DatabaseService } from '../../backend/src/services/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid questionnaire ID' });
      }

      const questionnaire = await DatabaseService.getQuestionnaire(id);
      
      if (!questionnaire) {
        return res.status(404).json({ error: 'Questionnaire not found' });
      }

      const questions = await DatabaseService.getQuestionsByQuestionnaire(id);
      return res.json({ ...questionnaire, questions });
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      return res.status(500).json({ error: 'Failed to fetch questionnaire' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


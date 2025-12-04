import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Dynamic import for ES modules
  const { DatabaseService } = await import('../../backend/src/services/database.js');
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

      let questions;
      try {
        questions = await DatabaseService.getQuestionsByQuestionnaire(id);
        console.log(`Fetched ${questions?.length || 0} questions for questionnaire ${id}`);
        console.log('Questions data type:', typeof questions);
        console.log('Is array:', Array.isArray(questions));
        if (questions && questions.length > 0) {
          console.log('First question sample:', JSON.stringify(questions[0], null, 2));
        }
      } catch (dbError) {
        console.error('Database error fetching questions:', dbError);
        questions = [];
      }
      
      // Ensure questions is always an array
      const questionsArray = Array.isArray(questions) ? questions : [];
      
      const response = { 
        ...questionnaire, 
        questions: questionsArray 
      };
      
      console.log('=== API Response Debug ===');
      console.log('Questionnaire ID:', id);
      console.log('Questionnaire title:', questionnaire.title);
      console.log('Questions array length:', questionsArray.length);
      console.log('Response structure:', JSON.stringify(response, null, 2));
      console.log('==========================');
      
      return res.json(response);
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
      return res.status(500).json({ error: 'Failed to fetch questionnaire' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


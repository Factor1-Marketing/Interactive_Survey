import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Dynamic import for ES modules
  const { DatabaseService } = await import('../../../../backend/src/services/database.js');
  const { MultipleChoiceStats } = await import('../../../../backend/src/types.js');
  const { groupSimilarAnswers } = await import('../../../../backend/src/services/similarity.js');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { questionnaireId } = req.query;
      if (!questionnaireId || typeof questionnaireId !== 'string') {
        return res.status(400).json({ error: 'Invalid questionnaire ID' });
      }

      const questions = await DatabaseService.getQuestionsByQuestionnaire(questionnaireId);
      
      const results = await Promise.all(
        questions.map(async (question) => {
          const answers = await DatabaseService.getAnswersByQuestion(question.id);
          
          if (question.type === 'multiple_choice') {
            const statsMap = new Map<string, number>();
            const totalAnswers = answers.length;

            answers.forEach(answer => {
              const count = statsMap.get(answer.answerText) || 0;
              statsMap.set(answer.answerText, count + 1);
            });

            const stats: MultipleChoiceStats[] = Array.from(statsMap.entries())
              .map(([option, count]) => ({
                option,
                count,
                percentage: totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
              }))
              .sort((a, b) => b.count - a.count);

            return { question, answers, stats };
          } else {
            const wordCloudData = groupSimilarAnswers(answers);
            return { question, answers, wordCloudData };
          }
        })
      );

      return res.json(results);
    } catch (error) {
      console.error('Error fetching questionnaire answers:', error);
      return res.status(500).json({ error: 'Failed to fetch answers' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


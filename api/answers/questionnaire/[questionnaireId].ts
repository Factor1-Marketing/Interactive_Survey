import { VercelRequest, VercelResponse } from '@vercel/node';
import type { MultipleChoiceStats } from '../../../../backend/src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Dynamic import for ES modules (runtime values only)
  const { DatabaseService } = await import('../../../../backend/src/services/database.js');
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
      
      // Ensure questions is an array
      if (!Array.isArray(questions) || questions.length === 0) {
        console.log(`No questions found for questionnaire ${questionnaireId}`);
        return res.json([]);
      }
      
      const results = await Promise.all(
        questions.map(async (question) => {
          try {
            const answers = await DatabaseService.getAnswersByQuestion(question.id);
            
            // Ensure answers is an array
            const answersArray = Array.isArray(answers) ? answers : [];
            
            if (question.type === 'multiple_choice') {
              const statsMap = new Map<string, number>();
              const totalAnswers = answersArray.length;

              answersArray.forEach(answer => {
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

              return { question, answers: answersArray, stats };
            } else {
              const wordCloudData = groupSimilarAnswers(answersArray);
              return { question, answers: answersArray, wordCloudData };
            }
          } catch (error) {
            console.error(`Error processing question ${question.id}:`, error);
            // Return a result with empty data for this question
            return {
              question,
              answers: [],
              stats: question.type === 'multiple_choice' ? [] : undefined,
              wordCloudData: question.type === 'open_ended' ? [] : undefined
            };
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


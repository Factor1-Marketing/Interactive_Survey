import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database.js';
import { SubmitAnswerRequest, Answer, MultipleChoiceStats } from '../types.js';
import { groupSimilarAnswers } from '../services/similarity.js';
import { broadcastAnswerUpdate } from '../services/websocket.js';

const router = Router();

// Submit an answer
router.post('/', async (req, res) => {
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
    
    // Broadcast update to dashboard
    await broadcastAnswerUpdate(question.questionnaireId);
    
    res.status(201).json(answer);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Get answers for a specific question
router.get('/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await DatabaseService.getQuestion(questionId);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answers = await DatabaseService.getAnswersByQuestion(questionId);

    if (question.type === 'multiple_choice') {
      // Calculate stats for multiple choice
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

      res.json({ question, answers, stats });
    } else {
      // Group similar answers for open-ended
      const wordCloudData = groupSimilarAnswers(answers);
      res.json({ question, answers, wordCloudData });
    }
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

// Get all answers for a questionnaire
router.get('/questionnaire/:questionnaireId', async (req, res) => {
  try {
    const { questionnaireId } = req.params;
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

    res.json(results);
  } catch (error) {
    console.error('Error fetching questionnaire answers:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

export default router;


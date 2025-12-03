import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database.js';
import { CreateQuestionnaireRequest, Questionnaire, Question } from '../types.js';

const router = Router();

// Create a new questionnaire
router.post('/', async (req, res) => {
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

    res.status(201).json(questionnaire);
  } catch (error) {
    console.error('Error creating questionnaire:', error);
    res.status(500).json({ error: 'Failed to create questionnaire' });
  }
});

// Get all questionnaires
router.get('/', async (req, res) => {
  try {
    const questionnaires = await DatabaseService.getAllQuestionnaires();
    res.json(questionnaires);
  } catch (error) {
    console.error('Error fetching questionnaires:', error);
    res.status(500).json({ error: 'Failed to fetch questionnaires' });
  }
});

// Get a specific questionnaire with its questions
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const questionnaire = await DatabaseService.getQuestionnaire(id);
    
    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }

    const questions = await DatabaseService.getQuestionsByQuestionnaire(id);
    res.json({ ...questionnaire, questions });
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    res.status(500).json({ error: 'Failed to fetch questionnaire' });
  }
});

export default router;


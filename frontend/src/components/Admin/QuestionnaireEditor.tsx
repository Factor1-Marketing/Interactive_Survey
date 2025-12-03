import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionnaireApi, Question } from '../../services/api';
import QuestionForm from './QuestionForm';
import './QuestionnaireEditor.css';

export default function QuestionnaireEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Partial<Question>[]>([
    {
      type: 'multiple_choice',
      questionText: '',
      options: ['', ''],
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: 'multiple_choice',
        questionText: '',
        options: ['', ''],
      },
    ]);
  };

  const updateQuestion = (index: number, question: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = question;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!title.trim()) {
      alert('Please enter a title for the questionnaire');
      return;
    }

    const validQuestions = questions.filter(
      (q) => q.questionText && q.questionText.trim()
    );

    if (validQuestions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    // Validate multiple choice questions have at least 2 options
    for (const question of validQuestions) {
      if (question.type === 'multiple_choice') {
        const filledOptions = question.options?.filter((opt) => opt.trim()) || [];
        if (filledOptions.length < 2) {
          alert('Multiple choice questions must have at least 2 options');
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const questionnaire = await questionnaireApi.create({
        title: title.trim(),
        questions: validQuestions.map((q) => ({
          type: q.type!,
          questionText: q.questionText!,
          options: q.type === 'multiple_choice' ? q.options?.filter((opt) => opt.trim()) : undefined,
        })),
      });

      navigate(`/dashboard/${questionnaire.id}`);
    } catch (error) {
      console.error('Error creating questionnaire:', error);
      alert('Failed to create questionnaire. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="editor-header">
        <h1>Create Questionnaire</h1>
      </div>

      <form onSubmit={handleSubmit} className="questionnaire-form">
        <div className="form-group">
          <label htmlFor="title">Questionnaire Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter questionnaire title"
            className="form-input"
            required
          />
        </div>

        <div className="questions-section">
          <div className="questions-header">
            <h2>Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="btn btn-secondary"
            >
              + Add Question
            </button>
          </div>

          {questions.map((question, index) => (
            <QuestionForm
              key={index}
              question={question}
              onChange={(q) => updateQuestion(index, q)}
              onRemove={() => removeQuestion(index)}
            />
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Creating...' : 'Create Questionnaire'}
          </button>
        </div>
      </form>
    </div>
  );
}


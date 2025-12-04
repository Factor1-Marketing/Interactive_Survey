import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { questionnaireApi, answerApi, Question } from '../../services/api';
import './QuestionnaireForm.css';

export default function QuestionnaireForm() {
  const { questionnaireId } = useParams<{ questionnaireId: string }>();
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (questionnaireId) {
      loadQuestionnaire();
    }
  }, [questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      const data = await questionnaireApi.getById(questionnaireId!);
      console.log('Loaded questionnaire data:', data);
      console.log('Questions:', data.questions);
      setQuestionnaire(data);
      
      // Initialize answers object
      const initialAnswers: { [key: string]: string } = {};
      if (data.questions && Array.isArray(data.questions)) {
        data.questions.forEach((q: Question) => {
          initialAnswers[q.id] = '';
        });
      } else {
        console.warn('No questions found in questionnaire data');
      }
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error loading questionnaire:', error);
      alert('Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Submit all answers
      const submitPromises = Object.entries(answers)
        .filter(([_, value]) => value.trim())
        .map(([questionId, answerText]) =>
          answerApi.submit({ questionId, answerText })
        );

      await Promise.all(submitPromises);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('Failed to submit answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading questionnaire...</div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="container">
        <div className="error">Questionnaire not found</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container">
        <div className="success-message">
          <h2>Thank you!</h2>
          <p>Your answers have been submitted successfully.</p>
        </div>
      </div>
    );
  }

  const questions = questionnaire.questions || [];
  const hasQuestions = Array.isArray(questions) && questions.length > 0;

  return (
    <div className="container">
      <div className="questionnaire-form-container">
        <h1>{questionnaire.title}</h1>
        {!hasQuestions ? (
          <div className="error" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>No questions found in this questionnaire.</p>
            <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
              Please contact the administrator.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="participant-form">
            {questions.map((question: Question) => (
              <div key={question.id} className="question-item">
                <label className="question-label">
                  {question.questionText}
                  {question.type === 'multiple_choice' && <span className="required">*</span>}
                </label>

                {question.type === 'multiple_choice' ? (
                  <div className="options-group">
                    {question.options && question.options.length > 0 ? (
                      question.options.map((option, index) => (
                        <label key={index} className="radio-option">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            required
                          />
                          <span>{option}</span>
                        </label>
                      ))
                    ) : (
                      <p style={{ color: '#e74c3c', fontSize: '0.9rem' }}>
                        No options available for this question.
                      </p>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Enter your answer"
                    className="text-input"
                  />
                )}
              </div>
            ))}

            <div className="form-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-submit"
              >
                {submitting ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


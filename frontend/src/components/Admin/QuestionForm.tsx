import { useState } from 'react';
import { Question } from '../../services/api';
import './QuestionForm.css';

interface QuestionFormProps {
  question: Partial<Question>;
  onChange: (question: Partial<Question>) => void;
  onRemove: () => void;
}

export default function QuestionForm({ question, onChange, onRemove }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState(question.questionText || '');
  const [type, setType] = useState<'multiple_choice' | 'open_ended'>(
    question.type || 'multiple_choice'
  );
  const [options, setOptions] = useState<string[]>(question.options || ['', '']);

  const handleTypeChange = (newType: 'multiple_choice' | 'open_ended') => {
    setType(newType);
    onChange({
      ...question,
      type: newType,
      options: newType === 'multiple_choice' ? options : undefined,
    });
  };

  const handleQuestionTextChange = (text: string) => {
    setQuestionText(text);
    onChange({ ...question, questionText: text });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    onChange({ ...question, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...options, ''];
    setOptions(newOptions);
    onChange({ ...question, options: newOptions });
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      onChange({ ...question, options: newOptions });
    }
  };

  return (
    <div className="question-form">
      <div className="question-form-header">
        <h3>Question</h3>
        <button onClick={onRemove} className="btn-remove">
          Remove
        </button>
      </div>

      <div className="form-group">
        <label>Question Text</label>
        <input
          type="text"
          value={questionText}
          onChange={(e) => handleQuestionTextChange(e.target.value)}
          placeholder="Enter your question"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Question Type</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="multiple_choice"
              checked={type === 'multiple_choice'}
              onChange={() => handleTypeChange('multiple_choice')}
            />
            Multiple Choice
          </label>
          <label>
            <input
              type="radio"
              value="open_ended"
              checked={type === 'open_ended'}
              onChange={() => handleTypeChange('open_ended')}
            />
            Open Ended
          </label>
        </div>
      </div>

      {type === 'multiple_choice' && (
        <div className="form-group">
          <label>Options</label>
          {options.map((option, index) => (
            <div key={index} className="option-input-group">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="form-input"
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="btn-remove-option"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button onClick={addOption} className="btn-add-option">
            + Add Option
          </button>
        </div>
      )}
    </div>
  );
}


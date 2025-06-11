// src/components/cards/CreateCardForm.jsx
import { useState } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const CreateCardForm = ({ deckName, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    difficulty_level: 'Easy'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      setError('Question and answer are required');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>Add Card to "{deckName}"</h5>
      </div>
      <div className="card-body">
        <ErrorMessage error={error} onClose={() => setError('')} />
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Question *</label>
            <textarea
              className="form-control"
              name="question"
              value={formData.question}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Answer *</label>
            <textarea
              className="form-control"
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Difficulty</label>
            <select
              className="form-select"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="d-flex gap-2">
            <Button type="submit" loading={loading}>
              Add Card
            </Button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCardForm;
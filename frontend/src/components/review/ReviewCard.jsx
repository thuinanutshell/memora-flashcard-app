// src/components/review/ReviewCard.jsx
import { useState } from 'react';
import Button from '../common/Button';

const ReviewCard = ({ card, onSubmitReview, loading }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      alert('Please enter your answer');
      return;
    }

    try {
      await onSubmitReview(card.id, { answer: userAnswer });
      // Reset for next card
      setShowAnswer(false);
      setUserAnswer('');
    } catch (error) {
      console.error('Review error:', error);
    }
  };

  const getBadgeClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'hard': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="card shadow">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Review Card</h5>
        <span className={`badge ${getBadgeClass(card.difficulty_level)}`}>
          {card.difficulty_level}
        </span>
      </div>

      <div className="card-body">
        {/* Question */}
        <div className="mb-4">
          <h6 className="text-muted mb-2">QUESTION</h6>
          <div className="p-3 bg-light rounded">
            <h5 className="mb-0">{card.question}</h5>
          </div>
        </div>

        {/* User Answer */}
        <div className="mb-4">
          <label className="form-label">Your Answer</label>
          <textarea
            className="form-control"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows="3"
            disabled={loading}
          />
        </div>

        {/* Show Answer Button */}
        {!showAnswer && (
          <div className="text-center mb-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowAnswer(true)}
            >
              Show Correct Answer
            </button>
          </div>
        )}

        {/* Correct Answer */}
        {showAnswer && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">CORRECT ANSWER</h6>
            <div className="p-3 bg-success bg-opacity-10 border border-success rounded">
              <p className="mb-0">{card.answer}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="d-grid">
          <Button
            variant="success"
            loading={loading}
            onClick={handleSubmit}
            disabled={!userAnswer.trim() || loading}
          >
            Submit Review
          </Button>
        </div>
      </div>

      {/* Card Progress */}
      <div className="card-footer bg-transparent">
        <div className="row text-center small">
          <div className="col-6">
            <div className="text-muted">Progress</div>
            <div className="fw-bold">{card.review_count}/3</div>
          </div>
          <div className="col-6">
            <div className="text-muted">Status</div>
            <div className="fw-bold">
              {card.is_fully_reviewed ? 'Mastered' : 'Learning'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
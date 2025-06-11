// src/components/cards/CardItem.jsx
import { useState } from 'react';

const CardItem = ({ card, onEdit, onDelete }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const getBadgeClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'hard': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className={`badge ${card.is_fully_reviewed ? 'bg-success' : 'bg-warning'}`}>
            {card.is_fully_reviewed ? 'Mastered' : `${card.review_count}/3`}
          </span>
          <span className={`badge ${getBadgeClass(card.difficulty_level)}`}>
            {card.difficulty_level}
          </span>
        </div>
        
        <h6 className="card-title">Q: {card.question}</h6>
        
        <div className="mb-3">
          <button 
            className="btn btn-link btn-sm p-0 text-decoration-none"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
          {showAnswer && (
            <p className="card-text mt-2 text-muted">A: {card.answer}</p>
          )}
        </div>

        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={() => onEdit(card)}
          >
            Edit
          </button>
          <button 
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              if (window.confirm('Delete this card?')) {
                onDelete(card.id);
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardItem;
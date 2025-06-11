// src/components/cards/CardsList.jsx
import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import CardItem from './CardItem';

const CardsList = ({ 
  deck, 
  cards, 
  loading, 
  error, 
  onEditCard, 
  onDeleteCard, 
  clearError 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCards = cards.filter(card =>
    card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner message="Loading cards..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Cards in "{deck.name}"</h4>
        <a href={`/cards/new/${deck.id}`} className="btn btn-primary">
          Add Card
        </a>
      </div>

      <ErrorMessage error={error} onClose={clearError} />

      {cards.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {cards.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">No cards yet</h5>
          <p className="text-muted">Add your first flashcard!</p>
          <a href={`/cards/new/${deck.id}`} className="btn btn-primary">
            Add First Card
          </a>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">No cards found</h5>
          <p className="text-muted">Try a different search term</p>
        </div>
      ) : (
        <div>
          {filteredCards.map(card => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardsList;
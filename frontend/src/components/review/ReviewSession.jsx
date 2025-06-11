// src/components/review/ReviewSession.jsx
import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import ReviewCard from './ReviewCard';
import ReviewResult from './ReviewResult';

const ReviewSession = ({ 
  deck, 
  cards, 
  loading, 
  error, 
  onSubmitReview, 
  clearError 
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reviewResults, setReviewResults] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentCard = cards[currentCardIndex];
  const totalCards = cards.length;

  const handleSubmitReview = async (cardId, reviewData) => {
    try {
      const result = await onSubmitReview(cardId, reviewData);
      
      // Store review result
      setReviewResults(prev => [...prev, {
        cardId,
        score: result.data.score,
        ...result.data
      }]);

      // Move to next card or finish session
      if (currentCardIndex < totalCards - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Review submission error:', error);
    }
  };

  const restartSession = () => {
    setCurrentCardIndex(0);
    setReviewResults([]);
    setSessionComplete(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading review session..." />;
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-5">
        <h4 className="text-muted">No cards to review</h4>
        <p className="text-muted">All cards in this deck are mastered!</p>
        <a href={`/decks/${deck.id}`} className="btn btn-primary">
          Back to Deck
        </a>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <ReviewResult
        deck={deck}
        results={reviewResults}
        totalCards={totalCards}
        onRestart={restartSession}
      />
    );
  }

  return (
    <div className="container-fluid">
      <ErrorMessage error={error} onClose={clearError} />

      {/* Progress Header */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-center">
            <h4>Reviewing "{deck.name}"</h4>
            <span className="badge bg-primary fs-6">
              {currentCardIndex + 1} of {totalCards}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="progress mt-2">
            <div 
              className="progress-bar" 
              style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Review Card */}
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <ReviewCard
            card={currentCard}
            onSubmitReview={handleSubmitReview}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewSession;
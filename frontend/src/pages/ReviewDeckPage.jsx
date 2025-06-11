// src/pages/ReviewDeckPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReviewSession from '../components/review/ReviewSession';
import useDecks from '../hooks/useDecks';
import useReview from '../hooks/useReview';

const ReviewDeckPage = () => {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [reviewableCards, setReviewableCards] = useState([]);
  
  const { getDeck, loading: deckLoading } = useDecks();
  const { submitReview, loading: reviewLoading, error, clearError } = useReview();

  useEffect(() => {
    const loadDeckAndCards = async () => {
      try {
        const response = await getDeck(deckId);
        const deckData = response.data?.deck || response.deck || response;
        
        setDeck(deckData);
        
        // Filter cards that need review (not fully reviewed)
        const cardsToReview = deckData.cards?.filter(card => !card.is_fully_reviewed) || [];
        setReviewableCards(cardsToReview);
      } catch (error) {
        console.error('Error loading deck:', error);
      }
    };

    if (deckId) {
      loadDeckAndCards();
    }
  }, [deckId, getDeck]);

  if (deckLoading || !deck) {
    return <LoadingSpinner message="Loading review session..." />;
  }

  return (
    <ReviewSession
      deck={deck}
      cards={reviewableCards}
      loading={reviewLoading}
      error={error}
      onSubmitReview={submitReview}
      clearError={clearError}
    />
  );
};

export default ReviewDeckPage;
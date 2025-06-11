// src/pages/CreateCardPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CreateCardForm from '../components/cards/CreateCardForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useCards from '../hooks/useCards';
import useDecks from '../hooks/useDecks';

const CreateCardPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  
  const { getDeck } = useDecks();
  const { createCard, loading } = useCards();

  useEffect(() => {
    const loadDeck = async () => {
      try {
        const response = await getDeck(deckId);
        console.log('CreateCardPage - Full deck API response:', response); // Debug log
        
        // Handle the nested response structure from your backend
        const deckData = response.data?.deck || response.deck || response;
        
        console.log('CreateCardPage - Extracted deck:', deckData); // Debug log
        
        setDeck(deckData);
      } catch (error) {
        console.error('Error loading deck:', error);
        // If deck loading fails, still allow navigation back
        setDeck({ name: 'Unknown Deck', id: deckId });
      }
    };

    if (deckId) {
      loadDeck();
    }
  }, [deckId, getDeck]);

  const handleSubmit = async (cardData) => {
    try {
      await createCard(deckId, cardData);
      navigate(`/decks/${deckId}`);
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/decks/${deckId}`);
  };

  // Show loading only if deck is null and we haven't set a fallback
  if (!deck) {
    return <LoadingSpinner message="Loading deck..." />;
  }

  return (
    <div className="container-fluid">
      <nav className="mb-3">
        <Link to={`/decks/${deckId}`} className="btn btn-link p-0">
          ← Back to {deck.name}
        </Link>
      </nav>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <CreateCardForm
            deckName={deck.name}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateCardPage;
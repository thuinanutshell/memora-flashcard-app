// src/pages/DeckDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DeckDetail from '../components/decks/DeckDetail';
import useDecks from '../hooks/useDecks';

const DeckDetailPage = () => {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  
  const { getDeck, loading, error, clearError } = useDecks();

  useEffect(() => {
    const loadDeck = async () => {
      try {
        const response = await getDeck(deckId);
        console.log('Full deck API response:', response); // Debug log
        
        // Handle the nested response structure from your backend
        // The response should be: {success: true, data: {deck: {...}}}
        const deckData = response.data?.deck || response.deck || response;
        
        console.log('Extracted deck:', deckData); // Debug log
        
        setDeck(deckData);
      } catch (error) {
        console.error('Error loading deck:', error);
      }
    };

    if (deckId) {
      loadDeck();
    }
  }, [deckId, getDeck]);

  return (
    <DeckDetail
      deck={deck}
      loading={loading}
      error={error}
      clearError={clearError}
    />
  );
};

export default DeckDetailPage;
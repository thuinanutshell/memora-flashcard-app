// src/hooks/useCards.js
import { useCallback, useState } from 'react';
import { cardService } from '../services/cardService';
import useApi from './useApi';

const useCards = () => {
  const { loading, error, executeRequest, clearError } = useApi();
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);

  const createCard = useCallback(async (deckId, cardData) => {
    const result = await executeRequest(cardService.createCard, deckId, cardData);
    if (result.success) {
      setCards(prev => [...prev, result.data.card]);
    }
    return result;
  }, [executeRequest]);

  const getCard = useCallback(async (cardId) => {
    const result = await executeRequest(cardService.getCard, cardId);
    if (result.success) {
      setCurrentCard(result.data.card);
    }
    return result;
  }, [executeRequest]);

  const updateCard = useCallback(async (cardId, updates) => {
    const result = await executeRequest(cardService.updateCard, cardId, updates);
    if (result.success) {
      setCards(prev => 
        prev.map(card => 
          card.id === cardId ? { ...card, ...result.data.card } : card
        )
      );
      if (currentCard && currentCard.id === cardId) {
        setCurrentCard(prev => ({ ...prev, ...result.data.card }));
      }
    }
    return result;
  }, [executeRequest, currentCard]);

  const deleteCard = useCallback(async (cardId) => {
    const result = await executeRequest(cardService.deleteCard, cardId);
    if (result.success) {
      setCards(prev => prev.filter(card => card.id !== cardId));
      if (currentCard && currentCard.id === cardId) {
        setCurrentCard(null);
      }
    }
    return result;
  }, [executeRequest, currentCard]);

  // Helper function to load cards from a deck response
  const loadCardsFromDeck = useCallback((deckData) => {
    if (deckData && deckData.cards) {
      setCards(deckData.cards);
    }
  }, []);

  return {
    cards,
    setCards,
    currentCard,
    setCurrentCard,
    loading,
    error,
    createCard,
    getCard,
    updateCard,
    deleteCard,
    loadCardsFromDeck,
    clearError
  };
};

export default useCards;
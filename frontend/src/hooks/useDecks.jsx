// src/hooks/useDecks.js
import { useCallback, useState } from 'react';
import { deckService } from '../services/deckService';
import useApi from './useApi';

const useDecks = () => {
  const { loading, error, executeRequest, clearError } = useApi();
  const [decks, setDecks] = useState([]);
  const [currentDeck, setCurrentDeck] = useState(null);

  const createDeck = useCallback(async (folderId, deckData) => {
    const result = await executeRequest(deckService.createDeck, folderId, deckData);
    if (result.success) {
      setDecks(prev => [...prev, result.data.deck]);
    }
    return result;
  }, [executeRequest]);

  const getDeck = useCallback(async (deckId) => {
    const result = await executeRequest(deckService.getDeck, deckId);
    if (result.success) {
      setCurrentDeck(result.data.deck);
    }
    return result;
  }, [executeRequest]);

  const updateDeck = useCallback(async (deckId, updates) => {
    const result = await executeRequest(deckService.updateDeck, deckId, updates);
    if (result.success) {
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId ? { ...deck, ...result.data.deck } : deck
        )
      );
      if (currentDeck && currentDeck.id === deckId) {
        setCurrentDeck(prev => ({ ...prev, ...result.data.deck }));
      }
    }
    return result;
  }, [executeRequest, currentDeck]);

  const deleteDeck = useCallback(async (deckId) => {
    const result = await executeRequest(deckService.deleteDeck, deckId);
    if (result.success) {
      setDecks(prev => prev.filter(deck => deck.id !== deckId));
      if (currentDeck && currentDeck.id === deckId) {
        setCurrentDeck(null);
      }
    }
    return result;
  }, [executeRequest, currentDeck]);

  return {
    decks,
    setDecks,
    currentDeck,
    setCurrentDeck,
    loading,
    error,
    createDeck,
    getDeck,
    updateDeck,
    deleteDeck,
    clearError
  };
};

export default useDecks;
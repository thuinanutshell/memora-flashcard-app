import api from './api';

const reviewService = {
  /**
   * Submit a review for a specific card
   */
  async submitReview(cardId, userAnswer) {
    try {
      const response = await api.post(`/review/card/${cardId}`, {
        answer: userAnswer
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit review'
      };
    }
  },

  /**
   * Get review history for a specific card
   */
  async getCardReviewHistory(cardId, limit = 10) {
    try {
      const response = await api.get(`/review/card/${cardId}/history`, {
        params: { limit }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load review history'
      };
    }
  },

  /**
   * Get cards due for review in a deck
   */
  async getCardsForReview(deckId) {
    try {
      // This uses the existing deck endpoint but filters for cards due for review
      const response = await api.get(`/deck/${deckId}`);
      if (response.data?.data?.cards) {
        const now = new Date();
        const cardsForReview = response.data.data.cards.filter(card => {
          // Include cards that:
          // 1. Have never been reviewed (next_review_at is null or in the past)
          // 2. Are due for review (next_review_at is in the past)
          // 3. Are not fully reviewed yet
          if (card.is_fully_reviewed) return false;
          
          if (!card.next_review_at) return true; // Never reviewed
          
          const nextReviewDate = new Date(card.next_review_at);
          return nextReviewDate <= now; // Due for review
        });

        return {
          success: true,
          cards: cardsForReview,
          deckName: response.data.data.name
        };
      }
      return {
        success: true,
        cards: [],
        deckName: ''
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load cards for review'
      };
    }
  },

  /**
   * Get all cards due for review across all user's decks
   */
  async getAllCardsForReview() {
    try {
      // First get all folders
      const foldersResponse = await api.get('/folder/');
      if (!foldersResponse.data?.data) {
        return { success: true, cards: [] };
      }

      const allReviewCards = [];
      const now = new Date();

      // Get all decks from all folders
      for (const folder of foldersResponse.data.data) {
        const folderResponse = await api.get(`/folder/${folder.id}`);
        if (folderResponse.data?.data?.decks) {
          for (const deck of folderResponse.data.data.decks) {
            const deckResponse = await api.get(`/deck/${deck.id}`);
            if (deckResponse.data?.data?.cards) {
              const cardsForReview = deckResponse.data.data.cards.filter(card => {
                if (card.is_fully_reviewed) return false;
                if (!card.next_review_at) return true;
                const nextReviewDate = new Date(card.next_review_at);
                return nextReviewDate <= now;
              });

              cardsForReview.forEach(card => {
                allReviewCards.push({
                  ...card,
                  deckName: deck.name,
                  deckId: deck.id,
                  folderName: folder.name,
                  folderId: folder.id
                });
              });
            }
          }
        }
      }

      return {
        success: true,
        cards: allReviewCards
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load cards for review'
      };
    }
  }
};

export { reviewService };

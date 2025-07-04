import api from './api';

const cardService = {
  /**
   * Create a new card in a deck
   */
  async createCard(deckId, cardData) {
    try {
      const response = await api.post(`/card/${deckId}`, cardData);
      return {
        success: true,
        card: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create card'
      };
    }
  },

  /**
   * Get a specific card
   */
  async getCard(cardId) {
    try {
      const response = await api.get(`/card/${cardId}`);
      return {
        success: true,
        card: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load card'
      };
    }
  },

  /**
   * Update a card
   */
  async updateCard(cardId, cardData) {
    try {
      const response = await api.patch(`/card/${cardId}`, cardData);
      return {
        success: true,
        card: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update card'
      };
    }
  },

  /**
   * Delete a card
   */
  async deleteCard(cardId) {
    try {
      await api.delete(`/card/${cardId}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete card'
      };
    }
  }
};

export { cardService };

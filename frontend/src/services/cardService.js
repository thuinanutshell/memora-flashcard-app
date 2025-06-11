import api from './api';

export const cardService = {
  // POST /card/:deckId - Create new card
  createCard: async (deckId, cardData) => {
    try {
      const response = await api.post(`/card/${deckId}`, cardData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(errorMessage);
    }
  },

  // GET /card/:cardId - Get single card
  getCard: async (cardId) => {
    try {
      const response = await api.get(`/card/${cardId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(errorMessage);
    }
  },

  // PATCH /card/:cardId - Update card
  updateCard: async (cardId, updates) => {
    try {
      const response = await api.patch(`/card/${cardId}`, updates);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(errorMessage);
    }
  },

  // DELETE /card/:cardId - Delete card
  deleteCard: async (cardId) => {
    try {
      const response = await api.delete(`/card/${cardId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(errorMessage);
    }
  }
};
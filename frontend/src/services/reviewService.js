import api from './api';

export const reviewService = {
  // POST /review/:cardId - Submit review for a card
  submitReview: async (cardId, reviewData) => {
    try {
      const response = await api.post(`/review/${cardId}`, reviewData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(errorMessage);
    }
  },

  // GET /review/dashboard - Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/review/dashboard');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(errorMessage);
    }
  },

  // GET /review/stats/general - Get general statistics
  getGeneralStats: async () => {
    try {
      const response = await api.get('/review/stats/general');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(errorMessage);
    }
  },

  // GET /review/stats/folder/:folderId - Get folder statistics
  getFolderStats: async (folderId) => {
    try {
      const response = await api.get(`/review/stats/folder/${folderId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(errorMessage);
    }
  },

  // GET /review/stats/deck/:deckId - Get deck statistics
  getDeckStats: async (deckId) => {
    try {
      const response = await api.get(`/review/stats/deck/${deckId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(errorMessage);
    }
  }
};
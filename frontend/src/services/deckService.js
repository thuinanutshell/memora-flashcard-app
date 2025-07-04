import api from './api';

const deckService = {
  /**
   * Get all decks for a specific folder
   */
  async getDecksInFolder(folderId) {
    try {
      const response = await api.get(`/folder/${folderId}`);
      return {
        success: true,
        folder: response.data.data,
        decks: response.data.data.decks || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load decks'
      };
    }
  },

  /**
   * Get a specific deck with its cards
   */
  async getDeck(deckId) {
    try {
      const response = await api.get(`/deck/${deckId}`);
      return {
        success: true,
        deck: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load deck'
      };
    }
  },

  /**
   * Create a new deck in a folder
   */
  async createDeck(folderId, deckData) {
    try {
      const response = await api.post(`/deck/${folderId}`, deckData);
      return {
        success: true,
        deck: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create deck'
      };
    }
  },

  /**
   * Update a deck
   */
  async updateDeck(deckId, deckData) {
    try {
      const response = await api.patch(`/deck/${deckId}`, deckData);
      return {
        success: true,
        deck: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update deck'
      };
    }
  },

  /**
   * Delete a deck
   */
  async deleteDeck(deckId) {
    try {
      await api.delete(`/deck/${deckId}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete deck'
      };
    }
  }
};

export { deckService };

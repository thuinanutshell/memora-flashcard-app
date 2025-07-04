import api, { createFormData } from './api';

const aiService = {
  /**
   * Generate flashcards from text content or PDF file
   * Uses the unified backend endpoint
   */
  async generateCards({ content, file, deckId, numCards, difficulty = 'medium' }) {
    try {
      let response;
      
      if (file) {
        // PDF upload - use FormData
        const formData = createFormData({
          deck_id: parseInt(deckId), // Convert to integer
          num_cards: parseInt(numCards),
          difficulty: difficulty
        }, file);
        
        response = await api.post('/ai/generate-cards', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 45000, // Longer timeout for AI generation
        });
      } else {
        // Text input - use JSON
        response = await api.post('/ai/generate-cards', {
          content: content,
          deck_id: parseInt(deckId), // Convert to integer
          num_cards: parseInt(numCards),
          difficulty: difficulty
        }, {
          timeout: 30000, // Timeout for text generation
        });
      }
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to generate cards'
      };
    }
  },

  /**
   * Accept and save generated cards to deck
   */
  async acceptCards(deckId, cards) {
    try {
      const response = await api.post('/ai/accept-cards', {
        deck_id: parseInt(deckId), // Convert to integer
        cards: cards
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to save cards'
      };
    }
  },

  /**
   * Get AI chat response for study insights
   */
  async getChatResponse(query, contextLevel = 'summary') {
    try {
      const response = await api.post('/ai/chat', {
        query: query,
        context_level: contextLevel
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get AI response'
      };
    }
  }
};

export { aiService };

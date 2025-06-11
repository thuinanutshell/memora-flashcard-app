import api from './api';

export const deckService = {
    // POST (create a new deck in a folder): /deck/folderId
    createDeck: async (folderId, deckData) => {
        try {
            const response = await api.post(`/deck/${folderId}`, deckData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    },

    // GET (get deck with all cards): /deck/deckId
    getDeck: async (deckId) => {
        try {
            const response = await api.get(`/deck/${deckId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    },

    // PATH (update a deck): /deck/deckId
    updateDeck: async (deckId, updates) => {
        try {
            const response = await api.patch(`/deck/${deckId}`, updates);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    },

    // DELETE (delete a deck): /deck/deckId
    deleteDeck: async (deckId) => {
        try {
            const response = await api.delete(`/deck/${deckId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    } 
};
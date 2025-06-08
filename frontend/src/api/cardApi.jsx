import { fetchWithAuth } from '../api/api';

const BASE_URL = "http://127.0.0.1:5001/card";

// Create a new card in a specific deck
export const createCard = async (token, deckId, cardData) => {
    const response = await fetchWithAuth(`${BASE_URL}/${deckId}`, {
        method: 'POST',
        body: JSON.stringify(cardData)
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create card');
    }
    
    return await response.json();
};

// Retrieve the question, answer, and difficulty level of one card
export const getOneCard = async (token, cardId) => {
    const response = await fetchWithAuth(`${BASE_URL}/${cardId}`, {
        method: 'GET'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch card');
    }
    
    return await response.json();
};

// Update the question, answer or difficulty level of one card
export const updateCard = async (token, cardId, updateData) => {
    const response = await fetchWithAuth(`${BASE_URL}/${cardId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update card');
    }
    
    return await response.json();
};

// Delete a specific card
export const deleteCard = async (token, cardId) => {
    const response = await fetchWithAuth(`${BASE_URL}/${cardId}`, {
        method: 'DELETE'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete card');
    }
    
    return await response.json();
};
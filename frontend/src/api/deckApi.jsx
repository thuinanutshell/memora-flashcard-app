import { fetchWithAuth } from '../api/api';

const BASE_URL = "http://127.0.0.1:5001/deck";

// Create a deck in a specific folder
export const createDeck = async (token, folderId, deckData) => {
    const response = await fetchWithAuth(`${BASE_URL}/${folderId}`, {
        method: 'POST',
        body: JSON.stringify(deckData)
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create deck');
    }
    
    return await response.json();
};

// Get all decks
export const getDecks = async (token) => {
    const response = await fetchWithAuth(`${BASE_URL}`, {
        method: 'GET'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch decks');
    }
    
    return await response.json();
};

// Get a single deck by ID
export const getOneDeckWithCards = async (token, deckId) => {
    const response = await fetchWithAuth(`${BASE_URL}/${deckId}`, {
        method: 'GET'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch deck');
    }
    
    return await response.json();
};

// Update a deck
export const updateDeck = async (token, deckId, deckData) => {
    const response = await fetchWithAuth(`${BASE_URL}/${deckId}`, {
        method: 'PATCH',
        body: JSON.stringify(deckData)
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update deck');
    }
    
    return await response.json();
};

// Delete a deck
export const deleteDeck = async (token, deckId) => {
    const response = await fetchWithAuth(`${BASE_URL}/${deckId}`, {
        method: 'DELETE'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete deck');
    }
    
    return await response.json();
};
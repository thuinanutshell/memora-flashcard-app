import { fetchWithAuth } from '../api/http';

const BASE_URL = "http://127.0.0.1:5001/deck";

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

export const getAllDecks = async (token, folderId) => {
    const response = await fetchWithAuth(`${BASE_URL}/folder/${folderId}`, {
        method: 'GET'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch decks');
    }
    
    return await response.json();
};

export const getOneDeck = async (token, deckId) => {
    const response = await fetchWithAuth(`${BASE_URL}/${deckId}`, {
        method: 'GET'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch deck');
    }
    
    return await response.json();
};

export const updateDeck = async (token, deckId, updateData) => {
    const response = await fetchWithAuth(`${BASE_URL}/${deckId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update deck');
    }
    
    return await response.json();
};

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
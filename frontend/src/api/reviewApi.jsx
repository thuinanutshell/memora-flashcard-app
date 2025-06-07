import { fetchWithAuth } from '../api/http';

const BASE_URL = "http://127.0.0.1:5001/review";

export const createReview = async (token, cardId, reviewData) => {
    const response = await fetchWithAuth(`${BASE_URL}/${cardId}`, {
        method: 'POST',
        body: JSON.stringify(reviewData)
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create review');
    }
    
    return await response.json();
};

export const getDashboardStats = async (token) => {
    const response = await fetchWithAuth(`${BASE_URL}/dashboard`, {
        method: 'GET'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch dashboard stats');
    }
    
    return await response.json();
};

export const getGeneralStats = async (token) => {
    const response = await fetchWithAuth(`${BASE_URL}/stats/general`, {
        method: 'GET'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch general stats');
    }
    
    return await response.json();
};

export const getFolderStats = async (token, folderId) => {
    const response = await fetchWithAuth(`${BASE_URL}/stats/folder/${folderId}`, {
        method: 'GET'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch folder stats');
    }
    
    return await response.json();
};

export const getDeckStats = async (token, deckId) => {
    const response = await fetchWithAuth(`${BASE_URL}/stats/deck/${deckId}`, {
        method: 'GET'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch deck stats');
    }
    
    return await response.json();
};
import { fetchWithAuth } from '../api/api';

const BASE_URL = "http://127.0.0.1:5001/review";

// Create a review for a specific card
export async function createReview(token, cardId, payload) {
  const response = await fetchWithAuth(`${BASE_URL}/${cardId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }, token);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || 'Failed to create review');
  }

  return response.json();
}


// Retrieve the dashboard stats (number of cards due)
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

// Retrieve the general stats across folders
export const getGeneralStats = async (token) => {
    const response = await fetchWithAuth(`${BASE_URL}/stats/general`, {
        method: 'GET'
    }, token);
    
    if (!response.ok) {
        const error = await response.json();
        throw new new Error(error.error || 'Failed to fetch general stats');
    }
    
    return await response.json();
};

// Retrieve stats for a specific folder (accuracy score by deck)
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

// Retrieve stats for a specific deck (accuracy graph and study streak)
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
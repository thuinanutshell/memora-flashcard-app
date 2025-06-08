import { fetchWithAuth } from '../api/api';

const BASE_URL = "http://127.0.0.1:5001/folder";

// Create a new folder for a specific user
export const createFolder = async (token, folderData) => {
    const response = await fetchWithAuth(`${BASE_URL}/`, {
        method: 'POST',
        body: JSON.stringify(folderData)
    }, token);
    const data = await response.json();
    
    // Log the response to understand the format
    console.log('Create folder API response:', data);
    
    // Return the consistent format - extract folder if nested
    return data.folder || data;
};

// Retrieve all folders for a specific user
export const getAllFolders = async (token) => {
    const response = await fetchWithAuth(`${BASE_URL}/`, {
        method: 'GET'
    }, token);
    const data = await response.json();
    
    // Log the response to understand the format
    console.log('Get all folders API response:', data);
    
    // Extract the folders array from the response
    return data.folders || data || [];
};

// Retrieve all decks for a specific folder
export const getOneFolderWithDecks = async (token, folderId) => {
    const response = await fetchWithAuth(`${BASE_URL}/${folderId}`, {
        method: 'GET'
    }, token);
    const data = await response.json();
    console.log('Get one folder API response:', data);
    return data;
};

// Update the name or description of a folder
export const updateFolder = async (token, folderId, updateData) => {
    const response = await fetchWithAuth(`${BASE_URL}/${folderId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
    }, token);
    const data = await response.json();
    console.log('Update folder API response:', data);
    return data;
};

// Delete a specific folder
export const deleteFolder = async (token, folderId) => {
    const response = await fetchWithAuth(`${BASE_URL}/${folderId}`, {
        method: 'DELETE'
    }, token);
    const data = await response.json();
    console.log('Delete folder API response:', data);
    return data;
};
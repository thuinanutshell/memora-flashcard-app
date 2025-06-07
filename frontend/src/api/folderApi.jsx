import { fetchWithAuth } from '../api/api';

const BASE_URL = "http://127.0.0.1:5001/folder";

export const createFolder = async (token, folderData) => {
    const response = await fetchWithAuth(`${BASE_URL}/`, {
        method: 'POST',
        body: JSON.stringify(folderData)
    }, token);
    return await response.json();
};

export const getAllFolders = async (token) => {
    const response = await fetchWithAuth(`${BASE_URL}/`, {
        method: 'GET'
    }, token);
    return await response.json();
};

export const getOneFolder = async (token, folderId) => {
    const response = await fetchWithAuth(`${BASE_URL}/${folderId}`, {
        method: 'GET'
    }, token);
    return await response.json();
};

export const updateFolder = async (token, folderId, updateData) => {
    const response = await fetchWithAuth(`${BASE_URL}/${folderId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
    }, token);
    return await response.json();
};

export const deleteFolder = async (token, folderId) => {
    const response = await fetchWithAuth(`${BASE_URL}/${folderId}`, {
        method: 'DELETE'
    }, token);
    return await response.json();
};
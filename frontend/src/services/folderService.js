import api from './api';

export const folderService = {
    // GET (retrieve all folders): /folder/
    getFolders: async () => {
        try {
            const response = await api.get('/folder/');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    },

    // POST (create a new folder): /folder/
    createFolder: async (folderData) => {
        try {
            const response = await api.post('/folder/', folderData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    },

    // GET (retrieve a single folder): /folder/folderId
    getFolder: async (folderId) => {
        try {
            const response = await api.get(`/folder/${folderId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    },

    // PATCH (update a folder): /folder/folderId
    updateFolder: async (folderId, updates) => {
        try {
            const response = await api.patch(`/folder/${folderId}`, updates);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    },

    // DELETE (delete a folder): /folder/folderId
    deleteFolder: async (folderId) => {
        try {
            const response = await api.delete(`/folder/${folderId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(errorMessage);
        }
    }
};
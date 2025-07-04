import api from './api';

const folderService = {
  /**
   * Get all folders for the current user
   */
  async getAllFolders() {
    try {
      const response = await api.get('/folder/');  // Added trailing slash
      return {
        success: true,
        folders: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load folders'
      };
    }
  },

  /**
   * Get a specific folder with its decks
   */
  async getFolder(folderId) {
    try {
      const response = await api.get(`/folder/${folderId}`);
      return {
        success: true,
        folder: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load folder'
      };
    }
  },

  /**
   * Create a new folder
   */
  async createFolder(folderData) {
    try {
      const response = await api.post('/folder/', folderData);  // Added trailing slash
      return {
        success: true,
        folder: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create folder'
      };
    }
  },

  /**
   * Update a folder
   */
  async updateFolder(folderId, folderData) {
    try {
      const response = await api.patch(`/folder/${folderId}`, folderData);
      return {
        success: true,
        folder: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update folder'
      };
    }
  },

  /**
   * Delete a folder
   */
  async deleteFolder(folderId) {
    try {
      await api.delete(`/folder/${folderId}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete folder'
      };
    }
  }
};

export { folderService };

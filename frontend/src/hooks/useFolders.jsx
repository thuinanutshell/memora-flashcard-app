// src/hooks/useFolders.js
import { useCallback, useState } from 'react';
import { folderService } from '../services/folderService';
import useApi from './useApi';

const useFolders = () => {
  const { loading, error, executeRequest, clearError } = useApi();
  const [folders, setFolders] = useState([]);

  const fetchFolders = useCallback(async () => {
    const result = await executeRequest(folderService.getFolders);
    setFolders(result);
    return result;
  }, [executeRequest]);

  const createFolder = useCallback(async (folderData) => {
    const result = await executeRequest(folderService.createFolder, folderData);
    if (result.success) {
      setFolders(prev => [...prev, result.data.folder]);
    }
    return result;
  }, [executeRequest]);

  const updateFolder = useCallback(async (folderId, updates) => {
    const result = await executeRequest(folderService.updateFolder, folderId, updates);
    if (result.success) {
      setFolders(prev => 
        prev.map(folder => 
          folder.id === folderId ? { ...folder, ...result.data.folder } : folder
        )
      );
    }
    return result;
  }, [executeRequest]);

  const deleteFolder = useCallback(async (folderId) => {
    const result = await executeRequest(folderService.deleteFolder, folderId);
    if (result.success) {
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
    }
    return result;
  }, [executeRequest]);

  const getFolder = useCallback(async (folderId) => {
    const result = await executeRequest(folderService.getFolder, folderId);
    return result;
  }, [executeRequest]);

  return {
    folders,
    setFolders,
    loading,
    error,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolder,
    clearError
  };
};

export default useFolders;
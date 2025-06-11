// src/hooks/useReview.js
import { useCallback, useState } from 'react';
import { reviewService } from '../services/reviewService';
import useApi from './useApi';

const useReview = () => {
  const { loading, error, executeRequest, clearError } = useApi();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [generalStats, setGeneralStats] = useState(null);
  const [folderStats, setFolderStats] = useState(null);
  const [deckStats, setDeckStats] = useState(null);

  const submitReview = useCallback(async (cardId, reviewData) => {
    const result = await executeRequest(reviewService.submitReview, cardId, reviewData);
    return result;
  }, [executeRequest]);

  const getDashboardStats = useCallback(async () => {
    const result = await executeRequest(reviewService.getDashboardStats);
    if (result.success) {
      setDashboardStats(result.data);
    }
    return result;
  }, [executeRequest]);

  const getGeneralStats = useCallback(async () => {
    const result = await executeRequest(reviewService.getGeneralStats);
    if (result.success) {
      setGeneralStats(result.data);
    }
    return result;
  }, [executeRequest]);

  const getFolderStats = useCallback(async (folderId) => {
    const result = await executeRequest(reviewService.getFolderStats, folderId);
    if (result.success) {
      setFolderStats(result.data);
    }
    return result;
  }, [executeRequest]);

  const getDeckStats = useCallback(async (deckId) => {
    const result = await executeRequest(reviewService.getDeckStats, deckId);
    if (result.success) {
      setDeckStats(result.data);
    }
    return result;
  }, [executeRequest]);

  return {
    dashboardStats,
    generalStats,
    folderStats,
    deckStats,
    loading,
    error,
    submitReview,
    getDashboardStats,
    getGeneralStats,
    getFolderStats,
    getDeckStats,
    clearError
  };
};

export default useReview;
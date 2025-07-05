import { useCallback, useState } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useAnalytics = () => {
  const [generalStats, setGeneralStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadGeneralStats = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await analyticsService.getGeneralStats();
      if (result.success) {
        setGeneralStats(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load general statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(() => {
    loadGeneralStats();
  }, [loadGeneralStats]);

  return {
    generalStats,
    loading,
    error,
    loadGeneralStats,
    refreshStats,
    hasStats: !!generalStats
  };
};

export const useFolderAnalytics = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFolders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await analyticsService.getFoldersForAnalytics();
      if (result.success) {
        setFolders(result.folders);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load folders');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFolderAnalytics = useCallback(async (folderId) => {
    if (!folderId) {
      setAnalytics(null);
      setSelectedFolder(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await analyticsService.getFolderAnalytics(folderId);
      if (result.success) {
        setAnalytics(result.data);
        setSelectedFolder(folders.find(f => f.id.toString() === folderId.toString()));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load folder analytics');
    } finally {
      setLoading(false);
    }
  }, [folders]);

  const clearSelection = useCallback(() => {
    setSelectedFolder(null);
    setAnalytics(null);
    setError('');
  }, []);

  return {
    folders,
    selectedFolder,
    analytics,
    loading,
    error,
    loadFolders,
    loadFolderAnalytics,
    clearSelection,
    hasAnalytics: !!analytics
  };
};

export const useDeckAnalytics = () => {
  const [deckAnalytics, setDeckAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDeckAnalytics = useCallback(async (deckId) => {
    if (!deckId) {
      setDeckAnalytics(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await analyticsService.getDeckAnalytics(deckId);
      if (result.success) {
        setDeckAnalytics(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load deck analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDeckAnalytics = useCallback(() => {
    setDeckAnalytics(null);
    setError('');
  }, []);

  return {
    deckAnalytics,
    loading,
    error,
    loadDeckAnalytics,
    clearDeckAnalytics,
    hasAnalytics: !!deckAnalytics
  };
};
import { useCallback, useState } from 'react';
import { reviewService } from '../services/reviewService';

export const useReview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    scores: [],
    startTime: null,
    endTime: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startSession = useCallback(() => {
    setCurrentIndex(0);
    setSessionStats({
      correct: 0,
      incorrect: 0,
      total: 0,
      scores: [],
      startTime: new Date(),
      endTime: null
    });
    setError('');
  }, []);

  const submitCardReview = useCallback(async (cardId, userAnswer) => {
    setLoading(true);
    setError('');

    try {
      const result = await reviewService.submitReview(cardId, userAnswer);
      if (result.success) {
        const score = result.data.score;
        const isCorrect = score >= 70;

        setSessionStats(prev => ({
          ...prev,
          correct: prev.correct + (isCorrect ? 1 : 0),
          incorrect: prev.incorrect + (isCorrect ? 0 : 1),
          total: prev.total + 1,
          scores: [...prev.scores, score]
        }));

        return {
          success: true,
          score,
          isCorrect,
          nextReviewAt: result.data.next_review_at
        };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Failed to submit review';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const moveToNextCard = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
  }, []);

  const endSession = useCallback(() => {
    setSessionStats(prev => ({
      ...prev,
      endTime: new Date()
    }));
  }, []);

  const resetSession = useCallback(() => {
    startSession();
  }, [startSession]);

  const getSessionDuration = useCallback(() => {
    if (!sessionStats.startTime) return 0;
    const endTime = sessionStats.endTime || new Date();
    return Math.floor((endTime - sessionStats.startTime) / 1000); // in seconds
  }, [sessionStats]);

  const getAverageScore = useCallback(() => {
    if (sessionStats.scores.length === 0) return 0;
    return sessionStats.scores.reduce((sum, score) => sum + score, 0) / sessionStats.scores.length;
  }, [sessionStats.scores]);

  const getAccuracyPercentage = useCallback(() => {
    if (sessionStats.total === 0) return 0;
    return (sessionStats.correct / sessionStats.total) * 100;
  }, [sessionStats]);

  return {
    // State
    currentIndex,
    sessionStats,
    loading,
    error,

    // Actions
    startSession,
    submitCardReview,
    moveToNextCard,
    endSession,
    resetSession,
    setError,

    // Computed values
    getSessionDuration,
    getAverageScore,
    getAccuracyPercentage,

    // Utilities
    isSessionActive: sessionStats.startTime && !sessionStats.endTime,
    hasStarted: !!sessionStats.startTime
  };
};

// Hook for managing review queue
export const useReviewQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await reviewService.getAllCardsForReview();
      if (result.success) {
        setQueue(result.cards);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDeckQueue = useCallback(async (deckId) => {
    setLoading(true);
    setError('');

    try {
      const result = await reviewService.getCardsForReview(deckId);
      if (result.success) {
        setQueue(result.cards);
        return { success: true, deckName: result.deckName };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Failed to load deck review queue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCardFromQueue = useCallback((cardId) => {
    setQueue(prev => prev.filter(card => card.id !== cardId));
  }, []);

  const refreshQueue = useCallback(() => {
    loadQueue();
  }, [loadQueue]);

  return {
    queue,
    loading,
    error,
    loadQueue,
    loadDeckQueue,
    removeCardFromQueue,
    refreshQueue,
    queueLength: queue.length,
    isEmpty: queue.length === 0
  };
};

// Hook for card review history
export const useReviewHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async (cardId, limit = 10) => {
    setLoading(true);
    setError('');

    try {
      const result = await reviewService.getCardReviewHistory(cardId, limit);
      if (result.success) {
        setHistory(result.data.reviews || []);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load review history');
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistoryStats = useCallback(() => {
    if (history.length === 0) return null;

    const scores = history.map(h => h.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const latestScore = scores[0]; // Most recent is first
    const improvement = history.length > 1 ? latestScore - scores[scores.length - 1] : 0;

    return {
      average: averageScore,
      best: bestScore,
      latest: latestScore,
      improvement,
      totalReviews: history.length
    };
  }, [history]);

  return {
    history,
    loading,
    error,
    loadHistory,
    getHistoryStats,
    hasHistory: history.length > 0
  };
};
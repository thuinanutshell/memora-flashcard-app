import api from './api';

// Mock data generator for demo/fallback mode
const generateMockData = () => {
  const now = new Date();
  const mockFolders = [
    { id: 1, name: 'Mathematics', description: 'Math concepts and formulas' },
    { id: 2, name: 'History', description: 'World history and events' },
    { id: 3, name: 'Science', description: 'Physics, chemistry, biology' },
    { id: 4, name: 'Languages', description: 'Spanish and French vocabulary' }
  ];

  const mockDecks = {
    1: [
      { id: 1, name: 'Algebra Basics', folder_id: 1 },
      { id: 2, name: 'Geometry', folder_id: 1 },
      { id: 3, name: 'Calculus', folder_id: 1 }
    ],
    2: [
      { id: 4, name: 'Ancient Rome', folder_id: 2 },
      { id: 5, name: 'World War II', folder_id: 2 }
    ],
    3: [
      { id: 6, name: 'Physics Laws', folder_id: 3 },
      { id: 7, name: 'Chemistry Elements', folder_id: 3 }
    ],
    4: [
      { id: 8, name: 'Spanish Verbs', folder_id: 4 },
      { id: 9, name: 'French Vocabulary', folder_id: 4 }
    ]
  };

  // Generate accuracy trends over the last 30 days
  const generateAccuracyTrend = (deckName) => {
    const data = [];
    const baseAccuracy = Math.random() * 20 + 70; // Start between 70-90%
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 10;
      const trend = i < 15 ? 2 : -1; // Improve over time, then plateau
      const accuracy = Math.max(50, Math.min(100, baseAccuracy + variation + (29 - i) * trend * 0.5));
      
      data.push({
        date: date.toISOString().split('T')[0],
        accuracy: Math.round(accuracy * 10) / 10,
        deckName
      });
    }
    return data;
  };

  return { mockFolders, mockDecks, generateAccuracyTrend };
};

const analyticsService = {
  /**
   * Get general user statistics
   */
  async getGeneralStats(useMockData = false) {
    try {
      if (useMockData) {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          success: true,
          data: {
            id: 'user-123',
            total_folders: 4,
            total_decks: 9,
            total_reviews: 156,
            streak: 7
          },
          isMockData: true
        };
      }

      // Try real API first
      const response = await api.get('/analytics/general');
      return {
        success: true,
        data: response.data.data,
        isMockData: false
      };
    } catch (error) {
      // If real API fails and we haven't tried mock data yet, return empty state
      if (!useMockData) {
        return {
          success: true,
          data: null, // No data available
          isMockData: false,
          isEmpty: true
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load general statistics'
      };
    }
  },

  /**
   * Get all folders for analytics selection
   */
  async getFoldersForAnalytics(useMockData = false) {
    try {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const { mockFolders } = generateMockData();
        return {
          success: true,
          folders: mockFolders,
          isMockData: true
        };
      }

      // Try real API first
      const response = await api.get('/folder/');
      return {
        success: true,
        folders: response.data.data || [],
        isMockData: false
      };
    } catch (error) {
      if (!useMockData) {
        return {
          success: true,
          folders: [],
          isMockData: false,
          isEmpty: true
        };
      }
      
      return {
        success: false,
        error: 'Failed to load folders'
      };
    }
  },

  /**
   * Get accuracy trends for all decks in a folder
   */
  async getFolderAnalytics(folderId, useMockData = false) {
    try {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 700));
        const { mockFolders, mockDecks, generateAccuracyTrend } = generateMockData();
        
        const folder = mockFolders.find(f => f.id === parseInt(folderId));
        if (!folder) {
          return { success: false, error: 'Folder not found' };
        }

        const decks = mockDecks[folderId] || [];
        const accuracyGraph = {};
        
        // Generate accuracy trends for each deck
        decks.forEach(deck => {
          accuracyGraph[deck.name] = generateAccuracyTrend(deck.name);
        });

        const totalCards = decks.length * Math.floor(Math.random() * 20 + 10);
        const reviewedCards = Math.floor(totalCards * (Math.random() * 0.3 + 0.6));
        
        return {
          success: true,
          data: {
            folder_name: folder.name,
            accuracy_graph: accuracyGraph,
            full_reviewed_cards: reviewedCards,
            remaining_cards: totalCards - reviewedCards,
            total_cards: totalCards
          },
          isMockData: true
        };
      }

      // Try real API first
      const response = await api.get(`/analytics/folder/${folderId}`);
      return {
        success: true,
        data: response.data.data,
        isMockData: false
      };
    } catch (error) {
      if (!useMockData) {
        return {
          success: true,
          data: null,
          isMockData: false,
          isEmpty: true
        };
      }
      
      return {
        success: false,
        error: 'Failed to load folder analytics'
      };
    }
  },

  /**
   * Get analytics for a specific deck
   */
  async getDeckAnalytics(deckId, useMockData = false) {
    try {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const { mockDecks, generateAccuracyTrend } = generateMockData();
        
        // Find the deck
        let deck = null;
        for (const folderDecks of Object.values(mockDecks)) {
          deck = folderDecks.find(d => d.id === parseInt(deckId));
          if (deck) break;
        }
        
        if (!deck) {
          return { success: false, error: 'Deck not found' };
        }

        const accuracyGraph = generateAccuracyTrend(deck.name);
        const scores = accuracyGraph.map(point => point.accuracy);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        const totalCards = Math.floor(Math.random() * 25 + 15);
        const reviewedCards = Math.floor(totalCards * (Math.random() * 0.4 + 0.5));

        return {
          success: true,
          data: {
            deck_name: deck.name,
            accuracy_graph: accuracyGraph.map(point => ({
              timestamp: point.date,
              score: point.accuracy
            })),
            average_score: Math.round(averageScore * 10) / 10,
            full_reviewed_cards: reviewedCards,
            remaining_cards: totalCards - reviewedCards
          },
          isMockData: true
        };
      }

      // Try real API first
      const response = await api.get(`/analytics/deck/${deckId}`);
      return {
        success: true,
        data: response.data.data,
        isMockData: false
      };
    } catch (error) {
      if (!useMockData) {
        return {
          success: true,
          data: null,
          isMockData: false,
          isEmpty: true
        };
      }
      
      return {
        success: false,
        error: 'Failed to load deck analytics'
      };
    }
  },

  /**
   * Get progress overview
   */
  async getProgressOverview(timeframe = 'month', useMockData = false) {
    try {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 400));
        return {
          success: true,
          data: {
            timeframe,
            current_streak: 7,
            total_reviews: timeframe === 'week' ? 23 : timeframe === 'month' ? 156 : 892,
            content_summary: {
              total_folders: 4,
              total_decks: 9
            }
          },
          isMockData: true
        };
      }

      // Try real API first
      const response = await api.get(`/analytics/progress?timeframe=${timeframe}`);
      return {
        success: true,
        data: response.data.data,
        isMockData: false
      };
    } catch (error) {
      if (!useMockData) {
        return {
          success: true,
          data: null,
          isMockData: false,
          isEmpty: true
        };
      }
      
      return {
        success: false,
        error: 'Failed to load progress overview'
      };
    }
  }
};

export { analyticsService };

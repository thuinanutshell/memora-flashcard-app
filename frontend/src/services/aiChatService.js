import api from './api';

// Mock user context data for demo/testing
const mockUserContext = {
  user_stats: {
    total_folders: 4,
    total_decks: 9,
    total_cards: 87,
    total_reviews: 156,
    study_streak: 7,
    average_accuracy: 78.5
  },
  recent_performance: {
    last_7_days_reviews: 23,
    recent_accuracy: 82.1,
    struggling_topics: ['Ancient Rome', 'Geometry', 'Chemistry Elements'],
    strong_topics: ['Algebra Basics', 'Physics Laws', 'Spanish Verbs']
  },
  folder_performance: {
    'Mathematics': { completion: 85, avg_score: 88.2, cards_due: 3 },
    'History': { completion: 60, avg_score: 72.5, cards_due: 8 },
    'Science': { completion: 75, avg_score: 81.0, cards_due: 2 },
    'Languages': { completion: 90, avg_score: 85.7, cards_due: 1 }
  },
  upcoming_reviews: 14,
  mastered_cards: 38,
  learning_cards: 49
};

// Mock AI responses for Full Mock Mode
const mockResponses = {
  greeting: [
    "Hello! I'm your AI study assistant. How can I help you with your learning today?",
    "Hi there! Ready to boost your learning? What would you like to know about your study progress?",
    "Welcome! I'm here to help you learn more effectively. What can I assist you with?"
  ],
  
  progress: [
    "Based on your recent activity, you're doing great! You've maintained a 7-day study streak and have an average accuracy of 78% across all your decks. Your strongest area appears to be Mathematics, while History might need a bit more attention.",
    "Your learning progress is solid! You've mastered 45% of your total cards and have been consistently reviewing. I notice you tend to score higher in the mornings - have you considered scheduling your most challenging topics then?",
    "Looking at your stats, you're on track with your studies. You've completed 156 reviews with good accuracy. Consider focusing on your Language decks this week as they have the most cards due for review."
  ],

  study_tips: [
    "Here are some personalized study tips for you:\n\n• Try the Pomodoro Technique - study for 25 minutes, then take a 5-minute break\n• Review your most difficult cards right before bed to improve retention\n• Create connections between new concepts and things you already know\n• Use the 'teach it to explain it' method - try explaining concepts out loud",
    "Based on your learning patterns, I'd suggest:\n\n• Spacing out your reviews more evenly throughout the day\n• Focusing on your weaker topics (like History) for 15 minutes daily\n• Using active recall instead of just re-reading\n• Setting specific, small goals like 'master 5 cards today'",
    "Some effective strategies for your study style:\n\n• Try studying your hardest subjects when you're most alert\n• Use visual aids and diagrams for complex concepts\n• Practice retrieval by closing your notes and testing yourself\n• Connect new information to real-world examples"
  ],

  motivation: [
    "You're doing amazing! Remember, every expert was once a beginner. Your consistency in studying shows real dedication. Keep up the great work! 🌟",
    "Learning is a journey, not a destination. You've already made significant progress - 156 reviews completed! Every card you master builds your knowledge foundation stronger. Keep going! 💪",
    "I can see you're putting in real effort with your studies. That 7-day streak proves your commitment! Remember, small consistent efforts lead to big results. You've got this! 🚀"
  ],

  specific_subject: [
    "For Mathematics, I notice you're doing well with Algebra but struggling a bit with Geometry. Try visualizing geometric concepts and drawing diagrams. Practice with real-world examples like calculating areas of rooms or angles in architecture.",
    "Your History performance could improve with some storytelling techniques. Try connecting historical events to create narratives. Use timeline visualizations and relate events to things happening in your own life or current events.",
    "In Science, you're excelling at Physics but Chemistry needs attention. For Chemistry, focus on understanding patterns in the periodic table and practice balancing equations step by step. Visual models can really help!"
  ],

  default: [
    "That's an interesting question! While I can provide general study guidance, I'm best at helping with your learning progress, study strategies, and motivation. What specific aspect of your studies would you like to discuss?",
    "I'd love to help you with that! I specialize in analyzing your study patterns and providing personalized learning advice. Is there something specific about your flashcard progress or study habits you'd like to explore?",
    "Great question! I'm designed to help optimize your learning experience. I can analyze your study data, suggest improvements, and provide motivation. What area of your studies interests you most right now?"
  ]
};

// Mock conversation history
const mockConversations = [
  {
    id: 1,
    query: "How am I doing with my studies?",
    response: "Based on your recent activity, you're doing great! You've maintained a 7-day study streak...",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    query: "What are some good study techniques?",
    response: "Here are some personalized study tips for you: Try the Pomodoro Technique...",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    query: "I'm feeling unmotivated",
    response: "You're doing amazing! Remember, every expert was once a beginner...",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const aiChatService = {
  /**
   * Send a chat message and get AI response
   * @param {string} query - User's message
   * @param {string} contextLevel - 'summary' or 'detailed'
   * @param {string} mode - 'real', 'demo', or 'mock'
   */
  async sendMessage(query, contextLevel = 'summary', mode = 'real') {
    try {
      if (mode === 'mock') {
        // Full Mock Mode - Use predefined responses
        return await this._getMockResponse(query, contextLevel);
      }

      if (mode === 'demo') {
        // Demo Mode - Real API with mock context
        return await this._getDemoResponse(query, contextLevel);
      }

      // Real Mode - Actual API call
      const response = await api.post('/ai/chat', { 
        query, 
        context_level: contextLevel 
      });
      
      return {
        success: true,
        data: response.data.data,
        mode: 'real'
      };
    } catch (error) {
      // If real API fails, provide helpful error
      if (mode === 'real') {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get AI response',
          mode: 'real'
        };
      }
      
      // Fallback for demo/mock modes
      return await this._getMockResponse(query, contextLevel);
    }
  },

  /**
   * Demo Mode - Real Gemini API with mock context
   */
  async _getDemoResponse(query, contextLevel) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    try {
      // This would call your backend with mock context
      const response = await api.post('/ai/chat', {
        query,
        context_level: contextLevel,
        demo_mode: true,
        mock_context: mockUserContext
      });

      return {
        success: true,
        data: {
          ...response.data.data,
          context_used: 'mock'
        },
        mode: 'demo'
      };
    } catch (error) {
      // If backend/Gemini fails, use mock response as fallback
      console.warn('Demo mode failed, falling back to mock:', error);
      return await this._getMockResponse(query, contextLevel);
    }
  },

  /**
   * Full Mock Mode - Predefined responses
   */
  async _getMockResponse(query, contextLevel) {
    // Simulate realistic API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    
    // Determine response type based on query content
    const queryLower = query.toLowerCase();
    let responseType = 'default';
    
    if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
      responseType = 'greeting';
    } else if (queryLower.includes('progress') || queryLower.includes('doing') || queryLower.includes('performance')) {
      responseType = 'progress';
    } else if (queryLower.includes('tip') || queryLower.includes('study') || queryLower.includes('learn') || queryLower.includes('technique')) {
      responseType = 'study_tips';
    } else if (queryLower.includes('motivat') || queryLower.includes('encourage') || queryLower.includes('struggling')) {
      responseType = 'motivation';
    } else if (queryLower.includes('math') || queryLower.includes('history') || queryLower.includes('science')) {
      responseType = 'specific_subject';
    }
    
    // Get random response from the appropriate category
    const responses = mockResponses[responseType];
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Create mock conversation entry
    const conversationId = Date.now();
    
    return {
      success: true,
      data: {
        query: query,
        response: response,
        conversation_id: conversationId,
        context_level: contextLevel,
        context_used: 'mock'
      },
      mode: 'mock'
    };
  },

  /**
   * Get conversation history
   */
  async getConversationHistory(limit = 10, offset = 0, mode = 'real') {
    try {
      if (mode === 'mock' || mode === 'demo') {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Simulate pagination
        const startIndex = offset;
        const endIndex = Math.min(startIndex + limit, mockConversations.length);
        const conversations = mockConversations.slice(startIndex, endIndex);
        
        return {
          success: true,
          data: {
            conversations: conversations,
            pagination: {
              total: mockConversations.length,
              limit: limit,
              offset: offset,
              has_more: endIndex < mockConversations.length
            }
          },
          mode: mode
        };
      }

      // Real API call
      const response = await api.get(`/ai/conversations?limit=${limit}&offset=${offset}`);
      return {
        success: true,
        data: response.data.data,
        mode: 'real'
      };
    } catch (error) {
      if (mode === 'real') {
        return {
          success: false,
          error: 'Failed to load conversation history',
          mode: 'real'
        };
      }
      
      // Fallback to mock for demo mode
      return await this.getConversationHistory(limit, offset, 'mock');
    }
  },

  /**
   * Get a specific conversation detail
   */
  async getConversationDetail(conversationId, mode = 'real') {
    try {
      if (mode === 'mock' || mode === 'demo') {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const conversation = mockConversations.find(c => c.id === parseInt(conversationId));
        
        if (!conversation) {
          return {
            success: false,
            error: 'Conversation not found',
            mode: mode
          };
        }
        
        return {
          success: true,
          data: {
            id: conversation.id,
            user_query: conversation.query,
            ai_response: conversation.response,
            created_at: conversation.created_at,
            updated_at: conversation.created_at
          },
          mode: mode
        };
      }

      // Real API call
      const response = await api.get(`/ai/conversation/${conversationId}`);
      return {
        success: true,
        data: response.data.data,
        mode: 'real'
      };
    } catch (error) {
      if (mode === 'real') {
        return {
          success: false,
          error: 'Failed to load conversation details',
          mode: 'real'
        };
      }
      
      // Fallback to mock
      return await this.getConversationDetail(conversationId, 'mock');
    }
  },

  /**
   * Get study suggestions
   */
  async getStudySuggestions(type = 'quick', mode = 'real') {
    try {
      if (mode === 'mock' || mode === 'demo') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const suggestions = {
          type: type,
          recommendations: [
            "Review your History cards - you have 8 cards due for review",
            "Focus on Geometry concepts - your recent scores suggest this needs attention",
            "Great job on maintaining your 7-day streak! Keep it up",
            "Try studying your Spanish verbs in the morning when you're most alert"
          ],
          focus_areas: [
            { topic: "Ancient Rome", completion_rate: 60 },
            { topic: "Geometry", completion_rate: 45 },
            { topic: "Chemistry Elements", completion_rate: 70 }
          ],
          recent_struggles: [
            { question: "What year was the fall of Rome?", score: 45 },
            { question: "Calculate the area of a triangle", score: 52 },
            { question: "What is the atomic number of Carbon?", score: 38 }
          ]
        };
        
        if (type === 'detailed') {
          suggestions.study_plan = {
            immediate_focus: ["Ancient Rome", "Geometry"],
            mastered_areas: ["Algebra Basics", "Physics Laws", "Spanish Verbs"],
            improvement_areas: ["Chemistry Elements", "World War II", "French Vocabulary"]
          };
          suggestions.metrics = {
            total_reviews: 156,
            average_score: 78.5,
            study_streak: 7,
            weekly_goal_progress: 85
          };
        }
        
        return {
          success: true,
          data: suggestions,
          mode: mode
        };
      }

      // Real API call
      const response = await api.get(`/ai/suggestions?type=${type}`);
      return {
        success: true,
        data: response.data.data,
        mode: 'real'
      };
    } catch (error) {
      if (mode === 'real') {
        return {
          success: false,
          error: 'Failed to generate study suggestions',
          mode: 'real'
        };
      }
      
      // Fallback to mock
      return await this.getStudySuggestions(type, 'mock');
    }
  },

  /**
   * Get available chat modes and their status
   */
  async getChatModeStatus() {
    try {
      // Check if real API is available
      const healthCheck = await api.get('/health');
      const geminiAvailable = healthCheck.data?.gemini_status === 'available';
      
      return {
        real: {
          available: true,
          gemini_enabled: geminiAvailable,
          description: 'Real user data + Gemini AI'
        },
        demo: {
          available: geminiAvailable,
          gemini_enabled: true,
          description: 'Mock user data + Real Gemini AI'
        },
        mock: {
          available: true,
          gemini_enabled: false,
          description: 'Mock data + Predefined responses'
        }
      };
    } catch (error) {
      return {
        real: {
          available: false,
          gemini_enabled: false,
          description: 'API unavailable'
        },
        demo: {
          available: false,
          gemini_enabled: false,
          description: 'API unavailable'
        },
        mock: {
          available: true,
          gemini_enabled: false,
          description: 'Mock data + Predefined responses'
        }
      };
    }
  }
};

export { aiChatService, mockUserContext };

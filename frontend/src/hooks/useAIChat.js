import { useCallback, useState } from 'react';
import { aiChatService } from '../services/aiChatService';

export const useAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = useCallback(async (query, contextLevel = 'summary') => {
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError('');

    try {
      const result = await aiChatService.sendMessage(query, contextLevel);
      
      if (result.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: result.data.response,
          timestamp: new Date(),
          conversationId: result.data.conversation_id
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: result.error || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setError(result.error);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Failed to get response. Please check your connection.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError('');
  }, []);

  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    removeMessage,
    hasMessages: messages.length > 0
  };
};

export const useConversationHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async (limit = 10, offset = 0) => {
    setLoading(true);
    setError('');

    try {
      const result = await aiChatService.getConversationHistory(limit, offset);
      if (result.success) {
        setConversations(result.data.conversations);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  }, []);

  const getConversationDetail = useCallback(async (conversationId) => {
    try {
      const result = await aiChatService.getConversationDetail(conversationId);
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Failed to load conversation details:', error);
      return null;
    }
  }, []);

  return {
    conversations,
    loading,
    error,
    loadHistory,
    getConversationDetail,
    hasHistory: conversations.length > 0
  };
};

export const useStudySuggestions = () => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSuggestions = useCallback(async (type = 'quick') => {
    setLoading(true);
    setError('');

    try {
      const result = await aiChatService.getStudySuggestions(type);
      if (result.success) {
        setSuggestions(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load study suggestions');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSuggestions = useCallback((type = 'quick') => {
    loadSuggestions(type);
  }, [loadSuggestions]);

  return {
    suggestions,
    loading,
    error,
    loadSuggestions,
    refreshSuggestions,
    hasSuggestions: !!suggestions
  };
};
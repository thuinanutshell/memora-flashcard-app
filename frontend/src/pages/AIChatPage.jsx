import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Center,
    Divider,
    Group,
    ScrollArea,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Title,
    Tooltip
} from '@mantine/core';
import { AlertCircle, Bot, Brain, Database, Eye, History, Lightbulb, MessageCircle, Send, Settings, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ConversationHistory from '../components/ai/ConversationHistory';
import StudySuggestions from '../components/ai/StudySuggestions';
import { aiChatService } from '../services/aiChatService';

const AIChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chatMode, setChatMode] = useState('real');
  const [modeStatus, setModeStatus] = useState(null);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const scrollAreaRef = useRef(null);

  // Load mode status on component mount
  useEffect(() => {
    loadModeStatus();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const loadModeStatus = async () => {
    try {
      const status = await aiChatService.getChatModeStatus();
      setModeStatus(status);
      
      // Auto-select best available mode
      if (status.real?.available) {
        setChatMode('real');
      } else if (status.demo?.available) {
        setChatMode('demo');
      } else {
        setChatMode('mock');
      }
    } catch (error) {
      console.error('Failed to load mode status:', error);
      setChatMode('mock'); // Fallback to mock mode
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const result = await aiChatService.sendMessage(inputValue, 'summary', chatMode);
      
      if (result.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: result.data.response,
          timestamp: new Date(),
          conversationId: result.data.conversation_id,
          mode: result.mode,
          contextUsed: result.data.context_used
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: `Sorry, I encountered an error: ${result.error}`,
          timestamp: new Date(),
          mode: result.mode
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Failed to get response. Please check your connection.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  const handleModeChange = (newMode) => {
    setChatMode(newMode);
    setShowModeSelector(false);
    
    // Add a system message about mode change
    const modeMessage = {
      id: Date.now(),
      type: 'system',
      content: `Switched to ${getModeDisplayName(newMode)} mode`,
      timestamp: new Date(),
      mode: newMode
    };
    setMessages(prev => [...prev, modeMessage]);
  };

  const getModeDisplayName = (mode) => {
    switch (mode) {
      case 'real': return 'Real API';
      case 'demo': return 'Demo (Real Gemini + Mock Data)';
      case 'mock': return 'Full Mock';
      default: return mode;
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'real': return <Database size={14} />;
      case 'demo': return <Eye size={14} />;
      case 'mock': return <Bot size={14} />;
      default: return <Settings size={14} />;
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'real': return 'green';
      case 'demo': return 'orange';
      case 'mock': return 'blue';
      default: return 'gray';
    }
  };

  const quickQuestions = [
    "How am I doing with my studies?",
    "What should I focus on today?",
    "Give me some study tips",
    "I'm feeling unmotivated, help me"
  ];

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const modeOptions = modeStatus ? Object.entries(modeStatus)
    .filter(([_, status]) => status.available)
    .map(([mode, status]) => ({
      value: mode,
      label: `${getModeDisplayName(mode)}${status.gemini_enabled ? ' ⚡' : ''}`,
      description: status.description
    })) : [];

  return (
    <Box h="calc(100vh - 120px)">
      {/* Header */}
      <Group align="flex-start" mb="xl">
        <ThemeIcon size="xl" variant="light" color="purple">
          <Brain size={28} />
        </ThemeIcon>
        
        <Stack gap={4} style={{ flex: 1 }}>
          <Group justify="space-between">
            <Title order={1} size="h2">
              AI Study Assistant
            </Title>
            
            <Group gap="md">
              {/* Mode Indicator & Selector */}
              <Group gap="xs">
                <Badge 
                  variant="filled" 
                  color={getModeColor(chatMode)}
                  leftSection={getModeIcon(chatMode)}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowModeSelector(!showModeSelector)}
                >
                  {getModeDisplayName(chatMode)}
                </Badge>
                
                {showModeSelector && (
                  <Box style={{ position: 'relative' }}>
                    <Card withBorder p="sm" style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      right: 0,
                      zIndex: 1000,
                      minWidth: 250
                    }}>
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>Select Chat Mode:</Text>
                        {modeOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={chatMode === option.value ? 'filled' : 'light'}
                            color={getModeColor(option.value)}
                            size="xs"
                            leftSection={getModeIcon(option.value)}
                            onClick={() => handleModeChange(option.value)}
                            fullWidth
                          >
                            <Stack gap={2} align="flex-start">
                              <Text size="xs">{option.label}</Text>
                              <Text size="xs" c="dimmed">{option.description}</Text>
                            </Stack>
                          </Button>
                        ))}
                      </Stack>
                    </Card>
                  </Box>
                )}
              </Group>

              <Tooltip label="Study Suggestions">
                <ActionIcon
                  variant="light"
                  color="orange"
                  size="lg"
                  onClick={() => setShowSuggestions(true)}
                >
                  <Lightbulb size={20} />
                </ActionIcon>
              </Tooltip>
              
              <Tooltip label="Conversation History">
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="lg"
                  onClick={() => setShowHistory(true)}
                >
                  <History size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
          
          <Text c="dimmed" size="md">
            Get personalized study insights and learning guidance
          </Text>
        </Stack>
      </Group>

      {/* Mode Information Alert */}
      {chatMode === 'demo' && (
        <Alert color="orange" mb="md" icon={<Eye size={16} />}>
          <Text size="sm">
            <strong>Demo Mode:</strong> Using real Gemini AI with sample study data to showcase personalized responses.
          </Text>
        </Alert>
      )}
      
      {chatMode === 'mock' && (
        <Alert color="blue" mb="md" icon={<Bot size={16} />}>
          <Text size="sm">
            <strong>Mock Mode:</strong> Using predefined responses for demonstration. No AI API calls are made.
          </Text>
        </Alert>
      )}

      {chatMode === 'real' && modeStatus?.real?.gemini_enabled === false && (
        <Alert color="yellow" mb="md" icon={<AlertCircle size={16} />}>
          <Text size="sm">
            <strong>API Mode:</strong> Connected to backend, but Gemini AI may not be configured.
          </Text>
        </Alert>
      )}

      {/* Chat Interface */}
      <Card withBorder shadow="sm" padding={0} radius="md" h="calc(100% - 160px)">
        <Stack gap={0} h="100%">
          {/* Messages Area */}
          <Box style={{ flex: 1, minHeight: 0 }}>
            <ScrollArea h="100%" p="lg" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <Center h="100%">
                  <Stack align="center" gap="lg">
                    <ThemeIcon size={80} variant="light" color="purple">
                      <Brain size={40} />
                    </ThemeIcon>
                    
                    <Stack align="center" gap="md">
                      <Title order={3} c="dimmed">
                        Start a conversation
                      </Title>
                      <Text size="sm" c="dimmed" ta="center" maw={400}>
                        Ask me about your study progress, get learning tips, or seek motivation.
                        I'm here to help optimize your learning experience!
                      </Text>
                    </Stack>

                    {/* Quick Questions */}
                    <Stack gap="xs" w="100%" maw={500}>
                      <Text size="sm" fw={500} c="dimmed" ta="center">
                        Try asking:
                      </Text>
                      {quickQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="light"
                          color="purple"
                          size="sm"
                          onClick={() => handleQuickQuestion(question)}
                          leftSection={<Sparkles size={14} />}
                        >
                          {question}
                        </Button>
                      ))}
                    </Stack>
                  </Stack>
                </Center>
              ) : (
                <Stack gap="md">
                  {messages.map((message) => (
                    <Group
                      key={message.id}
                      justify={message.type === 'user' ? 'flex-end' : 'flex-start'}
                      align="flex-start"
                    >
                      <Card
                        withBorder
                        padding="md"
                        radius="lg"
                        style={{
                          maxWidth: '75%',
                          backgroundColor: 
                            message.type === 'user' ? 'var(--mantine-color-blue-0)' :
                            message.type === 'error' ? 'var(--mantine-color-red-0)' :
                            message.type === 'system' ? 'var(--mantine-color-yellow-0)' :
                            'var(--mantine-color-gray-0)'
                        }}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between" gap="md">
                            <Group gap="xs">
                              <Badge 
                                size="xs" 
                                variant="light"
                                color={
                                  message.type === 'user' ? 'blue' :
                                  message.type === 'error' ? 'red' :
                                  message.type === 'system' ? 'yellow' : 'purple'
                                }
                              >
                                {message.type === 'user' ? 'You' : 
                                 message.type === 'error' ? 'Error' :
                                 message.type === 'system' ? 'System' : 'AI Assistant'}
                              </Badge>
                              
                              {message.mode && (
                                <Badge 
                                  size="xs" 
                                  variant="dot" 
                                  color={getModeColor(message.mode)}
                                >
                                  {message.mode}
                                </Badge>
                              )}
                              
                              {message.contextUsed && (
                                <Badge size="xs" variant="outline" color="gray">
                                  {message.contextUsed} context
                                </Badge>
                              )}
                            </Group>
                            
                            <Text size="xs" c="dimmed">
                              {formatTime(message.timestamp)}
                            </Text>
                          </Group>
                          
                          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Text>
                        </Stack>
                      </Card>
                    </Group>
                  ))}
                  
                  {loading && (
                    <Group justify="flex-start">
                      <Card withBorder padding="md" radius="lg" bg="gray.0">
                        <Group gap="xs">
                          <ThemeIcon size="sm" variant="light" color="purple">
                            <Brain size={12} />
                          </ThemeIcon>
                          <Text size="sm" c="dimmed">
                            AI is thinking... ({getModeDisplayName(chatMode)})
                          </Text>
                        </Group>
                      </Card>
                    </Group>
                  )}
                </Stack>
              )}
            </ScrollArea>
          </Box>

          <Divider />

          {/* Input Area */}
          <Box p="lg">
            <Group gap="sm">
              <TextInput
                placeholder="Ask me about your studies, learning tips, or motivation..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ flex: 1 }}
                disabled={loading}
                size="md"
                leftSection={<MessageCircle size={16} />}
              />
              <Button
                leftSection={<Send size={16} />}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                loading={loading}
                size="md"
              >
                Send
              </Button>
            </Group>
            
            {/* Quick Actions */}
            {messages.length > 0 && (
              <Group gap="xs" mt="sm">
                <Text size="xs" c="dimmed">Quick:</Text>
                {['Progress check', 'Study tips', 'Motivation'].map((action) => (
                  <Button
                    key={action}
                    variant="subtle"
                    size="xs"
                    onClick={() => handleQuickQuestion(action)}
                    disabled={loading}
                  >
                    {action}
                  </Button>
                ))}
              </Group>
            )}

            {/* Mode Status Footer */}
            <Group justify="center" mt="xs">
              <Text size="xs" c="dimmed">
                Currently using: {getModeDisplayName(chatMode)}
                {modeStatus?.[chatMode]?.gemini_enabled && ' with Gemini AI ⚡'}
              </Text>
            </Group>
          </Box>
        </Stack>
      </Card>

      {/* Conversation History Modal */}
      {showHistory && (
        <ConversationHistory
          opened={showHistory}
          onClose={() => setShowHistory(false)}
          mode={chatMode}
        />
      )}

      {/* Study Suggestions Modal */}
      {showSuggestions && (
        <StudySuggestions
          opened={showSuggestions}
          onClose={() => setShowSuggestions(false)}
          mode={chatMode}
        />
      )}
    </Box>
  );
};

export default AIChatPage;
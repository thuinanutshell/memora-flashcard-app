import {
    Badge,
    Button,
    Card,
    Center,
    Flex,
    Group,
    ScrollArea,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { Brain, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm here to help you with your studies! This AI chat feature is coming soon. You can ask me about your flashcards, study strategies, or any learning-related questions.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Stack gap="lg" h="calc(100vh - 120px)">
      {/* Header */}
      <Group>
        <ThemeIcon size="lg" variant="light" color="purple">
          <Brain size={24} />
        </ThemeIcon>
        <Stack gap={4}>
          <Title order={2} size="h3">
            AI Study Assistant
          </Title>
          <Text c="dimmed" size="sm">
            Get help with your flashcards and study strategies
          </Text>
        </Stack>
      </Group>

      {/* Chat Area */}
      <Card withBorder shadow="sm" padding="lg" radius="md" style={{ flex: 1 }}>
        <Stack gap="md" h="100%">
          {/* Messages */}
          <ScrollArea style={{ flex: 1 }} scrollbarSize={8}>
            {messages.length === 0 ? (
              <Center h={200}>
                <Stack align="center" gap="md">
                  <ThemeIcon size={60} variant="light" color="gray">
                    <MessageCircle size={30} />
                  </ThemeIcon>
                  <Stack align="center" gap="xs">
                    <Text fw={500} c="dimmed">
                      Start a conversation
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                      Ask me anything about your studies, flashcards, or learning strategies
                    </Text>
                  </Stack>
                </Stack>
              </Center>
            ) : (
              <Stack gap="md">
                {messages.map((message) => (
                  <Flex
                    key={message.id}
                    justify={message.type === 'user' ? 'flex-end' : 'flex-start'}
                  >
                    <Card
                      withBorder
                      padding="sm"
                      radius="md"
                      style={{
                        maxWidth: '70%',
                        backgroundColor: message.type === 'user' 
                          ? 'var(--mantine-color-blue-0)' 
                          : 'var(--mantine-color-gray-0)'
                      }}
                    >
                      <Stack gap="xs">
                        <Group gap="xs">
                          <Badge 
                            size="xs" 
                            variant="light"
                            color={message.type === 'user' ? 'blue' : 'purple'}
                          >
                            {message.type === 'user' ? 'You' : 'AI Assistant'}
                          </Badge>
                          <Text size="xs" c="dimmed">
                            {message.timestamp.toLocaleTimeString()}
                          </Text>
                        </Group>
                        <Text size="sm">
                          {message.content}
                        </Text>
                      </Stack>
                    </Card>
                  </Flex>
                ))}
                
                {loading && (
                  <Flex justify="flex-start">
                    <Card withBorder padding="sm" radius="md" bg="gray.0">
                      <Text size="sm" c="dimmed">
                        AI is thinking...
                      </Text>
                    </Card>
                  </Flex>
                )}
              </Stack>
            )}
          </ScrollArea>

          {/* Input Area */}
          <Group gap="sm">
            <TextInput
              placeholder="Ask me anything about your studies..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ flex: 1 }}
              disabled={loading}
            />
            <Button
              leftSection={<Send size={16} />}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || loading}
              loading={loading}
            >
              Send
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};

export default AIChat;
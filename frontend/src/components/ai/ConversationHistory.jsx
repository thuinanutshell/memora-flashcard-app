import {
    Badge,
    Box,
    Button,
    Card,
    Center,
    Group,
    Loader,
    Modal,
    ScrollArea,
    Stack,
    Text,
    Timeline,
    Title,
} from '@mantine/core';
import { Calendar, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { aiChatService } from '../../services/aiChatService';

const ConversationHistory = ({ opened, onClose }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (opened) {
      loadConversationHistory();
    }
  }, [opened]);

  const loadConversationHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await aiChatService.getConversationHistory(20, 0);
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
  };

  const handleConversationClick = async (conversationId) => {
    try {
      const result = await aiChatService.getConversationDetail(conversationId);
      if (result.success) {
        setSelectedConversation(result.data);
      }
    } catch (error) {
      console.error('Failed to load conversation details:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <MessageCircle size={20} />
          <Text fw={600}>Conversation History</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {loading ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader color="purple" />
              <Text c="dimmed">Loading conversation history...</Text>
            </Stack>
          </Center>
        ) : error ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Text c="red">{error}</Text>
              <Button variant="light" onClick={loadConversationHistory}>
                Try Again
              </Button>
            </Stack>
          </Center>
        ) : conversations.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Calendar size={48} color="var(--mantine-color-gray-5)" />
              <Title order={4} c="dimmed">
                No conversations yet
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                Start chatting with the AI assistant to see your conversation history here
              </Text>
            </Stack>
          </Center>
        ) : selectedConversation ? (
          // Detailed conversation view
          <Stack gap="md">
            <Group justify="space-between">
              <Button variant="subtle" onClick={() => setSelectedConversation(null)}>
                ← Back to History
              </Button>
              <Text size="sm" c="dimmed">
                {formatDate(selectedConversation.created_at)} at {formatTime(selectedConversation.created_at)}
              </Text>
            </Group>

            <Card withBorder p="md">
              <Stack gap="md">
                <Box>
                  <Badge variant="light" color="blue" mb="xs">
                    Your Question
                  </Badge>
                  <Text size="sm">
                    {selectedConversation.user_query}
                  </Text>
                </Box>

                <Box>
                  <Badge variant="light" color="purple" mb="xs">
                    AI Response
                  </Badge>
                  <Card withBorder bg="gray.0" p="sm">
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedConversation.ai_response}
                    </Text>
                  </Card>
                </Box>
              </Stack>
            </Card>
          </Stack>
        ) : (
          // Conversation list view
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} found
            </Text>

            <ScrollArea h={400}>
              <Timeline bulletSize={16} lineWidth={2}>
                {conversations.map((conversation) => (
                  <Timeline.Item
                    key={conversation.id}
                    bullet={<MessageCircle size={10} />}
                    color="purple"
                    title={
                      <Group justify="space-between" w="100%">
                        <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1 }}>
                          {conversation.query}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(conversation.created_at)}
                        </Text>
                      </Group>
                    }
                  >
                    <Card 
                      withBorder 
                      p="sm" 
                      mt="xs"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleConversationClick(conversation.id)}
                    >
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {conversation.response}
                      </Text>
                      
                      <Group justify="space-between" mt="xs">
                        <Text size="xs" c="dimmed">
                          {formatTime(conversation.created_at)}
                        </Text>
                        <Button variant="subtle" size="xs">
                          View Details →
                        </Button>
                      </Group>
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            </ScrollArea>

            {/* Action Buttons */}
            <Group justify="center" pt="md">
              <Button
                variant="light"
                leftSection={<Calendar size={16} />}
                onClick={loadConversationHistory}
              >
                Refresh History
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

export default ConversationHistory;
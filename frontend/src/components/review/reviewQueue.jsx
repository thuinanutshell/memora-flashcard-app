import {
    Badge,
    Box,
    Button,
    Card,
    Center,
    Group,
    Loader,
    Modal,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { BookOpen, Brain, Calendar, Clock, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { reviewService } from '../../services/reviewService';
import ReviewSession from './reviewSession';

const ReviewQueue = ({ opened, onClose }) => {
  const [reviewCards, setReviewCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewSession, setShowReviewSession] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);

  useEffect(() => {
    if (opened) {
      loadReviewQueue();
    }
  }, [opened]);

  const loadReviewQueue = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await reviewService.getAllCardsForReview();
      if (result.success) {
        setReviewCards(result.cards);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const groupCardsByDeck = () => {
    const grouped = {};
    reviewCards.forEach(card => {
      const deckKey = `${card.deckId}`;
      if (!grouped[deckKey]) {
        grouped[deckKey] = {
          deckId: card.deckId,
          deckName: card.deckName,
          folderName: card.folderName,
          cards: []
        };
      }
      grouped[deckKey].cards.push(card);
    });
    return Object.values(grouped);
  };

  const handleStartDeckReview = (deckGroup) => {
    setSelectedDeck(deckGroup);
    setShowReviewSession(true);
  };

  const handleReviewComplete = (sessionStats) => {
    setShowReviewSession(false);
    setSelectedDeck(null);
    loadReviewQueue(); // Refresh the queue
    
    // Show completion message or stats
    console.log('Review session completed:', sessionStats);
  };

  const handleReviewExit = () => {
    setShowReviewSession(false);
    setSelectedDeck(null);
  };

  const formatTimeUntilDue = (nextReviewAt) => {
    if (!nextReviewAt) return 'Ready now';
    
    const now = new Date();
    const dueDate = new Date(nextReviewAt);
    const diffMs = dueDate - now;
    
    if (diffMs <= 0) return 'Overdue';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `Due in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return 'Due soon';
  };

  const deckGroups = groupCardsByDeck();
  const totalCards = reviewCards.length;

  if (showReviewSession && selectedDeck) {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title="Review Session"
        size="xl"
        centered
        fullScreen
      >
        <ReviewSession
          deckId={selectedDeck.deckId}
          deckName={selectedDeck.deckName}
          initialCards={selectedDeck.cards}
          onComplete={handleReviewComplete}
          onExit={handleReviewExit}
        />
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Brain size={20} />
          <Text fw={600}>Review Queue</Text>
          {totalCards > 0 && (
            <Badge variant="filled" color="blue" size="sm">
              {totalCards} cards
            </Badge>
          )}
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {loading ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader color="blue" />
              <Text c="dimmed">Loading review queue...</Text>
            </Stack>
          </Center>
        ) : error ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Text c="red">{error}</Text>
              <Button variant="light" onClick={loadReviewQueue}>
                Try Again
              </Button>
            </Stack>
          </Center>
        ) : totalCards === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} variant="light" color="green">
                <Calendar size={30} />
              </ThemeIcon>
              <Title order={4} c="dimmed">
                No cards due for review!
              </Title>
              <Text size="sm" c="dimmed" ta="center" maw={300}>
                Great job! All your cards are either mastered or not yet due for review.
                Keep up the good work!
              </Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="lg">
            {/* Summary */}
            <Card withBorder bg="blue.0" p="md">
              <Group justify="space-between">
                <Stack gap={4}>
                  <Text fw={500}>Ready for Review</Text>
                  <Text size="sm" c="dimmed">
                    {totalCards} cards across {deckGroups.length} deck{deckGroups.length > 1 ? 's' : ''}
                  </Text>
                </Stack>
                <ThemeIcon size="lg" variant="light" color="blue">
                  <Brain size={24} />
                </ThemeIcon>
              </Group>
            </Card>

            {/* Deck Groups */}
            <Stack gap="md">
              <Text fw={500}>Decks with Cards Due</Text>
              
              <SimpleGrid cols={1} spacing="md">
                {deckGroups.map((deckGroup) => {
                  const overdueCards = deckGroup.cards.filter(card => {
                    if (!card.next_review_at) return true;
                    return new Date(card.next_review_at) <= new Date();
                  }).length;

                  return (
                    <Card key={deckGroup.deckId} withBorder p="md">
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Group gap="xs">
                            <ThemeIcon size="sm" variant="light" color="green">
                              <BookOpen size={14} />
                            </ThemeIcon>
                            <Text fw={500}>{deckGroup.deckName}</Text>
                          </Group>
                          
                          <Text size="sm" c="dimmed">
                            From: {deckGroup.folderName}
                          </Text>
                          
                          <Group gap="xs" mt="xs">
                            <Badge variant="light" color="blue" size="sm">
                              {deckGroup.cards.length} cards
                            </Badge>
                            
                            {overdueCards > 0 && (
                              <Badge variant="light" color="red" size="sm">
                                {overdueCards} overdue
                              </Badge>
                            )}
                          </Group>

                          {/* Preview of cards */}
                          <Stack gap="xs" mt="sm">
                            {deckGroup.cards.slice(0, 2).map((card, index) => (
                              <Box key={card.id}>
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {index + 1}. {card.question}
                                </Text>
                                <Group gap="xs" mt={2}>
                                  <Badge variant="dot" color="gray" size="xs">
                                    {card.difficulty_level}
                                  </Badge>
                                  <Text size="xs" c="dimmed">
                                    {formatTimeUntilDue(card.next_review_at)}
                                  </Text>
                                </Group>
                              </Box>
                            ))}
                            
                            {deckGroup.cards.length > 2 && (
                              <Text size="xs" c="dimmed">
                                +{deckGroup.cards.length - 2} more cards...
                              </Text>
                            )}
                          </Stack>
                        </Stack>

                        <Button
                          leftSection={<Play size={16} />}
                          onClick={() => handleStartDeckReview(deckGroup)}
                          color="blue"
                        >
                          Start Review
                        </Button>
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>

            {/* Quick Actions */}
            <Group justify="center" pt="md">
              <Button
                variant="light"
                leftSection={<Clock size={16} />}
                onClick={loadReviewQueue}
              >
                Refresh Queue
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

export default ReviewQueue;
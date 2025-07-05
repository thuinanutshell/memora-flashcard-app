import {
    Badge,
    Box,
    Button,
    Card,
    Center,
    Divider,
    Group,
    Loader,
    Modal,
    ScrollArea,
    Stack,
    Text,
    Timeline
} from '@mantine/core';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { reviewService } from '../../services/reviewService';

const ReviewHistory = ({ cardId, cardInfo, opened, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (opened && cardId) {
      loadReviewHistory();
    }
  }, [opened, cardId]);

  const loadReviewHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await reviewService.getCardReviewHistory(cardId, 20);
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
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'blue';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Review';
  };

  const calculateStats = () => {
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
  };

  const stats = calculateStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Clock size={20} />
          <Text fw={600}>Review History</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Card Info */}
        {cardInfo && (
          <Card withBorder bg="gray.0" p="md">
            <Stack gap="xs">
              <Text fw={500} size="sm" c="dimmed">Question:</Text>
              <Text size="sm">{cardInfo.question}</Text>
              <Group gap="xs" mt="xs">
                <Badge variant="light" size="xs" color="blue">
                  {cardInfo.difficulty_level}
                </Badge>
                <Badge 
                  variant="light" 
                  size="xs" 
                  color={cardInfo.is_fully_reviewed ? 'green' : 'orange'}
                >
                  {cardInfo.is_fully_reviewed ? 'Mastered' : `${cardInfo.review_count || 0}/3 Reviews`}
                </Badge>
              </Group>
            </Stack>
          </Card>
        )}

        {loading ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader color="blue" />
              <Text c="dimmed">Loading review history...</Text>
            </Stack>
          </Center>
        ) : error ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Text c="red">{error}</Text>
              <Button variant="light" onClick={loadReviewHistory}>
                Try Again
              </Button>
            </Stack>
          </Center>
        ) : history.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Calendar size={48} color="var(--mantine-color-gray-5)" />
              <Text c="dimmed" ta="center">
                No review history yet
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Review this card to start tracking your progress
              </Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="lg">
            {/* Statistics */}
            {stats && (
              <Card withBorder p="md">
                <Group justify="space-between" mb="md">
                  <Text fw={500}>Performance Summary</Text>
                  <TrendingUp size={16} color="var(--mantine-color-blue-6)" />
                </Group>
                
                <Group grow>
                  <Box ta="center">
                    <Text size="xl" fw={700} c={getScoreColor(stats.average)}>
                      {Math.round(stats.average)}%
                    </Text>
                    <Text size="xs" c="dimmed">Average</Text>
                  </Box>
                  
                  <Box ta="center">
                    <Text size="xl" fw={700} c={getScoreColor(stats.best)}>
                      {Math.round(stats.best)}%
                    </Text>
                    <Text size="xs" c="dimmed">Best</Text>
                  </Box>
                  
                  <Box ta="center">
                    <Text size="xl" fw={700} c={getScoreColor(stats.latest)}>
                      {Math.round(stats.latest)}%
                    </Text>
                    <Text size="xs" c="dimmed">Latest</Text>
                  </Box>
                  
                  <Box ta="center">
                    <Text 
                      size="xl" 
                      fw={700} 
                      c={stats.improvement >= 0 ? 'green' : 'red'}
                    >
                      {stats.improvement >= 0 ? '+' : ''}{Math.round(stats.improvement)}%
                    </Text>
                    <Text size="xs" c="dimmed">Change</Text>
                  </Box>
                </Group>
              </Card>
            )}

            <Divider />

            {/* Review Timeline */}
            <Box>
              <Text fw={500} mb="md">
                Review Timeline ({history.length} reviews)
              </Text>
              
              <ScrollArea h={300}>
                <Timeline bulletSize={24} lineWidth={2}>
                  {history.map((review, index) => {
                    const { date, time } = formatDate(review.reviewed_at);
                    const isLatest = index === 0;
                    
                    return (
                      <Timeline.Item
                        key={review.id}
                        bullet={
                          <Text size="xs" fw={700} c="white">
                            {Math.round(review.score)}
                          </Text>
                        }
                        color={getScoreColor(review.score)}
                        title={
                          <Group gap="xs">
                            <Badge 
                              variant="filled" 
                              color={getScoreColor(review.score)}
                              size="sm"
                            >
                              {Math.round(review.score)}% - {getScoreLabel(review.score)}
                            </Badge>
                            {isLatest && (
                              <Badge variant="light" color="blue" size="xs">
                                Latest
                              </Badge>
                            )}
                          </Group>
                        }
                      >
                        <Text size="sm" c="dimmed" mb="xs">
                          {date} at {time}
                        </Text>
                        
                        <Card withBorder bg="gray.0" p="xs">
                          <Text size="xs" c="dimmed" mb={4}>Your answer:</Text>
                          <Text size="sm" lineClamp={2}>
                            {review.user_answer}
                          </Text>
                        </Card>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </ScrollArea>
            </Box>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

export default ReviewHistory;
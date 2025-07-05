import {
    Alert,
    Box,
    Button,
    Card,
    Center,
    Group,
    Progress,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { reviewService } from '../../services/reviewService';
import ReviewSubmissionModal from './ReviewSubmissionModal';

const ReviewSession = ({ 
  deckId, 
  deckName, 
  onComplete, 
  onExit,
  initialCards = null 
}) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    scores: []
  });

  useEffect(() => {
    if (initialCards) {
      setCards(initialCards);
      setLoading(false);
    } else {
      loadCardsForReview();
    }
  }, [deckId, initialCards]);

  const loadCardsForReview = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await reviewService.getCardsForReview(deckId);
      if (result.success) {
        if (result.cards.length === 0) {
          setError('No cards are due for review in this deck!');
        } else {
          setCards(result.cards);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load cards for review');
    } finally {
      setLoading(false);
    }
  };

  const currentCard = cards[currentIndex];
  const progressPercentage = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;
  const isLastCard = currentIndex === cards.length - 1;

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleStartReview = () => {
    setShowAnswer(false);
    setShowSubmissionModal(true);
  };

  const handleReviewSubmit = async (userAnswer) => {
    if (!currentCard) return;

    try {
      const result = await reviewService.submitReview(currentCard.id, userAnswer);
      if (result.success) {
        const score = result.data.score;
        const isCorrect = score >= 70; // Consider 70%+ as correct
        
        // Update session stats
        setSessionStats(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1,
          scores: [...prev.scores, score]
        }));

        // Move to next card or complete session
        if (isLastCard) {
          onComplete?.({
            ...sessionStats,
            correct: sessionStats.correct + (isCorrect ? 1 : 0),
            total: sessionStats.total + 1,
            scores: [...sessionStats.scores, score]
          });
        } else {
          setCurrentIndex(prev => prev + 1);
          setShowAnswer(false);
          setShowSubmissionModal(false);
        }
      } else {
        setError(result.error);
        setShowSubmissionModal(false);
      }
    } catch (error) {
      setError('Failed to submit review');
      setShowSubmissionModal(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setShowSubmissionModal(false);
    setSessionStats({ correct: 0, total: 0, scores: [] });
  };

  if (loading) {
    return (
      <Center style={{ minHeight: 400 }}>
        <Stack align="center" gap="md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <Text c="dimmed">Loading review session...</Text>
        </Stack>
      </Center>
    );
  }

  if (error || cards.length === 0) {
    return (
      <Center style={{ minHeight: 400 }}>
        <Stack align="center" gap="md">
          <AlertCircle size={48} color="var(--mantine-color-orange-6)" />
          <Title order={3} ta="center">
            {cards.length === 0 ? 'No Cards Due for Review' : 'Error Loading Cards'}
          </Title>
          <Text c="dimmed" ta="center" maw={400}>
            {error || 'All cards in this deck have been mastered or are not yet due for review.'}
          </Text>
          <Group>
            {!error && cards.length === 0 && (
              <Button variant="light" onClick={onExit}>
                Back to Deck
              </Button>
            )}
            {error && (
              <Button variant="light" onClick={loadCardsForReview}>
                Try Again
              </Button>
            )}
          </Group>
        </Stack>
      </Center>
    );
  }

  if (!currentCard) {
    return (
      <Center style={{ minHeight: 400 }}>
        <Stack align="center" gap="md">
          <CheckCircle size={48} color="var(--mantine-color-green-6)" />
          <Title order={3}>Review Session Complete!</Title>
          <Text c="dimmed" ta="center">
            You've finished reviewing all cards in this session.
          </Text>
          <Group>
            <Button variant="light" onClick={onExit}>
              Back to Deck
            </Button>
            <Button onClick={handleRestart} leftSection={<RotateCcw size={16} />}>
              Start Over
            </Button>
          </Group>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="lg" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Session Header */}
      <Box>
        <Group justify="space-between" mb="xs">
          <Title order={2} size="h3">
            Review Session: {deckName}
          </Title>
          <Button variant="subtle" onClick={onExit}>
            Exit Session
          </Button>
        </Group>
        
        {/* Progress */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Progress: {currentIndex + 1} of {cards.length}
            </Text>
            <Text size="sm" c="dimmed">
              Score: {sessionStats.correct}/{sessionStats.total}
            </Text>
          </Group>
          <Progress value={progressPercentage} size="sm" />
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          icon={<AlertCircle size={16} />}
          color="red"
          withCloseButton
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Current Card */}
      <Card withBorder shadow="md" padding="xl" radius="md">
        <Stack gap="md" align="center" style={{ minHeight: 300 }}>

          {/* Question */}
          <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <Text ta="center" size="lg" fw={500} style={{ maxWidth: 600 }}>
                {currentCard.question}
              </Text>
          </Box>

          {/* Action Buttons */}
          <Group>
              <Button
                size="lg"
                onClick={handleStartReview}
                color="green"
              >
                Test Your Knowledge
              </Button>
          </Group>
        </Stack>
      </Card>

      {/* Review Submission Modal */}
      {showSubmissionModal && (
        <ReviewSubmissionModal
          card={currentCard}
          onSubmit={handleReviewSubmit}
          onCancel={() => setShowSubmissionModal(false)}
        />
      )}
    </Stack>
  );
};

export default ReviewSession;
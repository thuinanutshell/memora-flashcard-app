import {
    Badge,
    Button,
    Card,
    Center,
    Group,
    Progress,
    Stack,
    Text,
    Textarea,
    Title,
} from '@mantine/core';
import { CheckCircle, RotateCcw, Send, X } from 'lucide-react';
import { useState } from 'react';
import { reviewService } from '../../services/reviewService';

const ReviewCard = ({ 
  cards = [], 
  currentIndex = 0, 
  onComplete, 
  onCardReview,
  deckName = ''
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  const currentCard = cards[currentIndex];
  const progressPercentage = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleStartAnswering = () => {
    setShowAnswerInput(true);
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !currentCard) return;

    setSubmitting(true);
    
    try {
      const result = await reviewService.submitReview(currentCard.id, userAnswer);
      if (result.success) {
        setReviewResult(result.data);
        
        // Call the parent callback with review data
        onCardReview?.(currentCard, {
          score: result.data.score,
          userAnswer: userAnswer,
          isCorrect: result.data.score >= 70
        });
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < cards.length - 1) {
      // Reset states for next card
      setShowAnswer(false);
      setShowAnswerInput(false);
      setUserAnswer('');
      setReviewResult(null);
      
      // Move to next card (handled by parent)
      onCardReview?.(currentCard, {
        score: reviewResult?.score || 0,
        userAnswer: userAnswer,
        isCorrect: (reviewResult?.score || 0) >= 70,
        moveToNext: true
      });
    } else {
      // Session complete
      onComplete?.({
        totalCards: cards.length,
        completedCards: currentIndex + 1
      });
    }
  };

  const handleRestart = () => {
    setShowAnswer(false);
    setShowAnswerInput(false);
    setUserAnswer('');
    setReviewResult(null);
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

  if (!currentCard) {
    return (
      <Center style={{ minHeight: 400 }}>
        <Stack align="center" gap="md">
          <CheckCircle size={48} color="var(--mantine-color-green-6)" />
          <Title order={3}>Review Complete!</Title>
          <Text c="dimmed" ta="center">
            You've finished reviewing all cards in this session.
          </Text>
          <Button onClick={onComplete}>
            Back to Deck
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="lg" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Progress */}
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {deckName && `${deckName} - `}Review Progress
          </Text>
          <Text size="sm" c="dimmed">
            {currentIndex + 1} of {cards.length}
          </Text>
        </Group>
        <Progress value={progressPercentage} size="sm" />
      </Stack>

      {/* Card Info */}
      <Group justify="center" gap="xs">
        <Badge variant="light" color="purple">
          Review Mode
        </Badge>
        <Badge 
          variant="light" 
          color={
            currentCard.difficulty_level === 'easy' ? 'green' :
            currentCard.difficulty_level === 'medium' ? 'yellow' : 'red'
          }
        >
          {currentCard.difficulty_level}
        </Badge>
      </Group>

      {/* Question Card */}
      <Card withBorder shadow="md" padding="xl" radius="md">
        <Stack gap="md">
          <Text fw={500} c="dimmed" size="sm">
            Question:
          </Text>
          <Text size="lg" fw={500}>
            {currentCard.question}
          </Text>
        </Stack>
      </Card>

      {/* Answer Input Section */}
      {showAnswerInput && !reviewResult && (
        <Card withBorder shadow="md" padding="lg" radius="md" bg="gray.0">
          <Stack gap="md">
            <Text fw={500} c="dimmed" size="sm">
              Your Answer:
            </Text>
            <Textarea
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={4}
              autoFocus
            />
            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() => setShowAnswerInput(false)}
                leftSection={<X size={16} />}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAnswer}
                loading={submitting}
                disabled={!userAnswer.trim()}
                leftSection={<Send size={16} />}
              >
                Submit Answer
              </Button>
            </Group>
          </Stack>
        </Card>
      )}

      {/* Score Display */}
      {reviewResult && (
        <Card withBorder shadow="md" padding="lg" radius="md" bg={`${getScoreColor(reviewResult.score)}.0`}>
          <Stack align="center" gap="md">
            <CheckCircle size={48} color={`var(--mantine-color-${getScoreColor(reviewResult.score)}-6)`} />
            
            <Stack align="center" gap="xs">
              <Title order={3}>
                {Math.round(reviewResult.score)}% Match
              </Title>
              <Badge color={getScoreColor(reviewResult.score)} size="lg">
                {getScoreLabel(reviewResult.score)}
              </Badge>
            </Stack>

            <Progress 
              value={reviewResult.score} 
              size="lg" 
              color={getScoreColor(reviewResult.score)}
              style={{ width: '100%' }}
            />
          </Stack>
        </Card>
      )}

      {/* Answer Section */}
      {showAnswer && (
        <Card withBorder shadow="md" padding="xl" radius="md" bg="blue.0">
          <Stack gap="md">
            <Text fw={500} c="dimmed" size="sm">
              Correct Answer:
            </Text>
            <Text size="lg" fw={500}>
              {currentCard.answer}
            </Text>
          </Stack>
        </Card>
      )}

      {/* Action Buttons */}
      {!showAnswerInput && !reviewResult && (
        <Center>
          {!showAnswer ? (
            <Group>
              <Button 
                size="lg"
                onClick={handleShowAnswer}
                leftSection={<RotateCcw size={18} />}
                variant="light"
              >
                Show Answer
              </Button>
              <Button
                size="lg"
                onClick={handleStartAnswering}
                color="blue"
              >
                Test Yourself
              </Button>
            </Group>
          ) : (
            <Button
              size="lg"
              onClick={handleStartAnswering}
              color="green"
            >
              Test Your Knowledge
            </Button>
          )}
        </Center>
      )}

      {/* Continue Button */}
      {reviewResult && (
        <Center>
          <Button
            size="lg"
            onClick={handleNextCard}
            color="green"
            leftSection={<CheckCircle size={18} />}
          >
            {currentIndex < cards.length - 1 ? 'Next Card' : 'Complete Session'}
          </Button>
        </Center>
      )}

      {/* Instructions */}
      <Center>
        <Text size="sm" c="dimmed" ta="center" maw={500}>
          {!showAnswerInput && !reviewResult && !showAnswer && 
            "Choose to see the answer first or test yourself directly"
          }
          {showAnswer && !showAnswerInput && !reviewResult &&
            "Ready to test your knowledge? Your answer will be scored using AI"
          }
          {reviewResult &&
            "Great job! Continue to the next card when you're ready"
          }
        </Text>
      </Center>
    </Stack>
  );
};

export default ReviewCard;
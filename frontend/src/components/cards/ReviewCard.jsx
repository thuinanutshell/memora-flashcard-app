import {
    Badge,
    Button,
    Card,
    Center,
    Group,
    Progress,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { CheckCircle, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';

const ReviewCard = ({ 
  cards = [], 
  currentIndex = 0, 
  onComplete, 
  onCardReview 
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  const currentCard = cards[currentIndex];
  const progressPercentage = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextCard = (isCorrect) => {
    onCardReview?.(currentCard, isCorrect);
    
    if (currentIndex < cards.length - 1) {
      // Move to next card
      setShowAnswer(false);
      setUserAnswer('');
    } else {
      // Review session complete
      onComplete?.();
    }
  };

  const handleRestart = () => {
    setShowAnswer(false);
    setUserAnswer('');
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
            Review Progress
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

      {/* Answer Section */}
      {showAnswer ? (
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
      ) : (
        <Center>
          <Button 
            size="lg"
            onClick={handleShowAnswer}
            leftSection={<RotateCcw size={18} />}
          >
            Reveal Answer
          </Button>
        </Center>
      )}

      {/* Review Buttons */}
      {showAnswer && (
        <Group justify="center" gap="md">
          <Button
            color="red"
            variant="light"
            size="lg"
            leftSection={<X size={18} />}
            onClick={() => handleNextCard(false)}
          >
            Incorrect
          </Button>
          <Button
            color="green"
            variant="light"
            size="lg"
            leftSection={<CheckCircle size={18} />}
            onClick={() => handleNextCard(true)}
          >
            Correct
          </Button>
        </Group>
      )}

      {/* Session Info */}
      <Center>
        <Text size="sm" c="dimmed">
          Be honest with yourself - did you know the answer?
        </Text>
      </Center>
    </Stack>
  );
};

export default ReviewCard;
import {
    Badge,
    Button,
    Card,
    Center,
    Group,
    Stack,
    Text
} from '@mantine/core';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useState } from 'react';

const FlashCard = ({ card, onNext, onMarkDifficulty }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNext = (difficulty) => {
    setShowAnswer(false);
    onNext?.(difficulty);
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  if (!card) {
    return (
      <Center>
        <Text c="dimmed">No card to display</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Card Info */}
      <Group justify="center" gap="xs">
        <Badge variant="light" color="blue">
          Flashcard Mode
        </Badge>
        <Badge 
          variant="light" 
          color={
            card.difficulty_level === 'easy' ? 'green' :
            card.difficulty_level === 'medium' ? 'yellow' : 'red'
          }
        >
          {card.difficulty_level}
        </Badge>
      </Group>

      {/* Main Card */}
      <Card
        withBorder
        shadow="md"
        padding="xl"
        radius="md"
        style={{ 
          minHeight: 300,
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}
        onClick={handleFlip}
      >
        <Center style={{ minHeight: 200 }}>
          <Stack align="center" gap="md">
            <Text ta="center" fw={500} c="dimmed" size="sm">
              {showAnswer ? 'Answer:' : 'Question:'}
            </Text>
            
            <Text ta="center" size="lg" fw={500}>
              {showAnswer ? card.answer : card.question}
            </Text>
            
            <Group gap="xs">
              {showAnswer ? <Eye size={16} /> : <EyeOff size={16} />}
              <Text size="sm" c="dimmed">
                Click to {showAnswer ? 'hide' : 'reveal'} {showAnswer ? 'question' : 'answer'}
              </Text>
            </Group>
          </Stack>
        </Center>
      </Card>

      {/* Action Buttons */}
      <Group justify="center" gap="md">
        <Button
          variant="light"
          leftSection={<RotateCcw size={16} />}
          onClick={handleFlip}
        >
          Flip Card
        </Button>

        {showAnswer && (
          <Button
            onClick={handleShowAnswer}
            disabled={showAnswer}
          >
            Show Answer
          </Button>
        )}
      </Group>

      {/* Difficulty Buttons (shown after answer is revealed) */}
      {showAnswer && (
        <Group justify="center" gap="md">
          <Button
            color="red"
            variant="light"
            onClick={() => handleNext('again')}
          >
            Again
          </Button>
          <Button
            color="yellow"
            variant="light"
            onClick={() => handleNext('hard')}
          >
            Hard
          </Button>
          <Button
            color="blue"
            variant="light"
            onClick={() => handleNext('good')}
          >
            Good
          </Button>
          <Button
            color="green"
            variant="light"
            onClick={() => handleNext('easy')}
          >
            Easy
          </Button>
        </Group>
      )}
    </Stack>
  );
};

export default FlashCard;
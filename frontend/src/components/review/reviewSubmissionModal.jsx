import {
    Badge,
    Button,
    Card,
    Group,
    Modal,
    Progress,
    Stack,
    Text,
    Textarea,
    Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { CheckCircle, Send, X } from 'lucide-react';
import { useState } from 'react';

const ReviewSubmissionModal = ({ card, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const form = useForm({
    initialValues: {
      answer: ''
    },
    validate: {
      answer: (value) => {
        if (!value.trim()) return 'Please enter your answer';
        if (value.trim().length < 2) return 'Answer must be at least 2 characters';
        return null;
      }
    }
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // Call the review service to submit the answer
      await onSubmit(values.answer);
      
      // The parent component handles the actual API call and navigation
      // This modal will be closed by the parent component after successful submission
    } catch (error) {
      console.error('Error submitting review:', error);
    }
    
    setLoading(false);
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

  return (
    <Modal
      opened={true}
      onClose={onCancel}
      title={
        <Group>
          <Text fw={600}>Test Your Knowledge</Text>
          <Badge variant="light" color="blue" size="sm">
            {card.difficulty_level}
          </Badge>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        {/* Question Display */}
        <Card withBorder bg="gray.0" p="md">
          <Stack gap="xs">
            <Text fw={500} size="sm" c="dimmed">
              Question:
            </Text>
            <Text size="md">
              {card.question}
            </Text>
          </Stack>
        </Card>

        {/* Answer Input Form */}
        {!result && (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Textarea
                label="Your Answer"
                placeholder="Type your answer here..."
                required
                rows={4}
                description="Enter your answer as you would have responded to the question"
                {...form.getInputProps('answer')}
              />
              
              <Text size="sm" c="dimmed">
                Your answer will be compared to the correct answer using AI to determine similarity.
              </Text>

              <Group justify="flex-end">
                <Button
                  variant="light"
                  onClick={onCancel}
                  disabled={loading}
                  leftSection={<X size={16} />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  leftSection={<Send size={16} />}
                >
                  {loading ? 'Scoring...' : 'Submit Answer'}
                </Button>
              </Group>
            </Stack>
          </form>
        )}

        {/* Score Display (if result is available) */}
        {result && (
          <Stack gap="md">
            <Card withBorder bg={`${getScoreColor(result.score)}.0`} p="md">
              <Stack align="center" gap="md">
                <CheckCircle size={48} color={`var(--mantine-color-${getScoreColor(result.score)}-6)`} />
                
                <Stack align="center" gap="xs">
                  <Title order={3}>
                    {Math.round(result.score)}% Match
                  </Title>
                  <Badge color={getScoreColor(result.score)} size="lg">
                    {getScoreLabel(result.score)}
                  </Badge>
                </Stack>

                <Progress 
                  value={result.score} 
                  size="lg" 
                  color={getScoreColor(result.score)}
                  style={{ width: '100%' }}
                />
              </Stack>
            </Card>

            <Group justify="center">
              <Button
                onClick={() => onSubmit(form.values.answer)}
                color="green"
                size="lg"
              >
                Continue to Next Card
              </Button>
            </Group>
          </Stack>
        )}

        {/* Instructions */}
        <Text size="xs" c="dimmed" ta="center" style={{ marginTop: 'auto' }}>
          The AI will analyze how similar your answer is to the correct answer.
          A score of 70% or higher is considered correct.
        </Text>
      </Stack>
    </Modal>
  );
};

export default ReviewSubmissionModal;
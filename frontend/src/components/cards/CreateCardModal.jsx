import {
    Alert,
    Button,
    Group,
    Modal,
    Select,
    Stack,
    Text,
    Textarea
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { AlertCircle, Plus } from 'lucide-react';
import { useState } from 'react';

const CreateCardModal = ({ deckId, deckName, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      question: '',
      answer: '',
      difficulty_level: 'medium'
    },
    validate: {
      question: (value) => {
        if (!value.trim()) return 'Question is required';
        if (value.trim().length < 5) return 'Question must be at least 5 characters long';
        return null;
      },
      answer: (value) => {
        if (!value.trim()) return 'Answer is required';
        if (value.trim().length < 2) return 'Answer must be at least 2 characters long';
        return null;
      }
    }
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const result = await onSubmit(values);
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={true}
      onClose={onClose}
      title="Create New Card"
      size="lg"
      centered
    >
      <Stack gap="sm" mb="md">
        <Text size="sm" c="dimmed">
          Adding to: <Text component="span" fw={500}>{deckName}</Text>
        </Text>
      </Stack>

      {error && (
        <Alert
          icon={<AlertCircle size={16} />}
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Textarea
            label="Question"
            placeholder="Enter your question here..."
            required
            rows={3}
            description={`${form.values.question.length} characters`}
            {...form.getInputProps('question')}
          />

          <Textarea
            label="Answer"
            placeholder="Enter the correct answer here..."
            required
            rows={3}
            description={`${form.values.answer.length} characters`}
            {...form.getInputProps('answer')}
          />

          <Select
            label="Difficulty Level"
            data={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' }
            ]}
            {...form.getInputProps('difficulty_level')}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftSection={<Plus size={16} />}
            >
              {loading ? 'Creating...' : 'Create Card'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateCardModal;
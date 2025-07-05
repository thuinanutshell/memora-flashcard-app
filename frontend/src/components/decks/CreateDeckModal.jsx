import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

const CreateDeckModal = ({ onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (!value.trim() ? 'Deck name is required' : null),
    },
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
      setError('Failed to create deck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={true}
      onClose={onClose}
      title="Create New Deck"
      size="md"
      centered
    >
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
          <TextInput
            label="Deck Name"
            placeholder="e.g., Algebra Basics, Spanish Vocabulary"
            required
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Description"
            placeholder="Brief description of this deck... (optional)"
            rows={3}
            {...form.getInputProps('description')}
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
            >
              Create Deck
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateDeckModal;
import {
  Alert,
  Button,
  Card,
  FileInput,
  Flex,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { AlertCircle, Brain, FileText, Upload } from 'lucide-react';
import { useState } from 'react';

const GenerateCardsForm = ({ deckId, deckName, onGenerate, loading }) => {
  const [inputType, setInputType] = useState('text');
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      content: '',
      file: null,
      numCards: 5,
      difficulty: 'medium'
    },
    validate: {
      content: (value) => {
        if (inputType === 'text') {
          if (!value.trim()) return 'Please enter some content to generate cards from';
          if (value.trim().length < 50) return 'Content should be at least 50 characters long';
        }
        return null;
      },
      file: (value) => {
        if (inputType === 'pdf') {
          if (!value) return 'Please select a PDF file';
          if (!value.name.toLowerCase().endsWith('.pdf')) return 'Only PDF files are supported';
          if (value.size > 10 * 1024 * 1024) return 'File size must be less than 10MB';
        }
        return null;
      },
      numCards: (value) => {
        if (value < 1 || value > 20) return 'Number of cards must be between 1 and 20';
        return null;
      }
    }
  });

  const handleSubmit = async (values) => {
    setError('');
    
    const generationData = {
      deckId: deckId,
      numCards: parseInt(values.numCards),
      difficulty: values.difficulty
    };
    
    if (inputType === 'text') {
      generationData.content = values.content;
    } else {
      generationData.file = values.file;
    }
    
    try {
      await onGenerate(generationData);
    } catch (error) {
      setError('Failed to generate cards');
    }
  };

  const inputMethods = [
    {
      key: 'text',
      title: 'Text Content',
      description: 'Paste your study material',
      icon: FileText,
      color: 'blue'
    },
    {
      key: 'pdf',
      title: 'Upload PDF',
      description: 'Upload a PDF document',
      icon: Upload,
      color: 'green'
    }
  ];

  return (
    <Card withBorder shadow="sm" padding="lg" radius="md">
      <Stack gap="lg">
        {/* Header */}
        <Group>
          <ThemeIcon size="lg" variant="light" color="purple">
            <Brain size={24} />
          </ThemeIcon>
          <Stack gap={4}>
            <Title order={3} size="h4">
              Generate Cards with AI
            </Title>
            <Text c="dimmed" size="sm">
              Creating cards for: <Text component="span" fw={500}>{deckName}</Text>
            </Text>
          </Stack>
        </Group>

        {error && (
          <Alert icon={<AlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            {/* Input Method Selection */}
            <Stack gap="sm">
              <Text fw={500} size="sm">
                Choose Input Method
              </Text>
              <SimpleGrid cols={2} spacing="md">
                {inputMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = inputType === method.key;
                  
                  return (
                    <Card
                      key={method.key}
                      withBorder
                      padding="md"
                      radius="md"
                      style={{
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--mantine-color-blue-4)' : undefined,
                        backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined
                      }}
                      onClick={() => setInputType(method.key)}
                    >
                      <Stack align="center" gap="xs">
                        <ThemeIcon
                          size="lg"
                          variant="light"
                          color={isSelected ? 'blue' : 'gray'}
                        >
                          <Icon size={20} />
                        </ThemeIcon>
                        <Text fw={500} size="sm" ta="center">
                          {method.title}
                        </Text>
                        <Text size="xs" c="dimmed" ta="center">
                          {method.description}
                        </Text>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>

            {/* Content Input */}
            {inputType === 'text' ? (
              <Textarea
                label="Content"
                placeholder="Paste your study material here... (e.g., lecture notes, textbook content, etc.)"
                rows={6}
                required
                description={`${form.values.content.length} characters (minimum 50 required)`}
                {...form.getInputProps('content')}
              />
            ) : (
              <FileInput
                label="Upload PDF File"
                placeholder="Choose a PDF file to upload"
                accept=".pdf"
                description="Maximum file size: 10MB"
                required
                {...form.getInputProps('file')}
              />
            )}

            {/* Generation Settings */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Number of Cards"
                type="number"
                min={1}
                max={20}
                required
                {...form.getInputProps('numCards')}
              />

              <Select
                label="Difficulty Level"
                data={[
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' }
                ]}
                {...form.getInputProps('difficulty')}
              />
            </SimpleGrid>

            {/* Generate Button */}
            <Flex justify="flex-end">
              <Button
                type="submit"
                loading={loading}
                leftSection={<Brain size={16} />}
                size="md"
              >
                {loading ? 'Generating Cards...' : 'Generate Cards'}
              </Button>
            </Flex>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
};

export default GenerateCardsForm;
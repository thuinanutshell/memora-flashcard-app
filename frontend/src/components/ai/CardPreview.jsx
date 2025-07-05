import {
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Brain, Check, X } from 'lucide-react';

const CardPreview = ({ generatedData, onAccept, onReject, loading }) => {
  const { cards, metadata } = generatedData;

  return (
    <Card withBorder shadow="sm" padding="lg" radius="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ThemeIcon size="lg" variant="light" color="purple">
              <Brain size={24} />
            </ThemeIcon>
            <Stack gap={4}>
              <Title order={3} size="h4">
                Generated Cards Preview
              </Title>
              <Group gap="md" fz="sm" c="dimmed">
                <Text>Generated: {cards.length} cards</Text>
                <Text>Difficulty: {metadata.difficulty}</Text>
                <Text>Source: {metadata.generation_method}</Text>
                {metadata.source_filename && (
                  <Text>File: {metadata.source_filename}</Text>
                )}
              </Group>
            </Stack>
          </Group>
        </Group>

        <Divider />

        {/* Cards Grid */}
        <ScrollArea h={400}>
          <Stack gap="md">
            {cards.map((card, index) => (
              <Card key={index} withBorder padding="md" radius="sm">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Badge variant="light" color="blue" size="sm">
                      Card {index + 1}
                    </Badge>
                    <Badge 
                      variant="light" 
                      color={
                        card.difficulty_level === 'easy' ? 'green' :
                        card.difficulty_level === 'medium' ? 'yellow' : 'red'
                      }
                      size="sm"
                    >
                      {card.difficulty_level}
                    </Badge>
                  </Group>
                  
                  <Stack gap="xs">
                    <div>
                      <Text fw={500} size="sm" mb={4}>
                        Question:
                      </Text>
                      <Card withBorder padding="xs" bg="gray.0">
                        <Text size="sm">
                          {card.question}
                        </Text>
                      </Card>
                    </div>
                    
                    <div>
                      <Text fw={500} size="sm" mb={4}>
                        Answer:
                      </Text>
                      <Card withBorder padding="xs" bg="gray.0">
                        <Text size="sm">
                          {card.answer}
                        </Text>
                      </Card>
                    </div>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </ScrollArea>

        {/* Action Buttons */}
        <Flex justify="flex-end" gap="md">
          <Button
            variant="light"
            color="red"
            leftSection={<X size={16} />}
            onClick={onReject}
            disabled={loading}
          >
            Reject
          </Button>
          
          <Button
            leftSection={<Check size={16} />}
            onClick={onAccept}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Saving Cards...' : `Accept & Save ${cards.length} Cards`}
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
};

export default CardPreview;
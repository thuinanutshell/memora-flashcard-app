import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Center,
    Collapse,
    Group,
    Stack,
    Text,
    ThemeIcon,
} from '@mantine/core';
import { CheckCircle, Clock, Edit, Eye, EyeOff, FileText, Play, Trash2 } from 'lucide-react';
import { useState } from 'react';

const CardList = ({ cards, onEdit, onDelete, onReview }) => {
  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleCardExpansion = (cardId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  if (!cards || cards.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <ThemeIcon size={60} variant="light" color="gray">
            <FileText size={30} />
          </ThemeIcon>
          <Text c="dimmed" ta="center">
            No cards in this deck yet
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {cards.map((card, index) => {
        const isExpanded = expandedCards.has(card.id);
        
        return (
          <Card key={card.id} withBorder padding="md" radius="md">
            <Stack gap="sm">
              {/* Card Header */}
              <Group justify="space-between" align="flex-start">
                <Group gap="xs">
                  <Badge variant="light" color="gray" size="sm">
                    Card {index + 1}
                  </Badge>
                  
                  <Badge 
                    variant="light" 
                    size="sm"
                    color={
                      card.difficulty_level === 'easy' ? 'green' :
                      card.difficulty_level === 'medium' ? 'yellow' : 'red'
                    }
                  >
                    {card.difficulty_level}
                  </Badge>
                  
                  <Badge 
                    variant="light" 
                    size="sm"
                    color={card.is_fully_reviewed ? 'green' : 'blue'}
                    leftSection={
                      card.is_fully_reviewed ? 
                        <CheckCircle size={12} /> : 
                        <Clock size={12} />
                    }
                  >
                    {card.is_fully_reviewed ? 
                      'Mastered' : 
                      `Learning (${card.review_count || 0}/3)`
                    }
                  </Badge>
                </Group>
                
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => onEdit?.(card)}
                  >
                    <Edit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => onDelete?.(card)}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </Group>
              </Group>
              
              {/* Question (Always Visible) */}
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
              
              {/* Answer (Collapsible) */}
              <Collapse in={isExpanded}>
                <div>
                  <Text fw={500} size="sm" mb={4}>
                    Answer:
                  </Text>
                  <Card withBorder padding="xs" bg="blue.0">
                    <Text size="sm">
                      {card.answer}
                    </Text>
                  </Card>
                </div>
              </Collapse>

              {/* Action Buttons */}
              <Group justify="space-between" pt="xs">
                <Group gap="xs">
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
                    onClick={() => toggleCardExpansion(card.id)}
                  >
                    {isExpanded ? 'Hide Answer' : 'Show Answer'}
                  </Button>
                  
                  <Button
                    variant="light"
                    color="blue"
                    size="xs"
                    leftSection={<Play size={14} />}
                    onClick={() => onReview?.(card)}
                  >
                    Review
                  </Button>
                </Group>

                {/* Card Stats */}
                {card.last_reviewed_at && (
                  <Text size="xs" c="dimmed">
                    Last reviewed: {new Date(card.last_reviewed_at).toLocaleDateString()}
                  </Text>
                )}
              </Group>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
};

export default CardList;
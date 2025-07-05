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
    Tooltip,
} from '@mantine/core';
import { CheckCircle, Clock, Edit, Eye, EyeOff, FileText, History, Play, Trash2 } from 'lucide-react';
import { useState } from 'react';

const CardList = ({ cards, onEdit, onDelete, onReview, onShowHistory }) => {
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

  const isCardDueForReview = (card) => {
    if (card.is_fully_reviewed) return false;
    if (!card.next_review_at) return true; // Never reviewed
    return new Date(card.next_review_at) <= new Date();
  };

  const getCardStatus = (card) => {
    if (card.is_fully_reviewed) {
      return { label: 'Mastered', color: 'green', icon: CheckCircle };
    }
    
    if (isCardDueForReview(card)) {
      return { label: 'Due for Review', color: 'orange', icon: Clock };
    }
    
    return { 
      label: `Learning (${card.review_count || 0}/3)`, 
      color: 'blue', 
      icon: Clock 
    };
  };

  const formatNextReview = (nextReviewAt) => {
    if (!nextReviewAt) return 'Ready now';
    
    const date = new Date(nextReviewAt);
    const now = new Date();
    
    if (date <= now) return 'Overdue';
    
    const diffMs = date - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `Due in ${diffDays}d`;
    if (diffHours > 0) return `Due in ${diffHours}h`;
    return 'Due soon';
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
        const status = getCardStatus(card);
        const StatusIcon = status.icon;
        const isDue = isCardDueForReview(card);
        
        return (
          <Card 
            key={card.id} 
            withBorder 
            padding="md" 
            radius="md"
            style={{
              borderColor: isDue ? 'var(--mantine-color-orange-3)' : undefined,
              backgroundColor: isDue ? 'var(--mantine-color-orange-0)' : undefined
            }}
          >
            <Stack gap="sm">
              {/* Card Header */}
              <Group justify="space-between" align="flex-start">
                <Group gap="xs" wrap="wrap">
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
                    color={status.color}
                    leftSection={<StatusIcon size={12} />}
                  >
                    {status.label}
                  </Badge>

                  {/* Review timing info */}
                  {!card.is_fully_reviewed && (
                    <Badge 
                      variant="dot" 
                      size="sm"
                      color={isDue ? 'orange' : 'gray'}
                    >
                      {formatNextReview(card.next_review_at)}
                    </Badge>
                  )}
                </Group>
                
                <Group gap="xs">
                  <Tooltip label="Edit card">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      onClick={() => onEdit?.(card)}
                    >
                      <Edit size={14} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Delete card">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => onDelete?.(card)}
                    >
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Tooltip>
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
                    Review Card
                  </Button>

                  <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    leftSection={<History size={14} />}
                    onClick={() => onShowHistory?.(card)}
                  >
                    History
                  </Button>

                  {/* Priority indicator if due */}
                  {isDue && (
                    <Badge variant="filled" color="orange" size="sm">
                      Due for Review
                    </Badge>
                  )}
                </Group>

                {/* Card Stats */}
                <Group gap="md">
                  {card.last_reviewed_at && (
                    <Text size="xs" c="dimmed">
                      Last reviewed: {new Date(card.last_reviewed_at).toLocaleDateString()}
                    </Text>
                  )}
                  
                  {card.review_count > 0 && (
                    <Text size="xs" c="dimmed">
                      Reviewed {card.review_count} time{card.review_count !== 1 ? 's' : ''}
                    </Text>
                  )}
                </Group>
              </Group>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
};

export default CardList;
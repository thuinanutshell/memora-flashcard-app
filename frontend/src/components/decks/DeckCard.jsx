import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { BookOpen, Edit, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeckCard = ({ deck, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/deck/${deck.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(deck);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(deck);
  };

  const cardCount = deck.card_count || 0;
  const isEmpty = cardCount === 0;

  return (
    <Card
      withBorder
      shadow="sm"
      padding="md"
      radius="md"
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
    >
      <Group justify="space-between" align="flex-start" mb="md">
        <Group align="flex-start">
          <ThemeIcon size="lg" variant="light" color="green">
            <BookOpen size={20} />
          </ThemeIcon>
          
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <Text fw={600} size="md">
                {deck.name}
              </Text>
              <Group gap={4}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit size={14} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 size={14} />
                </ActionIcon>
              </Group>
            </Group>
            {deck.description && (
              <Text size="sm" c="dimmed" lineClamp={2}>
                {deck.description}
              </Text>
            )}
          </Stack>
        </Group>
      </Group>

      <Group justify="space-between" align="center">
        <Group gap={4} c="dimmed" fz="sm">
          <FileText size={14} />
          <Text>{cardCount} cards</Text>
        </Group>
        
        <Badge 
          variant="light" 
          color={isEmpty ? 'gray' : 'blue'}
          size="sm"
        >
          {isEmpty ? 'Empty' : 'Active'}
        </Badge>
      </Group>
    </Card>
  );
};

export default DeckCard;
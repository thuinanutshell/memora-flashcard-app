import {
  ActionIcon,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { BookOpen, Edit, Folder, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FolderCard = ({ folder, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/folder/${folder.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(folder);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(folder);
  };

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
          <ThemeIcon size="lg" variant="light" color="blue">
            <Folder size={20} />
          </ThemeIcon>
          
          <Stack gap={4}>
            <Group gap="xs" align="center">
              <Text fw={600} size="md">
                {folder.name}
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
            {folder.description && (
              <Text size="sm" c="dimmed" lineClamp={2}>
                {folder.description}
              </Text>
            )}
          </Stack>
        </Group>
      </Group>

      <Group justify="space-between" c="dimmed" fz="sm">
        <Group gap={4}>
          <BookOpen size={14} />
          <Text>{folder.deckCount || 0} decks</Text>
        </Group>
        <Text>{folder.cardCount || 0} cards</Text>
      </Group>
    </Card>
  );
};

export default FolderCard;
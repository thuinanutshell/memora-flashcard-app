import {
  Box,
  Group,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { BookOpen, Folder, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FolderCard = ({ folder, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/folder/${folder.id}`);
  };

  return (
    <Paper
      withBorder
      radius="md"
      shadow="sm"
      p="md"
      onClick={handleClick}
      sx={(theme) => ({
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.shadows.md,
        },
      })}
    >
      <Group position="apart" mb="sm" align="flex-start">
        <Group align="flex-start" spacing="sm">
          <Box bg="blue.1" p="xs" radius="md">
            <Folder size={20} color="#2563eb" />
          </Box>
          <Stack spacing={2}>
            <Text fw={600} size="md" c="gray.9">
              {folder.name}
            </Text>
            {folder.description && (
              <Text size="sm" c="gray.6">
                {folder.description}
              </Text>
            )}
          </Stack>
        </Group>

        <UnstyledButton
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Show dropdown menu
          }}
          px={4}
          py={2}
          sx={(theme) => ({
            borderRadius: theme.radius.sm,
            '&:hover': {
              backgroundColor: theme.colors.gray[1],
            },
          })}
        >
          <MoreVertical size={16} color="#9ca3af" />
        </UnstyledButton>
      </Group>

      <Group position="apart" mt="xs" c="gray.6" fz="sm">
        <Group spacing={4}>
          <BookOpen size={14} />
          <Text>{folder.deckCount || 0} decks</Text>
        </Group>
        <Text>{folder.cardCount || 0} cards</Text>
      </Group>
    </Paper>
  );
};

export default FolderCard;

import {
  Box,
  Button,
  Card,
  Center,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { BookOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import CreateDeckModal from './CreateDeckModal';
import DeckCard from './DeckCard';

const DeckList = ({ folderId, decks, onCreateDeck, onDeckUpdate }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateDeck = async (deckData) => {
    const result = await onCreateDeck(deckData);
    if (result.success) {
      setShowCreateModal(false);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleEditDeck = (deck) => {
    // TODO: Implement edit functionality
    console.log('Edit deck:', deck);
  };

  const handleDeleteDeck = async (deck) => {
    if (window.confirm(`Are you sure you want to delete "${deck.name}"?`)) {
      // TODO: Implement delete functionality
      console.log('Delete deck:', deck);
      // After successful deletion, call onDeckUpdate to refresh the list
      // onDeckUpdate?.();
    }
  };

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <Stack gap={4}>
          <Title order={3} size="h4">
            Decks
          </Title>
          <Text c="dimmed" size="sm">
            Study decks in this folder
          </Text>
        </Stack>
        
        <Button 
          leftSection={<Plus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Deck
        </Button>
      </Group>

      {/* Decks Grid */}
      {decks.length === 0 ? (
        <Card
          withBorder
          padding="xl"
          radius="md"
          style={{ borderStyle: 'dashed' }}
        >
          <Center>
            <Stack align="center" gap="md">
              <ThemeIcon size={60} variant="light" color="green">
                <BookOpen size={30} />
              </ThemeIcon>
              
              <Stack align="center" gap="xs">
                <Title order={4} c="dimmed">
                  No decks yet
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                  Create your first deck to start adding flashcards
                </Text>
              </Stack>
              
              <Button 
                leftSection={<Plus size={16} />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Deck
              </Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing="lg"
        >
          {decks.map(deck => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onEdit={handleEditDeck}
              onDelete={handleDeleteDeck}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Create Deck Modal */}
      {showCreateModal && (
        <CreateDeckModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDeck}
        />
      )}
    </Box>
  );
};

export default DeckList;
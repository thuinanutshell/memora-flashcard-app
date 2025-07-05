import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { AlertCircle, Folder } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DeckList from '../components/decks/DeckList';
import { deckService } from '../services/deckService';

const FolderDetail = () => {
  const { folderId } = useParams();
  
  const [folder, setFolder] = useState(null);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFolderAndDecks();
  }, [folderId]);

  const loadFolderAndDecks = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await deckService.getDecksInFolder(folderId);
      if (result.success) {
        setFolder(result.folder);
        setDecks(result.decks);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load folder');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = async (deckData) => {
    const result = await deckService.createDeck(folderId, deckData);
    if (result.success) {
      setDecks(prev => [...prev, result.deck]);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  if (loading) {
    return (
      <Center style={{ minHeight: '60vh' }}>
        <Stack align="center" gap="md">
          <Loader color="blue" size="lg" />
          <Text c="dimmed">Loading folder...</Text>
        </Stack>
      </Center>
    );
  }

  if (error && !folder) {
    return (
      <Center style={{ minHeight: '60vh' }}>
        <Stack align="center" gap="md">
          <Alert
            icon={<AlertCircle size={16} />}
            color="red"
            title="Error"
            style={{ maxWidth: 400 }}
          >
            {error}
          </Alert>
          <Button variant="light" onClick={loadFolderAndDecks}>
            Try Again
          </Button>
        </Stack>
      </Center>
    );
  }

  const totalCards = decks.reduce((total, deck) => total + (deck.card_count || 0), 0);

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert
          icon={<AlertCircle size={16} />}
          color="red"
          mb="lg"
          withCloseButton
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Folder Header */}
      <Box mb="xl">
        <Group align="flex-start" mb="md">
          <ThemeIcon size="xl" variant="light" color="blue">
            <Folder size={28} />
          </ThemeIcon>
          
          <Stack gap={4}>
            <Title order={1} size="h2">
              {folder?.name}
            </Title>
            {folder?.description && (
              <Text c="dimmed" size="md">
                {folder.description}
              </Text>
            )}
          </Stack>
        </Group>
      </Box>

      <Divider mb="xl" />

      {/* Deck Management */}
      <DeckList 
        folderId={folderId}
        decks={decks}
        onCreateDeck={handleCreateDeck}
        onDeckUpdate={loadFolderAndDecks}
      />
    </Box>
  );
};

export default FolderDetail;
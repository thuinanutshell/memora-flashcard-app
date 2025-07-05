import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  Title
} from '@mantine/core';
import { AlertCircle, BookOpen, Brain, FileText, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CardPreview from '../components/ai/CardPreview';
import GenerateCardsForm from '../components/ai/GenerateCardsForm';
import CardList from '../components/cards/CardList';
import CreateCardModal from '../components/cards/CreateCardModal';
import FlashCard from '../components/cards/FlashCard';
import { aiService } from '../services/aiService';
import { cardService } from '../services/cardService';
import { deckService } from '../services/deckService';

const DeckDetail = () => {
  const { deckId } = useParams();
  
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // AI Generation States
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generatingCards, setGeneratingCards] = useState(false);
  const [generatedCards, setGeneratedCards] = useState(null);
  const [savingCards, setSavingCards] = useState(false);
  
  // Manual Card Creation States
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  
  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewCard, setReviewCard] = useState(null);

  useEffect(() => {
    loadDeck();
  }, [deckId]);

  const loadDeck = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await deckService.getDeck(deckId);
      if (result.success) {
        setDeck(result.deck);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load deck');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCards = async (generationData) => {
    setGeneratingCards(true);
    setError('');

    try {
      const result = await aiService.generateCards(generationData);
      if (result.success) {
        setGeneratedCards(result.data);
        setShowGenerateForm(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to generate cards');
    } finally {
      setGeneratingCards(false);
    }
  };

  const handleAcceptCards = async () => {
    if (!generatedCards) return;

    setSavingCards(true);
    setError('');

    try {
      const result = await aiService.acceptCards(deckId, generatedCards.cards);
      if (result.success) {
        setGeneratedCards(null);
        await loadDeck(); // Reload deck to show new cards
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to save cards');
    } finally {
      setSavingCards(false);
    }
  };

  const handleRejectCards = () => {
    setGeneratedCards(null);
    setShowGenerateForm(true);
  };

  const handleCreateCard = async (cardData) => {
    const result = await cardService.createCard(deckId, cardData);
    if (result.success) {
      await loadDeck(); // Reload deck to show new card
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleEditCard = (card) => {
    // TODO: Implement edit card functionality
    console.log('Edit card:', card);
  };

  const handleReviewCard = (card) => {
    setReviewCard(card);
    setShowReviewModal(true);
  };

  const handleCloseReview = () => {
    setShowReviewModal(false);
    setReviewCard(null);
  };

  const handleReviewNext = (difficulty) => {
    // TODO: Update card review status based on difficulty
    console.log('Review completed with difficulty:', difficulty);
    
    // For now, just close the modal
    // In a real implementation, you would:
    // 1. Update the card's review status
    // 2. Update spaced repetition schedule
    // 3. Possibly show the next card due for review
    handleCloseReview();
  };

  const handleDeleteCard = async (card) => {
    if (window.confirm(`Are you sure you want to delete this card: "${card.question}"?`)) {
      const result = await cardService.deleteCard(card.id);
      if (result.success) {
        await loadDeck(); // Reload deck to remove deleted card
      } else {
        setError(result.error);
      }
    }
  };

  if (loading) {
    return (
      <Center style={{ minHeight: '60vh' }}>
        <Stack align="center" gap="md">
          <Loader color="green" size="lg" />
          <Text c="dimmed">Loading deck...</Text>
        </Stack>
      </Center>
    );
  }

  if (error && !deck) {
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
          <Button variant="light" onClick={loadDeck}>
            Try Again
          </Button>
        </Stack>
      </Center>
    );
  }

  const cardCount = deck?.cards?.length || 0;
  const masteredCount = deck?.cards?.filter(card => card.is_fully_reviewed).length || 0;

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

      {/* Deck Header */}
      <Box mb="xl">
        <Group align="flex-start" mb="md">
          <ThemeIcon size="xl" variant="light" color="green">
            <BookOpen size={28} />
          </ThemeIcon>
          
          <Stack gap={4}>
            <Title order={1} size="h2">
              {deck?.name}
            </Title>
            {deck?.description && (
              <Text c="dimmed" size="md">
                {deck.description}
              </Text>
            )}
          </Stack>
        </Group>
        
        {/* Deck Stats */}
        <Group gap="lg" c="dimmed" fz="sm">
          <Text>
            <Text component="span" fw={500} c="dark">
              {cardCount}
            </Text>{' '}
            {cardCount === 1 ? 'card' : 'cards'}
          </Text>
          
          <Text>
            <Text component="span" fw={500} c="dark">
              {masteredCount}
            </Text>{' '}
            mastered
          </Text>
        </Group>
      </Box>

      <Divider mb="xl" />

      {/* Action Buttons */}
      <Group mb="xl">
        <Button
          leftSection={<Brain size={16} />}
          onClick={() => setShowGenerateForm(true)}
          color="purple"
          variant="filled"
        >
          Generate Cards
        </Button>
        
        <Button
          leftSection={<Plus size={16} />}
          onClick={() => setShowCreateCardModal(true)}
          variant="light"
        >
          Add Card Manually
        </Button>
      </Group>

      <Stack gap="xl">
        {/* AI Generation Form */}
        {showGenerateForm && !generatedCards && (
          <GenerateCardsForm
            deckId={deckId}
            deckName={deck?.name}
            onGenerate={handleGenerateCards}
            loading={generatingCards}
          />
        )}

        {/* Generated Cards Preview */}
        {generatedCards && (
          <CardPreview
            generatedData={generatedCards}
            onAccept={handleAcceptCards}
            onReject={handleRejectCards}
            loading={savingCards}
          />
        )}

        {/* Existing Cards */}
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={3} size="h4">
                Cards in this Deck
              </Title>
              <Text c="dimmed" size="sm">
                {cardCount} {cardCount === 1 ? 'card' : 'cards'}
              </Text>
            </Group>
            
            {cardCount === 0 ? (
              <Card
                withBorder
                padding="xl"
                radius="md"
                style={{ borderStyle: 'dashed' }}
              >
                <Center>
                  <Stack align="center" gap="md">
                    <ThemeIcon size={60} variant="light" color="gray">
                      <FileText size={30} />
                    </ThemeIcon>
                    
                    <Stack align="center" gap="xs">
                      <Title order={4} c="dimmed">
                        No cards yet
                      </Title>
                      <Text size="sm" c="dimmed" ta="center">
                        Generate or create your first card to get started
                      </Text>
                    </Stack>
                    
                    <Group>
                      <Button 
                        leftSection={<Brain size={16} />}
                        onClick={() => setShowGenerateForm(true)}
                        color="purple"
                      >
                        Generate with AI
                      </Button>
                      <Button 
                        leftSection={<Plus size={16} />}
                        onClick={() => setShowCreateCardModal(true)}
                        variant="light"
                      >
                        Create Manually
                      </Button>
                    </Group>
                  </Stack>
                </Center>
              </Card>
            ) : (
              <CardList 
                cards={deck.cards}
                onEdit={handleEditCard}
                onDelete={handleDeleteCard}
                onReview={handleReviewCard}
              />
            )}
          </Stack>
        </Card>
      </Stack>

      {/* Create Card Modal */}
      {showCreateCardModal && (
        <CreateCardModal
          deckId={deckId}
          deckName={deck?.name}
          onClose={() => setShowCreateCardModal(false)}
          onSubmit={handleCreateCard}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && reviewCard && (
        <Modal
          opened={showReviewModal}
          onClose={handleCloseReview}
          title={`Review: ${deck?.name}`}
          size="lg"
          centered
        >
          <FlashCard
            card={reviewCard}
            onNext={handleReviewNext}
            onMarkDifficulty={handleReviewNext}
          />
        </Modal>
      )}
    </Box>
  );
};

export default DeckDetail;
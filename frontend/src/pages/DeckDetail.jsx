import {
  Alert,
  Badge,
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
import { AlertCircle, BookOpen, Brain, Clock, FileText, Play, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CardPreview from '../components/ai/CardPreview';
import GenerateCardsForm from '../components/ai/GenerateCardsForm';
import CardList from '../components/cards/CardList';
import CreateCardModal from '../components/cards/CreateCardModal';
import ReviewHistory from '../components/review/reviewHistory';
import ReviewSession from '../components/review/reviewSession';
import { useReview, useReviewQueue } from '../hooks/useReview';
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
  
  // Review States
  const [showReviewSession, setShowReviewSession] = useState(false);
  const [showReviewHistory, setShowReviewHistory] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Custom hooks
  const { loadDeckQueue, queue: reviewQueue, queueLength } = useReviewQueue();
  const review = useReview();

  useEffect(() => {
    loadDeck();
    loadReviewQueue();
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

  const loadReviewQueue = async () => {
    if (deckId) {
      await loadDeckQueue(deckId);
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
        await Promise.all([loadDeck(), loadReviewQueue()]);
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
      await Promise.all([loadDeck(), loadReviewQueue()]);
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
    // Start a single card review session
    setSelectedCard(card);
    review.startSession();
    setShowReviewSession(true);
  };

  const handleShowReviewHistory = (card) => {
    setSelectedCard(card);
    setShowReviewHistory(true);
  };

  const handleDeleteCard = async (card) => {
    if (window.confirm(`Are you sure you want to delete this card: "${card.question}"?`)) {
      const result = await cardService.deleteCard(card.id);
      if (result.success) {
        await Promise.all([loadDeck(), loadReviewQueue()]);
      } else {
        setError(result.error);
      }
    }
  };

  const handleStartReviewSession = () => {
    if (queueLength > 0) {
      review.startSession();
      setShowReviewSession(true);
    }
  };

  const handleReviewComplete = (sessionStats) => {
    setShowReviewSession(false);
    review.endSession();
    
    // Refresh data after review session
    Promise.all([loadDeck(), loadReviewQueue()]);
    
    // Show completion message or navigate
    console.log('Review session completed:', sessionStats);
  };

  const handleReviewExit = () => {
    setShowReviewSession(false);
    setSelectedCard(null);
    review.resetSession();
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
  const reviewableCount = queueLength;

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
          <Group gap="xs">
            <FileText size={16} />
            <Text>
              <Text component="span" fw={500} c="dark">
                {cardCount}
              </Text>{' '}
              {cardCount === 1 ? 'card' : 'cards'}
            </Text>
          </Group>
          
          <Group gap="xs">
            <BookOpen size={16} />
            <Text>
              <Text component="span" fw={500} c="dark">
                {masteredCount}
              </Text>{' '}
              mastered
            </Text>
          </Group>

          {reviewableCount > 0 && (
            <Group gap="xs">
              <Clock size={16} />
              <Text>
                <Text component="span" fw={500} c="orange">
                  {reviewableCount}
                </Text>{' '}
                due for review
              </Text>
            </Group>
          )}
        </Group>
      </Box>

      <Divider mb="xl" />

      {/* Action Buttons */}
      <Group mb="xl">
        {/* Review Session Button */}
        {reviewableCount > 0 && (
          <Button
            leftSection={<Play size={16} />}
            onClick={handleStartReviewSession}
            color="blue"
            variant="filled"
            size="md"
          >
            Start Review ({reviewableCount} cards)
          </Button>
        )}

        <Button
          leftSection={<Brain size={16} />}
          onClick={() => setShowGenerateForm(true)}
          color="purple"
          variant={reviewableCount > 0 ? "light" : "filled"}
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

      {/* Review Status Card */}
      {cardCount > 0 && (
        <Card withBorder mb="xl" p="md">
          <Group justify="space-between">
            <Stack gap={4}>
              <Text fw={500}>Review Status</Text>
              <Group gap="lg">
                <Group gap="xs">
                  <Badge variant="light" color="green">
                    {masteredCount} Mastered
                  </Badge>
                  <Badge variant="light" color="blue">
                    {cardCount - masteredCount - reviewableCount} Learning
                  </Badge>
                  {reviewableCount > 0 && (
                    <Badge variant="filled" color="orange">
                      {reviewableCount} Due Now
                    </Badge>
                  )}
                </Group>
              </Group>
            </Stack>
            
            {reviewableCount === 0 && cardCount > 0 && (
              <Group gap="xs" c="green">
                <Text size="sm" fw={500}>All caught up!</Text>
              </Group>
            )}
          </Group>
        </Card>
      )}

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
        <Stack gap="md">
          
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
              onShowHistory={handleShowReviewHistory}
            />
          )}
        </Stack>
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

      {/* Review Session Modal */}
      {showReviewSession && (
        <Modal
          opened={showReviewSession}
          onClose={handleReviewExit}
          title="Review Session"
          size="xl"
          centered
          fullScreen
        >
          <ReviewSession
            deckId={deckId}
            deckName={deck?.name}
            initialCards={selectedCard ? [selectedCard] : reviewQueue}
            onComplete={handleReviewComplete}
            onExit={handleReviewExit}
          />
        </Modal>
      )}

      {/* Review History Modal */}
      {showReviewHistory && selectedCard && (
        <ReviewHistory
          cardId={selectedCard.id}
          cardInfo={selectedCard}
          opened={showReviewHistory}
          onClose={() => {
            setShowReviewHistory(false);
            setSelectedCard(null);
          }}
        />
      )}
    </Box>
  );
};

export default DeckDetail;
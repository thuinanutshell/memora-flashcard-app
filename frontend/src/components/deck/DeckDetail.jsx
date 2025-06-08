import { useEffect, useState } from 'react';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getOneDeckWithCards } from '../../api/deckApi';
import useAuth from '../../hooks/useAuth';
import CardModalsManager from '../card/CardModalsManager';
import CardSection from '../card/CardSection';

function DeckDetail() {
  const { deckId } = useParams();
  const { token } = useAuth();

  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Add debug log to see if token exists
  console.log("DeckDetail token:", !!token);

  const fetchDeck = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOneDeckWithCards(token, deckId);
      setDeck(response.deck); // Access the nested deck object
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardCreated = async (responseOrCard) => {
    const newCard = responseOrCard.card || responseOrCard;
    
    // Optimistic update
    setDeck(prev => ({
        ...prev,
        cards: [...(prev.cards || []), newCard]
    }));
    
    setShowCreateModal(false);
    await fetchDeck(); // Refresh from backend
  };

  const handleCardUpdated = async (updatedCard) => {
    // Optimistic update
    setDeck(prev => ({
        ...prev,
        cards: prev.cards.map(card => card.id === updatedCard.id ? updatedCard : card)
    }));
    
    setShowEditModal(false);
    setSelectedCard(null);
    await fetchDeck(); // Refresh from backend
  };

  const handleCardDeleted = async (cardId) => {
    // Optimistic update
    setDeck(prev => ({
        ...prev,
        cards: prev.cards.filter(card => card.id !== cardId)
    }));
    
    setShowDeleteModal(false);
    setSelectedCard(null);
    await fetchDeck(); // Refresh from backend
  };

  useEffect(() => {
    if (token && deckId) fetchDeck();
  }, [token, deckId]);

  if (loading) return (
    <Container className="py-5 text-center">
      <Spinner animation="border" />
    </Container>
  );

  if (error) return (
    <Container className="py-5">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4">{deck?.name} Flashcards</h2>

      <CardSection
        cards={deck?.cards || []}
        token={token}
        onCreateCard={() => setShowCreateModal(true)}
        onEditCard={(card) => { setSelectedCard(card); setShowEditModal(true); }}
        onDeleteCard={(card) => { setSelectedCard(card); setShowDeleteModal(true); }}
      />

      <CardModalsManager
        showCreateModal={showCreateModal}
        showEditModal={showEditModal}
        showDeleteModal={showDeleteModal}
        deckId={deckId}
        selectedCard={selectedCard}
        token={token}
        onCardCreated={handleCardCreated}
        onCardUpdated={handleCardUpdated}
        onCardDeleted={handleCardDeleted}
        onCloseModal={(key) => {
          if (key === 'create') setShowCreateModal(false);
          if (key === 'edit') setShowEditModal(false);
          if (key === 'delete') setShowDeleteModal(false);
          setSelectedCard(null);
        }}
      />
    </Container>
  );
}

export default DeckDetail;
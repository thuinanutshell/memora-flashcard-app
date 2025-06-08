import { useEffect, useState } from 'react';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom'; // Add useNavigate
import { getOneFolderWithDecks } from '../../api/folderApi';
import useAuth from '../../hooks/useAuth';
import DeckModalsManager from '../deck/DeckModalManager';
import DeckSection from '../deck/DeckSection';

function FolderDetail() {
  const { folderId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate(); // Add this

  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchFolder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOneFolderWithDecks(token, folderId);
      console.log('Folder data structure:', data); // Add this
      console.log('Folder name:', data?.name); // Add this
      console.log('Available properties:', Object.keys(data || {})); // Add this
      setFolder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    };

  // Add this handler for deck navigation
  const handleDeckClick = (deckId) => {
    navigate(`/deck/${deckId}`);
  };

  const handleDeckCreated = (responseOrDeck) => {
    const newDeck = responseOrDeck.deck || responseOrDeck;
    
    setFolder(prev => ({
      ...prev,
      decks: [...(prev.decks || []), newDeck]
    }));
    setShowCreateModal(false);
  };

  const handleDeckUpdated = (updatedDeck) => {
    setFolder(prev => ({
      ...prev,
      decks: prev.decks.map(deck => deck.id === updatedDeck.id ? updatedDeck : deck)
    }));
    setShowEditModal(false);
    setSelectedDeck(null);
  };

  const handleDeckDeleted = (deckId) => {
    setFolder(prev => ({
      ...prev,
      decks: prev.decks.filter(deck => deck.id !== deckId)
    }));
    setShowDeleteModal(false);
    setSelectedDeck(null);
  };

  useEffect(() => {
    if (token && folderId) fetchFolder();
  }, [token, folderId]);

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
      <h2 className="mb-4">{folder?.name} Study Decks</h2>

      <DeckSection
        decks={folder.decks || []}
        onCreateDeck={() => setShowCreateModal(true)}
        onDeckClick={handleDeckClick} // ✅ Add this line!
        onEditDeck={(deck) => { setSelectedDeck(deck); setShowEditModal(true); }}
        onDeleteDeck={(deck) => { setSelectedDeck(deck); setShowDeleteModal(true); }}
      />

      <DeckModalsManager
        showCreateModal={showCreateModal}
        showEditModal={showEditModal}
        showDeleteModal={showDeleteModal}
        folderId={folderId}
        selectedDeck={selectedDeck}
        onDeckCreated={handleDeckCreated}
        onDeckUpdated={handleDeckUpdated}
        onDeckDeleted={handleDeckDeleted}
        onCloseModal={(key) => {
          if (key === 'create') setShowCreateModal(false);
          if (key === 'edit') setShowEditModal(false);
          if (key === 'delete') setShowDeleteModal(false);
          setSelectedDeck(null);
        }}
      />
    </Container>
  );
}

export default FolderDetail;
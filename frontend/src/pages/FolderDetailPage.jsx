// src/pages/FolderDetailPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DeckList from '../components/decks/DeckList';
import useDecks from '../hooks/useDecks';
import useFolders from '../hooks/useFolders';

const FolderDetailPage = () => {
  const { folderId } = useParams();
  const [folder, setFolder] = useState(null);
  const [decks, setDecks] = useState([]);
  
  const { getFolder, loading: folderLoading, error: folderError } = useFolders();
  const { 
    createDeck, 
    updateDeck, 
    deleteDeck, 
    loading: deckLoading, 
    error: deckError,
    clearError 
  } = useDecks();

  useEffect(() => {
    const loadFolderAndDecks = async () => {
      try {
        const response = await getFolder(folderId);
        console.log('Full API response:', response); // Debug log
        
        // The response structure is: {data: {folder: {...}}, success: true}
        const folderData = response.data?.folder || response.folder || response;
        const decksData = folderData?.decks || [];
        
        console.log('Extracted folder:', folderData); // Debug log
        console.log('Extracted decks:', decksData); // Debug log
        
        setFolder(folderData);
        setDecks(decksData);
      } catch (error) {
        console.error('Error loading folder:', error);
      }
    };

    if (folderId) {
      loadFolderAndDecks();
    }
  }, [folderId, getFolder]);

  const handleCreateDeck = async (folderId, deckData) => {
    const result = await createDeck(folderId, deckData);
    if (result.success) {
      setDecks(prev => [...prev, result.data.deck]);
    }
  };

  const handleUpdateDeck = async (deckId, updates) => {
    const result = await updateDeck(deckId, updates);
    if (result.success) {
      setDecks(prev => 
        prev.map(deck => 
          deck.id === deckId ? { ...deck, ...result.data.deck } : deck
        )
      );
    }
  };

  const handleDeleteDeck = async (deckId) => {
    const result = await deleteDeck(deckId);
    if (result.success) {
      setDecks(prev => prev.filter(deck => deck.id !== deckId));
    }
  };

  if (folderLoading) {
    return <LoadingSpinner message="Loading folder..." />;
  }

  if (!folder) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <h4 className="text-muted">Folder not found</h4>
          <Link to="/folders" className="btn btn-primary">
            Back to Folders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/folders">Folders</Link>
          </li>
          <li className="breadcrumb-item active">{folder.name}</li>
        </ol>
      </nav>

      <ErrorMessage error={folderError || deckError} onClose={clearError} />

      <DeckList
        folder={folder}
        decks={decks}
        loading={deckLoading}
        error={deckError}
        onCreateDeck={handleCreateDeck}
        onUpdateDeck={handleUpdateDeck}
        onDeleteDeck={handleDeleteDeck}
        clearError={clearError}
      />
    </div>
  );
};

export default FolderDetailPage;
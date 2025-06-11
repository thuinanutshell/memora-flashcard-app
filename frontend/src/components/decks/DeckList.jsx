// src/components/decks/DeckList.jsx
import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import CreateDeckModal from './CreateDeckModal';
import DeckCard from './DeckCard';
import EditDeckModal from './EditDeckModal';

const DeckList = ({ folder, decks, loading, error, onCreateDeck, onUpdateDeck, onDeleteDeck, clearError }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);

  // Debug: Check what folder data we're receiving
  console.log('DeckList folder data:', folder);

  const handleCreateDeck = async (deckData) => {
    try {
      await onCreateDeck(folder.id, deckData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Create deck error:', error);
    }
  };

  const handleEditDeck = (deck) => {
    setEditingDeck(deck);
    setShowEditModal(true);
  };

  const handleUpdateDeck = async (deckData) => {
    try {
      await onUpdateDeck(editingDeck.id, deckData);
      setShowEditModal(false);
      setEditingDeck(null);
    } catch (error) {
      console.error('Update deck error:', error);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    try {
      await onDeleteDeck(deckId);
    } catch (error) {
      console.error('Delete deck error:', error);
    }
  };

  if (loading && decks.length === 0) {
    return <LoadingSpinner message="Loading decks..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Decks in {folder?.name || 'Unknown Folder'}</h3>
          {folder?.description && (
            <p className="text-muted mb-0">{folder.description}</p>
          )}
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          New Deck
        </button>
      </div>

      <ErrorMessage error={error} onClose={clearError} />

      {decks.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-stack display-1 text-muted"></i>
          <h4 className="mt-3 text-muted">No decks yet</h4>
          <p className="text-muted">Create your first deck to start adding flashcards!</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create First Deck
          </button>
        </div>
      ) : (
        <div className="row">
          {decks.map(deck => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onEdit={handleEditDeck}
              onDelete={handleDeleteDeck}
            />
          ))}
        </div>
      )}

      {/* Create Deck Modal */}
      <CreateDeckModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateDeck}
        loading={loading}
        folderName={folder?.name || 'Unknown Folder'}
      />

      {/* Edit Deck Modal */}
      <EditDeckModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingDeck(null);
        }}
        onSubmit={handleUpdateDeck}
        deck={editingDeck}
        loading={loading}
      />
    </div>
  );
};

export default DeckList;
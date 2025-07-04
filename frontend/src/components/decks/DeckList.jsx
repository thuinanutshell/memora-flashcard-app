import { BookOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button';
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

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Decks</h3>
          <p className="text-gray-600">Study decks in this folder</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Deck
        </Button>
      </div>

      {/* Decks Grid */}
      {decks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No decks yet</h4>
          <p className="text-gray-600 mb-4">Create your first deck to start adding cards</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => (
            <DeckCard
              key={deck.id}
              deck={deck}
            />
          ))}
        </div>
      )}

      {/* Create Deck Modal */}
      {showCreateModal && (
        <CreateDeckModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDeck}
        />
      )}
    </div>
  );
};

export default DeckList;
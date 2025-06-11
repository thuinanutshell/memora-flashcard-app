// src/components/decks/DeckDetail.jsx (Updated)
import { Link } from 'react-router-dom';
import useCards from '../../hooks/useCards';
import CardsList from '../cards/CardsList';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

const DeckDetail = ({ deck, loading, error, clearError }) => {
  const { updateCard, deleteCard } = useCards();

  if (loading) {
    return <LoadingSpinner message="Loading deck..." />;
  }

  if (!deck) {
    return (
      <div className="text-center py-5">
        <h4 className="text-muted">Deck not found</h4>
        <Link to="/folders" className="btn btn-primary">
          Back to Folders
        </Link>
      </div>
    );
  }

  const handleEditCard = (card) => {
    window.location.href = `/cards/edit/${card.id}`;
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteCard(cardId);
      // Reload page to refresh cards list
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="container-fluid">
      <ErrorMessage error={error} onClose={clearError} />

      {/* Deck Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav className="mb-2">
            <Link to="/folders" className="text-decoration-none">Folders</Link>
            <span className="mx-2">/</span>
            <Link to={`/folders/${deck.folder_id}`} className="text-decoration-none">Folder</Link>
            <span className="mx-2">/</span>
            <span>{deck.name}</span>
          </nav>
          <h2>{deck.name}</h2>
          {deck.description && (
            <p className="text-muted">{deck.description}</p>
          )}
        </div>
        
        {deck.cards?.length > 0 && (
          <Link to={`/review/${deck.id}`} className="btn btn-success">
            Study Deck
          </Link>
        )}
      </div>

      {/* Simple Stats */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="text-primary">{deck.cards?.length || 0}</h4>
              <p className="mb-0">Total Cards</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="text-success">
                {deck.cards?.filter(card => card.is_fully_reviewed).length || 0}
              </h4>
              <p className="mb-0">Mastered</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h4 className="text-warning">
                {deck.cards?.filter(card => !card.is_fully_reviewed).length || 0}
              </h4>
              <p className="mb-0">Learning</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <CardsList
        deck={deck}
        cards={deck.cards || []}
        loading={false}
        error={null}
        onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
        clearError={() => {}}
      />
    </div>
  );
};

export default DeckDetail;
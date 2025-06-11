// src/components/decks/DeckCard.jsx
import { Link } from 'react-router-dom';

const DeckCard = ({ deck, onEdit, onDelete }) => {
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(deck);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${deck.name}"?`)) {
      onDelete(deck.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="col-md-6 col-lg-4 mb-3">
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0">{deck.name}</h5>
            <div className="dropdown">
              <button 
                className="btn btn-link btn-sm p-0" 
                data-bs-toggle="dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="bi bi-three-dots-vertical"></i>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={handleEdit}>
                    <i className="bi bi-pencil me-2"></i>Edit
                  </button>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleDelete}>
                    <i className="bi bi-trash me-2"></i>Delete
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {deck.description && (
            <p className="card-text text-muted small mb-3">{deck.description}</p>
          )}
          
          <div className="row text-center mb-3">
            <div className="col-6">
              <small className="text-muted">Cards</small>
              <div className="fw-bold text-primary">{deck.cardCount || 0}</div>
            </div>
            <div className="col-6">
              <small className="text-muted">Created</small>
              <div className="fw-bold text-muted small">{formatDate(deck.created_at)}</div>
            </div>
          </div>
        </div>
        
        <div className="card-footer bg-transparent">
          <div className="d-grid gap-2">
            <Link 
              to={`/decks/${deck.id}`} 
              className="btn btn-outline-primary btn-sm"
            >
              <i className="bi bi-eye me-1"></i>
              View Cards
            </Link>
            {deck.cardCount > 0 && (
              <Link 
                to={`/review/${deck.id}`} 
                className="btn btn-outline-success btn-sm"
              >
                <i className="bi bi-play-circle me-1"></i>
                Study Deck
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckCard;
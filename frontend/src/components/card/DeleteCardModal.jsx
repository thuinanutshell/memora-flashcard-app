import { useState } from 'react';
import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import { deleteCard } from '../../api/cardApi';
import useAuth from '../../hooks/useAuth';

function DeleteCardModal({ show, onHide, card, onCardDeleted }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!card) {
      setError('No card selected for deletion');
      return;
    }

    // Get card ID - try multiple possible properties
    const cardId = card?.id || card?._id || card?.card_id;
    console.log('Card ID being used for deletion:', cardId);
    console.log('Available ID properties:', {
      id: card?.id,
      _id: card?._id,
      card_id: card?.card_id
    });
    console.log('Full card object:', card);

    if (!cardId) {
      console.error('No card ID found for deletion!');
      setError('Card ID is missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Deleting card with ID:', cardId);
      
      await deleteCard(token, cardId);
      
      // Notify parent component
      if (onCardDeleted) {
        onCardDeleted(card);
      }
      
      // Close modal
      onHide();
      
    } catch (err) {
      console.error('Error deleting card:', err);
      setError(err.message || 'Failed to delete card');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onHide();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !loading) {
      handleClose();
    } else if (e.key === 'Enter' && !loading) {
      handleDelete();
    }
  };

  if (!card) {
    return null;
  }

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      onKeyDown={handleKeyDown}
      backdrop={loading ? 'static' : true}
      size="sm"
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Delete Card</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <div className="text-center">
          <div className="mb-3">
            <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '3rem' }}></i>
          </div>
          
          <h5 className="mb-3">Are you sure?</h5>
          
          <p className="text-muted mb-3">
            This will permanently delete the card:
          </p>
          
          <div className="bg-light p-3 rounded mb-3">
            <div className="text-start">
              <strong>Question:</strong> {card.question || 'No question'}
            </div>
            {card.answer && (
              <div className="text-start mt-2">
                <strong>Answer:</strong> {card.answer.length > 50 ? `${card.answer.substring(0, 50)}...` : card.answer}
              </div>
            )}
            {card.difficulty_level && (
              <div className="text-start mt-2">
                <strong>Difficulty:</strong> 
                <span className={`ms-1 badge ${
                  card.difficulty_level === 'easy' ? 'bg-success' :
                  card.difficulty_level === 'medium' ? 'bg-warning' : 'bg-danger'
                }`}>
                  {card.difficulty_level.charAt(0).toUpperCase() + card.difficulty_level.slice(1)}
                </span>
              </div>
            )}
          </div>
          
          <p className="text-muted small mb-0">
            This action cannot be undone.
          </p>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="justify-content-center">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                className="me-2"
              />
              Deleting...
            </>
          ) : (
            'Delete Card'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteCardModal;
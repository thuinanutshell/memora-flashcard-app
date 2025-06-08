import { useState } from 'react';
import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';
import { deleteDeck } from '../../api/deckApi';
import useAuth from '../../hooks/useAuth';

function DeleteDeckModal({ show, onHide, deck, onDeckDeleted }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteDeck(token, deck._id || deck.id);
      
      // Notify parent component
      if (onDeckDeleted) {
        onDeckDeleted(deck._id || deck.id);
      }
      
      // Close modal
      onHide();
      
    } catch (err) {
      console.error('Error deleting deck:', err);
      setError(err.message || 'Failed to delete deck');
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

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <ExclamationTriangleFill className="me-2" />
          Delete Deck
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <div className="text-center mb-3">
          <ExclamationTriangleFill className="text-warning mb-3" size={48} />
          <h5>Are you sure you want to delete this deck?</h5>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <h6 className="mb-1">{deck?.name || 'Untitled Deck'}</h6>
          <p className="text-muted mb-2 small">
            {deck?.description || 'No description'}
          </p>
          <div className="d-flex justify-content-between small text-muted">
            <span>{deck?.cardCount || 0} card{(deck?.cardCount || 0) !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <Alert variant="warning" className="small">
          <strong>Warning:</strong> This action cannot be undone. All decks and cards in this folder will also be deleted permanently.
        </Alert>
      </Modal.Body>
      
      <Modal.Footer>
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
            'Delete Deck'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteDeckModal;
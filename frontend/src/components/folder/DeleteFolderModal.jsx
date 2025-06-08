import { useState } from 'react';
import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';
import { deleteFolder } from '../../api/folderApi';
import useAuth from '../../hooks/useAuth';

function DeleteFolderModal({ show, onHide, folder, onFolderDeleted }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteFolder(token, folder._id || folder.id);
      
      // Notify parent component
      if (onFolderDeleted) {
        onFolderDeleted(folder._id || folder.id);
      }
      
      // Close modal
      onHide();
      
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError(err.message || 'Failed to delete folder');
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
          Delete Folder
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
          <h5>Are you sure you want to delete this folder?</h5>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <h6 className="mb-1">{folder?.name || 'Untitled Folder'}</h6>
          <p className="text-muted mb-2 small">
            {folder?.description || 'No description'}
          </p>
          <div className="d-flex justify-content-between small text-muted">
            <span>{folder?.deckCount || 0} deck{(folder?.deckCount || 0) !== 1 ? 's' : ''}</span>
            <span>{folder?.cardCount || 0} card{(folder?.cardCount || 0) !== 1 ? 's' : ''}</span>
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
            'Delete Folder'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteFolderModal;
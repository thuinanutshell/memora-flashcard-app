import { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { updateDeck } from '../../api/deckApi';
import useAuth from '../../hooks/useAuth';

function EditDeckModal({ show, onHide, deck, onDeckUpdated }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Populate form when deck prop changes
  useEffect(() => {
    if (deck) {
      setFormData({
        name: deck.name || '',
        description: deck.description || ''
      });
    }
  }, [deck]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Deck name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const updatedDeck = await updateDeck(token, deck._id || deck.id, {
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      // Notify parent component
      if (onDeckUpdated) {
        onDeckUpdated(updatedDeck);
      }
      
      // Close modal
      onHide();
      
    } catch (err) {
      console.error('Error updating deck:', err);
      setError(err.message || 'Failed to update deck');
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
        <Modal.Title>Edit Deck</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Deck Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter deck name"
              disabled={loading}
              maxLength={100}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter deck description (optional)"
              disabled={loading}
              maxLength={500}
            />
            <Form.Text className="text-muted">
              {formData.description.length}/500 characters
            </Form.Text>
          </Form.Group>
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
            type="submit"
            variant="primary"
            disabled={loading || !formData.name.trim()}
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
                Updating...
              </>
            ) : (
              'Update Deck'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditDeckModal;
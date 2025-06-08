import { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { updateCard } from '../../api/cardApi';
import useAuth from '../../hooks/useAuth';

function EditCardModal({ show, onHide, card, onCardUpdated }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    difficulty_level: ''
  });

  // Initialize form data when card changes
  useEffect(() => {
    if (card) {
      console.log('Card object received:', card);
      console.log('Card ID:', card.id);
      console.log('Card _ID:', card._id);
      console.log('Card card_id:', card.id);
      console.log('All card properties:', Object.keys(card));
      console.log('Full card object structure:', JSON.stringify(card, null, 2));
      
      // Initialize form data with card values
      setFormData({
        question: card.question || '',
        answer: card.answer || '',
        difficulty_level: card.difficulty_level || ''
      });
    }
  }, [card]);

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
    
    // Get card ID - try multiple possible properties
    const cardId = card?.id || card?._id || card?.card_id;
    console.log('Card ID being used for update:', cardId);
    console.log('Available ID properties:', {
      id: card?.id,
      _id: card?._id,
      card_id: card?.card_id
    });
    console.log('Full card object:', card);
    
    if (!cardId) {
      console.error('No card ID found!');
      setError('Card ID is missing');
      return;
    }

    // Check if anything changed
    const hasChanges = 
      formData.question !== (card.question || '') ||
      formData.answer !== (card.answer || '') ||
      formData.difficulty_level !== (card.difficulty_level || '');

    if (!hasChanges) {
      console.log('No changes detected, closing modal');
      onHide();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        difficulty_level: formData.difficulty_level
      };

      console.log('Updating card with data:', updateData);
      
      const updatedCard = await updateCard(token, cardId, updateData);
      
      // Notify parent component with the response from API or merge with existing card
      const finalUpdatedCard = updatedCard || {
        ...card,
        ...updateData
      };
      
      if (onCardUpdated) {
        onCardUpdated(finalUpdatedCard);
      }
      
      // Close modal
      onHide();
      
    } catch (err) {
      console.error('Error updating card:', err);
      setError(err.message || 'Failed to update card');
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
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Edit Card</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Question *</Form.Label>
            <Form.Control
              type="text"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              placeholder="Enter your question"
              disabled={loading}
              maxLength={200}
              required
              autoFocus
            />
            <Form.Text className="text-muted">
              {formData.question.length}/200 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Answer *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="answer"
              value={formData.answer}
              onChange={handleInputChange}
              placeholder="Enter the answer"
              disabled={loading}
              maxLength={1000}
              required
            />
            <Form.Text className="text-muted">
              {formData.answer.length}/1000 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Difficulty Level *</Form.Label>
            <Form.Select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleInputChange}
              disabled={loading}
              required
            >
              <option value="">Select difficulty...</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Form.Select>
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
            disabled={loading || !formData.question.trim() || !formData.answer.trim() || !formData.difficulty_level}
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
              'Update Card'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditCardModal;
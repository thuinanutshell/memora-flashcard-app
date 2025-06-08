import { useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { createCard } from '../../api/cardApi';
import useAuth from '../../hooks/useAuth';

function CreateCardModal({ show, onHide, onCardCreated, deckId }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    difficulty_level: ''
  });

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
    
    // Validation
    if (!formData.question.trim()) {
      setError('Question is required');
      return;
    }
    if (!formData.answer.trim()) {
      setError('Answer is required');
      return;
    }
    if (!formData.difficulty_level) {
      setError('Difficulty level is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const cardData = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        difficulty_level: formData.difficulty_level
      };

      console.log('Creating card with data:', cardData);
      console.log('Deck ID:', deckId);
      
      const response = await createCard(token, deckId, cardData);
      
      // Reset form
      setFormData({ question: '', answer: '', difficulty_level: '' });
      
      // Notify parent component
      if (onCardCreated) {
        onCardCreated(response.card);
      }
      
      // Close modal
      onHide();
      
    } catch (err) {
      console.error('Error creating card:', err);
      setError(err.message || 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form when closing
      setFormData({ question: '', answer: '', difficulty_level: '' });
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

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      onKeyDown={handleKeyDown}
      backdrop={loading ? 'static' : true}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Create New Card</Modal.Title>
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
                Creating...
              </>
            ) : (
              'Create Card'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CreateCardModal;
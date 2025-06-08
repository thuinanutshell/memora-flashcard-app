import { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { createReview } from '../../api/reviewApi';

function ReviewModal({ show, onHide, card, token, onReviewSubmitted }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [reviewResult, setReviewResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log token whenever it changes
  useEffect(() => {
    console.log("ReviewModal received token:", token);
    console.log("Token type:", typeof token);
    console.log("Token length:", token ? token.length : 'N/A');
  }, [token]);

  const handleSubmitReview = async () => {
    console.log("=== DEBUG INFO ===");
    console.log("Submitting review with userAnswer:", userAnswer);
    console.log("Token in handleSubmitReview:", token);
    console.log("Token present:", !!token);
    console.log("Card ID:", card?.id);
    console.log("==================");
    
    if (!card || !userAnswer.trim()) {
      console.error("Card is missing or answer is empty.");
      return;
    }

    if (!token) {
      console.error("No authentication token provided");
      setReviewResult({ error: "Authentication required. Please login again." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("About to call createReview with token:", !!token);
      const result = await createReview(token, card.id, {
        answer: userAnswer.trim()
      });
      console.log("Review API response:", result);
      console.log("Score from response:", result.score);
      setReviewResult(result);
      if (onReviewSubmitted) onReviewSubmitted(result);
    } catch (error) {
      console.error('Review submission failed:', error);
      setReviewResult({ error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setUserAnswer('');
    setReviewResult(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={resetModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Review Flashcard</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Debug info in the UI */}
        <div className="mb-2 p-2 bg-light small text-muted">
          <strong>Debug:</strong> Token present: {token ? '✓' : '✗'}
        </div>
        
        {card && (
          <div>
            <div className="mb-4">
              <h6 className="text-muted mb-2">Question:</h6>
              <p className="fs-5">{card.question || 'No question provided'}</p>
            </div>
            
            <Form.Group className="mb-4">
              <Form.Label>Your Answer:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={!!reviewResult}
              />
            </Form.Group>
            
            {reviewResult && (
              <div className="mb-3">
                <h6 className="text-muted mb-2">Result:</h6>
                {reviewResult.error ? (
                  <Alert variant="danger">{reviewResult.error}</Alert>
                ) : (
                  <>
                    <Alert variant="info">
                      Accuracy Score: {reviewResult.score?.toFixed(1) || 0}%
                    </Alert>
                    <Alert variant="light">
                      <strong>Correct Answer:</strong> {card.answer}
                    </Alert>
                    <div className="text-muted small">
                      Reviews completed: {reviewResult.reviews_completed}/
                      {reviewResult.reviews_completed + reviewResult.reviews_remaining}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!reviewResult ? (
          <>
            <Button variant="secondary" onClick={resetModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmitReview}
              disabled={!userAnswer.trim() || isSubmitting || !token}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={resetModal}>
            Close
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ReviewModal;
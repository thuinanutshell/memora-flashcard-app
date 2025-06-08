import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { ArrowLeft, ArrowRight, CheckCircle } from 'react-bootstrap-icons';
import { getOneDeckWithCards } from '../../api/deckApi';
import { getAllFolders } from '../../api/folderApi';
import { createReview, getDashboardStats } from '../../api/reviewApi';
import useAuth from '../../hooks/useAuth';

function Study() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Cards and review state
  const [cardsToReview, setCardsToReview] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [reviewScore, setReviewScore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stats
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    fetchCardsToReview();
  }, [token]);

  const fetchCardsToReview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get dashboard stats
      const stats = await getDashboardStats(token);
      setDashboardStats(stats);

      // Get all folders
      const folders = await getAllFolders(token);
      
      // Collect all cards that need review
      const allCardsToReview = [];
      
      for (const folder of folders) {
        if (folder.decks) {
          for (const deck of folder.decks) {
            // Get full deck details with cards
            const deckDetails = await getOneDeckWithCards(token, deck.id);
            
            // Filter cards that need review (not fully reviewed and due today or earlier)
            const cardsNeedingReview = deckDetails.cards.filter(card => {
              if (card.is_fully_reviewed) return false;
              
              // If next_review_at is null or undefined, it needs review
              if (!card.next_review_at) return true;
              
              // Check if due today or earlier
              const reviewDate = new Date(card.next_review_at);
              const today = new Date();
              today.setHours(23, 59, 59, 999); // End of today
              
              return reviewDate <= today;
            });
            
            // Add deck and folder info to each card for context
            cardsNeedingReview.forEach(card => {
              allCardsToReview.push({
                ...card,
                deckName: deckDetails.name,
                folderName: folder.name,
                deckId: deck.id
              });
            });
          }
        }
      }

      setCardsToReview(allCardsToReview);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err.message || 'Failed to fetch cards for review');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!userAnswer.trim()) {
      setError('Please provide an answer before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const currentCard = cardsToReview[currentCardIndex];
      const reviewData = {
        answer: userAnswer,
        note: '' // You can add a note field if needed
      };

      const response = await createReview(token, currentCard.id, reviewData);
      
      setReviewScore(response.score);
      setSuccess(`Review submitted! Score: ${response.score.toFixed(1)}%`);
      
      // Show the answer after submission
      setShowAnswer(true);
      
      // Auto-advance after 3 seconds if not the last card
      if (currentCardIndex < cardsToReview.length - 1) {
        setTimeout(() => {
          handleNextCard();
        }, 3000);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < cardsToReview.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setUserAnswer('');
      setReviewScore(null);
      setSuccess(null);
      setError(null);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      setUserAnswer('');
      setReviewScore(null);
      setSuccess(null);
      setError(null);
    }
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  const currentCard = cardsToReview[currentCardIndex];

  return (
    <Container className="p-4" style={{ maxWidth: '1200px' }}>
      <h1 className="mb-4">Study Session</h1>
        
        {/* Dashboard Stats */}
        {dashboardStats && (
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Due Today</h5>
                  <h2 className="text-primary">{dashboardStats.cards_due_today}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Due This Week</h5>
                  <h2 className="text-warning">{dashboardStats.cards_due_this_week}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Due This Month</h5>
                  <h2 className="text-info">{dashboardStats.cards_due_this_month}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {cardsToReview.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <CheckCircle size={64} className="text-success mb-3" />
              <h3>No cards due for review!</h3>
              <p>Great job! You're all caught up. Check back later for more reviews.</p>
            </Card.Body>
          </Card>
        ) : currentCard && (
          <>
            {/* Progress indicator */}
            <div className="mb-3">
              <small className="text-muted">
                Card {currentCardIndex + 1} of {cardsToReview.length} | 
                {' '}{currentCard.folderName} / {currentCard.deckName}
              </small>
              <div className="progress mt-2">
                <div 
                  className="progress-bar" 
                  style={{ width: `${((currentCardIndex + 1) / cardsToReview.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Card Display */}
            <Card className="mb-4">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Question</span>
                  <div>
                    <Badge bg="secondary" className="me-2">
                      Difficulty: {currentCard.difficulty || 'Medium'}
                    </Badge>
                    <Badge bg="info">
                      Review {currentCard.review_count + 1}/5
                    </Badge>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <h4 className="mb-4">{currentCard.question}</h4>
                
                {/* Answer Input */}
                <Form.Group className="mb-3">
                  <Form.Label>Your Answer:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={showAnswer || isSubmitting}
                  />
                </Form.Group>

                {/* Submit Button */}
                {!showAnswer && (
                  <Button 
                    variant="primary" 
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || !userAnswer.trim()}
                    className="mb-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </Button>
                )}

                {/* Show Answer and Score */}
                {showAnswer && (
                  <div className="mt-4">
                    <hr />
                    <div className="mb-3">
                      <h5>Correct Answer:</h5>
                      <p className="bg-light p-3 rounded">{currentCard.answer}</p>
                    </div>
                    
                    {reviewScore !== null && (
                      <div className="text-center">
                        <h5>Your Score:</h5>
                        <Badge 
                          bg={getScoreBadgeVariant(reviewScore)} 
                          className="fs-3 p-3"
                        >
                          {reviewScore.toFixed(1)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between">
              <Button 
                variant="outline-secondary"
                onClick={handlePreviousCard}
                disabled={currentCardIndex === 0}
              >
                <ArrowLeft className="me-2" />
                Previous
              </Button>
              
              <Button 
                variant="outline-primary"
                onClick={handleNextCard}
                disabled={currentCardIndex === cardsToReview.length - 1}
              >
                Next
                <ArrowRight className="ms-2" />
              </Button>
            </div>

            {/* Completion Message */}
            {currentCardIndex === cardsToReview.length - 1 && showAnswer && (
              <Alert variant="success" className="mt-4 text-center">
                <CheckCircle size={24} className="me-2" />
                Great job! You've completed all cards due for review today.
              </Alert>
            )}
          </>
        )}
      </Container>
  );
}

export default Study;
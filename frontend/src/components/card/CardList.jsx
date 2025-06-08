import { useState } from 'react';
import { Badge, Button, Card, Col, Modal, Row } from 'react-bootstrap';
import {
    Calendar,
    CardText,
    CheckCircle,
    PencilSquare,
    PlayFill,
    Plus,
    QuestionCircle,
    Trash
} from 'react-bootstrap-icons';
import ReviewModal from '../review/ReviewModal';

function CardList({ cards, onCreateCard, onCardClick, onEditCard, onDeleteCard, token }) {
  const [showCardModal, setShowCardModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  console.log("CardList received token:", !!token); // Debug log

  const getDifficultyVariant = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowCardModal(true);
    if (onCardClick) onCardClick(card.id || card._id);
  };

  const handleReviewClick = (card, e) => {
    e.stopPropagation();
    setSelectedCard(card);
    setShowReviewModal(true);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-0">
            {cards && cards.length > 0 ? (
              <>
                {cards.length} Card{cards.length !== 1 ? 's' : ''}
              </>
            ) : (
              'No Cards'
            )}
          </h5>
          {cards && cards.length > 0 && (
            <small className="text-muted">
              Click on a card to view details
            </small>
          )}
        </div>
        
        <Button
          variant="primary"
          onClick={onCreateCard}
          className="d-flex align-items-center"
        >
          <Plus className="me-2" size={16} />
          Add Card
        </Button>
      </div>

      {cards && cards.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {cards.map((card, index) => (
            <Col key={card.id || card._id || `card-${index}`}>
              <Card
                className="h-100 shadow-sm flashcard-item position-relative"
                style={{ 
                  borderLeft: `4px solid ${
                    card.difficulty_level === 'easy' ? '#198754' :
                    card.difficulty_level === 'medium' ? '#ffc107' :
                    card.difficulty_level === 'hard' ? '#dc3545' : '#6c757d'
                  }`, 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease-in-out' 
                }}
                onClick={() => handleCardClick(card)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Action buttons - top right */}
                <div className="position-absolute top-0 end-0 p-2 d-flex gap-1" style={{ zIndex: 10 }}>
                  <button
                    className="btn btn-sm btn-outline-secondary border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCard && onEditCard(card);
                    }}
                    title="Edit Card"
                    style={{ opacity: 0.7 }}
                    onMouseEnter={(e) => e.target.style.opacity = 1}
                    onMouseLeave={(e) => e.target.style.opacity = 0.7}
                  >
                    <PencilSquare size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger border-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCard && onDeleteCard(card);
                    }}
                    title="Delete Card"
                    style={{ opacity: 0.7 }}
                    onMouseEnter={(e) => e.target.style.opacity = 1}
                    onMouseLeave={(e) => e.target.style.opacity = 0.7}
                  >
                    <Trash size={14} />
                  </button>
                </div>

                <Card.Body className="pe-5 d-flex flex-column">
                  {/* Question */}
                  <div className="d-flex align-items-start mb-3">
                    <QuestionCircle className="text-primary me-2 mt-1 flex-shrink-0" size={18} />
                    <div className="flex-grow-1">
                      <Card.Title className="mb-1 h6 fw-bold">
                        {truncateText(card.question, 80) || 'No question'}
                      </Card.Title>
                    </div>
                  </div>

                  {/* Answer preview (hidden) */}
                  <Card.Text className="text-muted small mb-3 flex-grow-1" style={{ minHeight: '2.5rem', lineHeight: '1.4' }}>
                    Click to view answer
                  </Card.Text>

                  {/* Difficulty and status badges */}
                  <div className="mb-3 d-flex flex-wrap gap-2">
                    <Badge 
                      bg={getDifficultyVariant(card.difficulty_level)}
                      className="text-uppercase"
                      style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}
                    >
                      {card.difficulty_level || 'Unknown'}
                    </Badge>
                    
                    {card.is_fully_reviewed && (
                      <Badge bg="success" className="d-flex align-items-center">
                        <CheckCircle size={12} className="me-1" />
                        Mastered
                      </Badge>
                    )}
                  </div>

                  {/* Review stats */}
                  <div className="mb-3">
                    <small className="text-muted d-flex align-items-center justify-content-between">
                      <span className="d-flex align-items-center">
                        <Calendar size={12} className="me-1" />
                        {card.review_count || 0} review{(card.review_count || 0) !== 1 ? 's' : ''}
                      </span>
                      
                      {card.next_review_at && !card.is_fully_reviewed && (
                        <span className="text-info">
                          Next: {formatDate(card.next_review_at)}
                        </span>
                      )}
                    </small>
                  </div>

                  {/* Review button - at the bottom */}
                  <div className="mt-auto">
                    <Button
                      variant={card.is_fully_reviewed ? "outline-success" : "success"}
                      size="sm"
                      className="w-100 d-flex align-items-center justify-content-center"
                      onClick={(e) => handleReviewClick(card, e)}
                      disabled={!token}
                    >
                      <PlayFill className="me-2" size={16} />
                      {card.is_fully_reviewed ? 'Review Again' : 'Start Review'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <CardText className="text-muted mb-3" size={48} />
            <Card.Text className="text-muted mb-3 h5">No cards yet in this deck</Card.Text>
            <Card.Text className="text-muted mb-4">
              Create your first flashcard to start studying and reviewing.
            </Card.Text>
            <Button 
              variant="primary" 
              onClick={onCreateCard} 
              className="d-flex align-items-center mx-auto"
            >
              <Plus className="me-2" size={16} />
              Create Your First Card
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Card Detail Modal */}
      <Modal show={showCardModal} onHide={() => setShowCardModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Flashcard Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCard && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2">Question:</h6>
                <p className="fs-5">{selectedCard.question || 'No question provided'}</p>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">Answer:</h6>
                <p className="fs-5">{selectedCard.answer || 'No answer provided'}</p>
              </div>
              
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg={getDifficultyVariant(selectedCard.difficulty_level)}>
                  Difficulty: {selectedCard.difficulty_level || 'Unknown'}
                </Badge>
                <Badge bg="info">
                  Reviews: {selectedCard.review_count || 0}
                </Badge>
                {selectedCard.is_fully_reviewed && (
                  <Badge bg="success">
                    Mastered
                  </Badge>
                )}
              </div>
              
              {selectedCard.next_review_at && (
                <p className="text-muted small">
                  Next review: {formatDate(selectedCard.next_review_at)}
                </p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCardModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Review Modal */}
      <ReviewModal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        card={selectedCard}
        token={token}
        onReviewSubmitted={(result) => {
          console.log('Review submitted:', result);
        }}
      />
    </div>
  );
}

export default CardList;
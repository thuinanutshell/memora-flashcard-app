import { Button, Card, Col, Row } from 'react-bootstrap';
import { FolderFill, PencilSquare, Plus, Trash } from 'react-bootstrap-icons';

function DeckList({ decks, onCreateDeck, onDeckClick, onEditDeck, onDeleteDeck }) {
    const handleActionClick = (e, action, deck) => {
        e.stopPropagation();
        if (action === 'edit' && onEditDeck) onEditDeck(deck);
        else if (action === 'delete' && onDeleteDeck) onDeleteDeck(deck);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button
                    variant="primary"
                    onClick={onCreateDeck}
                    className="d-flex align-items-center"
                >
                    <Plus className="me-2" size={16} />
                    Add Deck
                </Button>
            </div>
            {decks && decks.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {decks.map((deck, index) => (
                        <Col key={deck._id || deck.id || `deck-${index}`}>
                            <Card
                                className="h-100 shadow-sm deck-card position-relative"
                                style={{ borderLeft: '4px solid #0d6efd', cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}
                                onClick={() => onDeckClick && onDeckClick(deck._id || deck.id)}
                                onMouseEnter={(e) => e.target.closest('.deck-card').style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.target.closest('.deck-card').style.transform = 'translateY(0)'}
                            >
                                <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditDeck(deck);
                                        }}
                                        title="Edit Deck"
                                    >
                                        <PencilSquare size={16} />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteDeck(deck);
                                        }}
                                        title="Delete Deck"
                                    >
                                        <Trash size={16}/>
                                    </button>
                                </div>
                                <Card.Body className="pe-5">
                                    <div className="d-flex align-items-start mb-3">
                                        <FolderFill className="text-primary me-2 mt-1" size={20} />
                                        <div className="flex-grow-1">
                                            <Card.Title className="mb-1 h5">
                                                {deck.name || 'Untitled Deck'}
                                            </Card.Title>
                                        </div>
                                    </div>

                                    <Card.Text className="text-muted mb-3" style={{ minHeight: '2.5rem' }}>
                                        {deck.description || 'No description provided'}
                                    </Card.Text>
                                </Card.Body>

                                <Card.Footer className="bg-transparent border-0 d-flex justify-content-between pt-0">
                                    <small className="text-muted d-flex align-items-center">
                                        <strong>{deck.cardCount || 0}</strong>
                                        <span className="ms-1">card{(deck.cardCount || 0) !== 1 ? 's' : ''}</span>
                                    </small>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Card className="shadow-sm">
                    <Card.Body className="text-center py-5">
                        <FolderFill className="text-muted mb-3" size={48} />
                        <Card.Text className="text-muted mb-3 h5">You don't have any decks yet.</Card.Text>
                        <Card.Text className="text-muted mb-4">Create your first deck to organize your flashcard cards.</Card.Text>
                        <Button variant="primary" onClick={onCreateDeck} className="d-flex align-items-center mx-auto">
                            <Plus className="me-2" size={16} />
                            Create Your First Deck
                        </Button>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
}

export default DeckList;
import { Alert, Container, Spinner } from 'react-bootstrap';
import CardList from '../card/CardList';

function CardSection({ 
  cards, 
  token,  // Add token to the props
  onCreateCard, 
  onEditCard, 
  onDeleteCard, 
  onCardClick,
  loading = false,
  error = null,
  deckName = null
}) {
  // Debug log to check if token is received
  console.log("CardSection received token:", !!token);

  if (loading) {
    return (
      <section>
        <Container className="mb-4">
          <div className="text-center py-5">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="text-muted">Loading cards...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <Container className="mb-4">
          <Alert variant="danger" className="text-center">
            <Alert.Heading>Error Loading Cards</Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
        </Container>
      </section>
    );
  }

  return (
    <section>
      <Container className="mb-4">
        {deckName && (
          <div className="mb-4">
            <h2 className="h4 text-muted mb-0">Cards in</h2>
            <h1 className="h3 mb-0">{deckName}</h1>
            <hr className="mt-3 mb-4" />
          </div>
        )}
        
        <CardList 
          cards={cards}
          token={token}  // Pass the token to CardList
          onCreateCard={onCreateCard}
          onEditCard={onEditCard}
          onDeleteCard={onDeleteCard}
          onCardClick={onCardClick}
        />
      </Container>
    </section>
  );
}

export default CardSection;
// src/components/review/DeckReviewList.jsx
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

const DeckReviewList = ({ folders, loading, error, clearError }) => {
  if (loading) {
    return <LoadingSpinner message="Loading review options..." />;
  }

  console.log('Folders received in DeckReviewList:', folders);

  // Get all decks with cards that need review
  const reviewableDecks = [];
  folders.forEach((folder) => {
    console.log(`Processing folder: ${folder.name}`);
    console.log(`Folder decks:`, folder.decks);
    
    if (folder.decks && Array.isArray(folder.decks)) {
      folder.decks.forEach((deck, index) => {
        console.log(`Processing deck ${index}:`, deck);
        console.log(`Deck name: ${deck.name}`);
        console.log(`Deck cardCount: ${deck.cardCount}`);
        console.log(`cardCount > 0? ${deck.cardCount > 0}`);
        
        // Check if deck has cards available for review
        if (deck.cardCount > 0) {
          const reviewableDeck = {
            ...deck,
            folderName: folder.name
          };
          reviewableDecks.push(reviewableDeck);
          console.log(`✅ Added deck "${deck.name}" to reviewable decks:`, reviewableDeck);
        } else {
          console.log(`❌ Skipped deck "${deck.name}" - cardCount is ${deck.cardCount}`);
        }
      });
    } else {
      console.log(`❌ Folder "${folder.name}" has no decks array`);
    }
  });

  console.log('Final reviewableDecks array:', reviewableDecks);
  console.log('reviewableDecks.length:', reviewableDecks.length);

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Choose a Deck to Review</h2>
      
      <ErrorMessage error={error} onClose={clearError} />

      {reviewableDecks.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-card-text display-1 text-muted"></i>
          <h4 className="mt-3 text-muted">No decks available for review</h4>
          <p className="text-muted">Create some flashcards first!</p>
          <a href="/folders" className="btn btn-primary">
            Go to Folders
          </a>
        </div>
      ) : (
        <div className="row">
          {reviewableDecks.map(deck => (
            <div key={deck.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{deck.name}</h5>
                  <p className="card-text text-muted small">
                    From: {deck.folderName}
                  </p>
                  {deck.description && (
                    <p className="card-text small">{deck.description}</p>
                  )}
                  
                  <div className="mb-3">
                    <small className="text-muted">Cards: </small>
                    <span className="fw-bold">{deck.cardCount}</span>
                  </div>
                </div>
                
                <div className="card-footer bg-transparent">
                  <div className="d-grid">
                    <a 
                      href={`/review/${deck.id}`}
                      className="btn btn-success"
                    >
                      <i className="bi bi-play-circle me-1"></i>
                      Start Review
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckReviewList;
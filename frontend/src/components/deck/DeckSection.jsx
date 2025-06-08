import { Container } from 'react-bootstrap';
import DeckList from '../deck/DeckList';

function DeckSection ({ decks, onCreateDeck, onEditDeck, onDeleteDeck, onDeckClick }) {
    // Ensure each deck has a proper card count
    const decksWithCardCount = decks.map(deck => ({
        ...deck,
        // Calculate card count from various possible sources
        cardCount: deck.cardCount || deck.card_count || deck.cards?.length || 0,
        // Also ensure cards array exists
        cards: deck.cards || []
    }));

    console.log("DeckSection - Processing decks:", decksWithCardCount); // Debug log

    return (
        <section>
            <Container className="mb-4">
                <DeckList 
                    decks={decksWithCardCount}
                    onCreateDeck={onCreateDeck}
                    onEditDeck={onEditDeck}
                    onDeleteDeck={onDeleteDeck}
                    onDeckClick={onDeckClick}
                />
            </Container>
        </section>
    )
};

export default DeckSection;
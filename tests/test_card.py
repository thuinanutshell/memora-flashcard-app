import pytest

class TestCardRoutes:
    """Test suite for card logic and routes.
    The test cases that need to be passed are:
    
    POST: create a new card
        - Question does not yet exist in the deck (maybe a deck needs to be created first?)
        - Question, answer, diffulty level (easy, medium, hard), next_review_at, review_count, 
          is_fully_reviewed, and last_reviewed are saved
        - Success message: "Added a new card"
        - Status code: 201
          
    GET: retrieve a new card
        - A card is successfully retrieved when all its information including
        id, question, answer, difficulty_level, next_review_at, and review_count
        - Success message: "Card {card.id} is retrieved"
        - Status code: 200
        
    PATCH: update a new card    
        - The question or answer or difficulty level are updated
        - Success message: "Updated card {card.id}"
        - Status code: 200

    DELETE: delete a new card
        - Status code: 200
    """
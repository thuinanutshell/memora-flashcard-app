from models.base import db
from models.card import Card
from models.review import Review
from sentence_transformers import SentenceTransformer, util
from datetime import datetime, timedelta


def semantic_similarity(user_answer, correct_answer):
    """Logic to compute the accuracy score of user answer vs. the correct answer of the card

    Args:
        user_answer (str): The answer the user submits from the client side
        correct_answer (str): The correct answer saved in the server side

    Returns:
        percentage (float): The accuracy score
    """
    print(f"User answer: '{user_answer.strip()}'")
    print(f"Correct answer: '{correct_answer.strip()}'")

    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode([user_answer.strip(), correct_answer.strip()])
    similarity_tensor = util.cos_sim(embeddings[0], embeddings[1])

    # Extract the actual similarity value from the tensor
    similarity_score = similarity_tensor.item()
    print(f"Similarity score: {similarity_score}")

    # Convert to percentage
    percentage = similarity_score * 100
    print(f"Percentage: {percentage}")

    return percentage


class ReviewService:
    REQUIRED_REVIEWS = 3
    INTERVALS = [1, 7, 21]

    @staticmethod
    def submit_review(card_id, user_id, review_data):
        card = Card.query.get(card_id)
        if not card:
            raise ValueError("Card not found")

        # Get the user's answer and score from the client
        user_answer = review_data.get("answer")
        score = semantic_similarity(user_answer, card.answer)

        # Add a new review event to the Review table
        review = Review(
            card_id=card_id,
            user_answer=user_answer,
            reviewed_at=datetime.utcnow(),
            score=float(score),
            user_id=user_id,
        )

        # Update the review count and the time the card is reviewed
        card.review_count += 1
        card.last_reviewed = datetime.utcnow()

        # Logic to compute the spaced repetition interval
        if card.review_count >= ReviewService.REQUIRED_REVIEWS:
            card.is_fully_reviewed = True
            card.next_review_at = None
        else:
            interval_days = ReviewService.INTERVALS[card.review_count - 1]
            card.next_review_at = card.last_reviewed + timedelta(days=interval_days)

        db.session.add(review)
        db.session.commit()

        return {
            "data": {
                "review_id": review.id,
                "score": score,
                "next_review_at": card.next_review_at,
            }
        }

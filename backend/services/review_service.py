from datetime import datetime, timedelta
from typing import Optional


class ReviewService:
    INTERVALS = [1, 7, 21]  # days
    REQUIRED_REVIEWS = 3

    @staticmethod
    def calculate_next_review_date(card) -> Optional[datetime]:
        # If a card is fully reviewed (meaning the user has reviewed it at least 3 times)
        if card.review_count >= ReviewService.REQUIRED_REVIEWS:
            return None

        # Get the interval from the current review count
        interval_days = ReviewService.INTERVALS[card.review_count]

        # Calculate from card creation date for consistency
        return card.created_at + timedelta(days=interval_days)

    @staticmethod
    def get_review_stage(review_count: int) -> str:
        if review_count == 0:
            return "New"
        elif review_count == 1:
            return "First Review"
        elif review_count == 2:
            return "Second Review"
        elif review_count >= 3:
            return "Fully Reviewed"
        else:
            return "Unknown"

    @staticmethod
    def is_card_due(card) -> bool:
        if card.is_fully_reviewed:
            return False
        if not card.next_review_at:
            return True

        return datetime.utcnow() >= card.next_review_at

    @staticmethod
    def get_cards_due_for_review(user_id: str):
        from models import Card, Deck, Folder

        return (
            Card.query.join(Deck)
            .join(Folder)
            .filter(
                Folder.user_id == user_id,
                Card.is_fully_reviewed == False,
                Card.next_review_at <= datetime.utcnow(),
            )
            .order_by(Card.next_review_at.asc())
            .all()
        )

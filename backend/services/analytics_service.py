from models.base import db
from models.folder import Folder
from models.deck import Deck
from models.card import Card
from models.user import User
from models.review import Review
from datetime import datetime, timedelta


class AnalyticsService:

    # Statistics by folder (showing the accuracy trend of all decks)
    @staticmethod
    def get_stats_one_folder(user_id, folder_id):
        """Logic to get the data for all decks in a folder,
        which is then visualized in a line graph
        """
        folder = Folder.query.filter_by(id=folder_id, user_id=user_id).first()
        if not folder:
            raise ValueError("Folder not found")

        # Get accuracy over time for each deck in the folder
        accuracy_by_deck = {}
        for deck in folder.decks:
            reviews = (
                Review.query.join(Card)
                .filter(Card.deck_id == deck.id)
                .order_by(Review.reviewed_at.asc())
                .all()
            )
            accuracy_by_deck[deck.name] = [
                {"timestamp": r.reviewed_at.isoformat(), "score": round(r.score, 1)}
                for r in reviews
            ]

        # Get total of cards fully reviewed & not fully reviewed
        total_fully_reviewed = (
            Card.query.join(Deck)
            .filter(Deck.folder_id == folder.id, Card.is_fully_reviewed == True)
            .count()
        )
        total_not_fully_reviewed = (
            Card.query.join(Deck)
            .filter(Deck.folder_id == folder.id, Card.is_fully_reviewed == False)
            .count()
        )

        return {
            "data": {
                "folder_name": folder.name,
                "accuracy_graph": accuracy_by_deck,
                "full_reviewed_cards": total_fully_reviewed,
                "remaining_cards": total_not_fully_reviewed,
            }
        }

    # Statistics by deck (showing average accuracy score & improvement over time)
    @staticmethod
    def get_stats_one_deck(user_id, deck_id):
        deck = (
            Deck.query.join(Folder)
            .filter(Deck.id == deck_id, Folder.user_id == user_id)
            .first()
        )
        if not deck:
            raise ValueError("Deck not found")

        all_reviews = (
            Review.query.join(Card)
            .filter(Card.deck_id == deck.id)
            .order_by(Review.reviewed_at.asc())
            .all()
        )

        # Score history for this deck
        accuracy_graph = [
            {"timestamp": r.reviewed_at.isoformat(), "score": round(r.score, 1)}
            for r in all_reviews
        ]

        # Average score
        avg_score = (
            sum(r.score for r in all_reviews) / len(all_reviews) if all_reviews else 0
        )

        # Fully reviewed cards in this deck
        total_fully_reviewed = Card.query.filter_by(
            deck_id=deck.id, is_fully_reviewed=True
        ).count()
        total_not_fully_reviewed = Card.query.filter_by(
            deck_id=deck.id, is_fully_reviewed=False
        ).count()

        return {
            "data": {
                "deck_name": deck.name,
                "accuracy_graph": accuracy_graph,
                "average_score": round(avg_score, 1),
                "full_reviewed_cards": total_fully_reviewed,
                "remaining_cards": total_not_fully_reviewed,
            }
        }

    # General Stats
    @staticmethod
    def get_general_stats(user_id):
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")

        all_folders = Folder.query.filter_by(user_id=user_id).all()
        all_decks = Deck.query.join(Folder).filter(Folder.user_id == user_id).all()
        all_reviews = Review.query.filter_by(user_id=user_id).all()

        # Calculate study streak
        reviewed_dates = sorted(
            {r.reviewed_at.date() for r in all_reviews}, reverse=True
        )
        streak = 0
        today = datetime.utcnow().date()

        # Check if user has any reviews
        if not reviewed_dates:
            streak = 0
        else:
            # Check if user studied today or yesterday to start counting streak
            if reviewed_dates[0] == today:
                # Start counting from today
                for i, d in enumerate(reviewed_dates):
                    if (today - timedelta(days=i)) == d:
                        streak += 1
                    else:
                        break
            elif reviewed_dates[0] == today - timedelta(days=1):
                # Start counting from yesterday
                for i, d in enumerate(reviewed_dates):
                    if (today - timedelta(days=i + 1)) == d:
                        streak += 1
                    else:
                        break
            else:
                # No recent activity, streak is 0
                streak = 0

        return {
            "data": {
                "id": user_id,
                "total_folders": len(all_folders),
                "total_decks": len(all_decks),
                "total_reviews": len(all_reviews),
                "streak": streak,
            }
        }

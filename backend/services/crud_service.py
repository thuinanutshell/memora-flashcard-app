from models.folder import Folder
from models.deck import Deck
from models.card import Card
from models.base import db
from datetime import datetime, timedelta
from sqlalchemy import func


class CRUDService:
    # CREATION LOGIC
    @staticmethod
    def add_new_folder(folder_data, user_id):
        name = folder_data.get("name")
        description = folder_data.get("description")

        if not name:
            raise ValueError("Folder name is required")

        new_folder = Folder(name=name, description=description, user_id=user_id)
        db.session.add(new_folder)
        db.session.commit()
        return {
            "data": {
                "id": new_folder.id,
                "name": new_folder.name,
                "description": new_folder.description,
            }
        }

    @staticmethod
    def add_new_deck(deck_data, folder_id, user_id):
        name = deck_data.get("name")
        description = deck_data.get("description")

        if not name:
            raise ValueError("Deck name is required")

        folder = Folder.query.filter_by(id=folder_id, user_id=user_id).first()
        if not folder:
            raise ValueError("Folder not found")

        # Check for duplicate in the same folder
        existing_deck = Deck.query.filter(
            db.func.lower(Deck.name) == db.func.lower(name), Deck.folder_id == folder_id
        ).first()

        if existing_deck:
            raise ValueError("Deck name already exists")

        new_deck = Deck(
            name=name,
            description=description,
            folder_id=folder_id,
            created_at=datetime.utcnow(),
        )
        db.session.add(new_deck)
        db.session.commit()
        return {
            "data": {
                "id": new_deck.id,
                "name": new_deck.name,
                "description": new_deck.description,
            }
        }

    @staticmethod
    def add_new_card(card_data, deck_id, user_id):
        deck = (
            Deck.query.join(Folder)
            .filter(Deck.id == deck_id, Folder.user_id == user_id)
            .first()
        )
        if not deck:
            raise ValueError("Deck is not found")
        required_fields = ["question", "answer", "difficulty_level"]
        for field in required_fields:
            if field not in card_data or card_data[field] is None:
                raise ValueError(f"{field} is required")

        # Check for duplicate in the same deck
        if Card.query.filter_by(
            deck_id=deck_id, question=card_data.get("question")
        ).first():
            raise ValueError("Question already exists")

        # If the card is created for the first time,
        # next review should be in the next 24 hours
        next_review_at = datetime.utcnow() + timedelta(days=1)
        review_count = card_data.get("review_count", 0)

        new_card = Card(
            question=card_data.get("question"),
            answer=card_data.get("answer"),
            difficulty_level=card_data.get("difficulty_level"),
            next_review_at=next_review_at,
            review_count=review_count,
            is_fully_reviewed=False,
            deck_id=deck_id,
        )
        db.session.add(new_card)
        db.session.commit()
        return {
            "data": {
                "id": new_card.id,
                "question": new_card.question,
                "answer": new_card.answer,
                "difficulty_level": new_card.difficulty_level,
            }
        }

    # READ LOGIC
    @staticmethod
    def get_all_folders(user_id):
        # Query all folders for the user with deck and card counts
        folders_query = (
            db.session.query(
                Folder,
                func.count(Deck.id).label("deck_count"),
                func.count(Card.id).label("card_count"),
            )
            .outerjoin(Deck, Folder.id == Deck.folder_id)
            .outerjoin(Card, Deck.id == Card.deck_id)
            .filter(Folder.user_id == user_id)
            .group_by(Folder.id)
            .all()
        )

        folder_list = []

        for folder, deck_count, card_count in folders_query:
            folder_info = {
                "id": folder.id,
                "name": folder.name,
                "description": folder.description,
                "deckCount": deck_count or 0,
                "cardCount": card_count or 0,
            }
            folder_list.append(folder_info)

        return {"data": folder_list}

    @staticmethod
    def get_one_folder(folder_id, user_id):
        # Get all decks for a single folder
        folder = Folder.query.filter_by(id=folder_id, user_id=user_id).first()
        if folder:
            all_decks = Deck.query.filter_by(folder_id=folder_id).all()

            # Serialize all decks data
            decks_list = [
                {
                    "id": deck.id,
                    "name": deck.name,
                    "description": deck.description,
                    "card_count": len(deck.cards),
                }
                for deck in all_decks
            ]

            return {
                "data": {
                    "id": folder.id,
                    "name": folder.name,
                    "description": folder.description,
                    "decks": decks_list,
                }
            }
        else:
            raise ValueError("Folder does not exist")

    @staticmethod
    def get_one_deck(deck_id, user_id):
        # Get all cards for a single deck
        deck = (
            Deck.query.join(Folder)
            .filter(Deck.id == deck_id, Folder.user_id == user_id)
            .first()
        )
        if deck:
            all_cards = Card.query.filter_by(deck_id=deck_id).all()

            # Serialize all cards data
            cards_list = [
                {
                    "id": card.id,
                    "question": card.question,
                    "answer": card.answer,
                    "difficulty_level": card.difficulty_level,
                    "next_review_at": card.next_review_at,
                    "review_count": card.review_count,
                    "is_fully_reviewed": card.is_fully_reviewed,
                    "last_reviewed_at": card.last_reviewed_at,
                }
                for card in all_cards
            ]

            return {
                "data": {
                    "id": deck.id,
                    "name": deck.name,
                    "description": deck.description,
                    "cards": cards_list,
                }
            }
        else:
            raise ValueError("Deck does not exist")

    @staticmethod
    def get_one_card(card_id, user_id):
        # Get information for a single card
        card = Card.query.filter_by(id=card_id).first()

        # Join Card -> Deck -> Folder to verify ownership
        card = (
            Card.query.join(Deck)
            .join(Folder)
            .filter(Card.id == card_id, Folder.user_id == user_id)
            .first()
        )

        if not card:
            raise ValueError("Card does not exist")

        if card:
            card_info = {
                "id": card.id,
                "question": card.question,
                "answer": card.answer,
                "difficulty_level": card.difficulty_level,
                "next_review_at": card.next_review_at,
                "review_count": card.review_count,
                "is_fully_reviewed": card.is_fully_reviewed,
            }
            return {"data": card_info}
        else:
            raise ValueError("Card does not exist")

    # UPDATE LOGIC
    @staticmethod
    def update_one_folder(folder_id, user_id, update_data):
        folder = Folder.query.filter_by(id=folder_id, user_id=user_id).first()
        if folder is None:
            raise ValueError("Folder does not exist")

        name = update_data.get("name")
        description = update_data.get("description")

        if name:
            folder.name = name
        if description is not None:
            folder.description = description

        db.session.commit()

        return {
            "data": {
                "id": folder.id,
                "name": folder.name,
                "description": folder.description,
            }
        }

    @staticmethod
    def update_one_deck(deck_id, update_data, user_id):
        deck = (
            Deck.query.join(Folder)
            .filter(Deck.id == deck_id, Folder.user_id == user_id)
            .first()
        )
        if deck is None:
            raise ValueError("Deck does not exist")

        name = update_data.get("name")
        description = update_data.get("description")

        if name:
            existing_deck = Deck.query.filter(
                db.func.lower(Deck.name) == db.func.lower(name),
                Deck.folder_id == deck.folder_id,
                Deck.id != deck_id,
            ).first()
            if existing_deck:
                raise ValueError("Deck name already exists")

        if description is not None:
            deck.description = description

        deck.updated_at = datetime.utcnow()

        db.session.commit()

        return {
            "data": {
                "id": deck.id,
                "name": deck.name,
                "description": deck.description,
            }
        }

    @staticmethod
    def update_one_card(card_id, user_id, update_data):
        card = (
            Card.query.join(Deck)
            .join(Folder)
            .filter(Card.id == card_id, Folder.user_id == user_id)
            .first()
        )
        if card is None:
            raise ValueError("Folder does not exist")

        question = update_data.get("question")
        answer = update_data.get("answer")
        difficulty_level = update_data.get("difficulty_level")

        if question:
            existing = Card.query.filter(
                Card.deck_id == card.deck_id,
                Card.question == question,
                Card.id != card.id,
            ).first()
            if existing:
                raise ValueError("Question already exists")
            card.question = question

        if answer:
            card.answer = answer
        if difficulty_level:
            card.difficulty_level = difficulty_level

        db.session.commit()

        return {
            "data": {
                "id": card.id,
                "question": card.question,
                "answer": card.answer,
                "difficulty_level": card.difficulty_level,
            }
        }

    # DELETE LOGIC
    @staticmethod
    def delete_one_folder(folder_id, user_id):
        folder = Folder.query.filter_by(id=folder_id, user_id=user_id).first()
        if folder:
            db.session.delete(folder)
            db.session.commit()
        else:
            raise ValueError("Folder does not exist")

    @staticmethod
    def delete_one_deck(deck_id, user_id):
        deck = (
            Deck.query.join(Folder)
            .filter(Deck.id == deck_id, Folder.user_id == user_id)
            .first()
        )
        if deck:
            db.session.delete(deck)
            db.session.commit()
        else:
            raise ValueError("Deck does not exist")

    @staticmethod
    def delete_one_card(card_id, user_id):
        card = Card.query.filter_by(id=card_id).first()
        card = (
            Card.query.join(Deck)
            .join(Folder)
            .filter(Card.id == card_id, Folder.user_id == user_id)
            .first()
        )
        if card:
            db.session.delete(card)
            db.session.commit()
        else:
            raise ValueError("Card does not exist")

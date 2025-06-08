from flask import Flask, Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, User, Folder, Deck, Card, Review
from backend.services.review_service import ReviewService
from datetime import datetime, timedelta
from sentence_transformers import SentenceTransformer, util

review_bp = Blueprint("review", __name__)


def semantic_similarity(user_answer, correct_answer):
    """Logic to compute the accuracy score of user answer vs. the correct answer of the card"""
    # Debug prints to see what we're comparing
    print(f"User answer: '{user_answer.strip()}'")
    print(f"Correct answer: '{correct_answer.strip()}'")

    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode([user_answer.strip(), correct_answer.strip()])
    similarity_tensor = util.cos_sim(embeddings[0], embeddings[1])

    # Extract the actual similarity value from the tensor
    similarity_score = similarity_tensor.item()  # Use .item() to get the scalar value

    # Debug print to see the similarity score
    print(f"Similarity score: {similarity_score}")

    # Convert to percentage
    percentage = similarity_score * 100
    print(f"Percentage: {percentage}")

    return percentage


@review_bp.route("/<int:card_id>", methods=["POST"])
@jwt_required()
def submit_review(card_id):
    """Logic to add a new review event for a card

    - First, the card is verified the ownership by joining the Deck and Folder tables
    - Then, we get the user answer from the client side
    - Then, compute the accuracy score for the user's input
    """
    current_user_id = get_jwt_identity()

    card = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Card.id == card_id, Folder.user_id == current_user_id)
        .first()
    )
    if not card:
        return jsonify({"error": "Card not found"}), 404

    data = request.get_json()
    user_answer = data.get("answer")

    # Validate that user_answer is provided
    if user_answer is None:
        return jsonify({"error": "Answer is required"}), 400

    # Compute the score of user's input
    score = semantic_similarity(user_answer, card.answer)
    note = data.get("note")

    # Add the review event to the database
    review = Review(
        card_id=card_id,
        user_answer=user_answer,
        reviewed_at=datetime.utcnow(),
        score=float(score),
        note=note,
    )

    # Update card review tracking by incrementing review count by 1 and update the last review date
    card.review_count += 1
    card.last_reviewed = datetime.utcnow()

    # Calculate next review date or mark as fully reviewed
    # Check AFTER incrementing the review count
    if card.review_count >= ReviewService.REQUIRED_REVIEWS:
        card.is_fully_reviewed = True
        card.next_review_at = None
    else:
        card.next_review_at = ReviewService.calculate_next_review_date(card)

    db.session.add(review)
    db.session.commit()

    response_data = {
        "message": "Review recorded successfully",
        "score": round(float(score), 1),
        "review_stage": ReviewService.get_review_stage(card.review_count),
        "reviews_completed": card.review_count,
        "reviews_remaining": max(0, ReviewService.REQUIRED_REVIEWS - card.review_count),
        "is_fully_reviewed": card.is_fully_reviewed,
    }

    if not card.is_fully_reviewed:
        response_data["next_review_date"] = card.next_review_at.isoformat()

    return jsonify(response_data), 201


@review_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    """Logic to get the total number of cards due in 3 different intervals across folders"""
    current_user_id = get_jwt_identity()

    today = datetime.utcnow().date()
    week_later = today + timedelta(days=7)
    month_later = today + timedelta(days=30)

    # Query all cards for the current user that have not been reviewed fully
    base_query = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Folder.user_id == current_user_id, Card.is_fully_reviewed == False)
    )

    # Cards due today
    cards_today = base_query.filter(Card.next_review_at <= today).count()

    # Cards due in 7 days
    cards_week = base_query.filter(
        Card.next_review_at > today, Card.next_review_at <= week_later
    ).count()

    # Cards due in 30 days
    cards_month = base_query.filter(
        Card.next_review_at > week_later, Card.next_review_at <= month_later
    ).count()

    return (
        jsonify(
            {
                "cards_due_today": cards_today,
                "cards_due_this_week": cards_week,
                "cards_due_this_month": cards_month,
            }
        ),
        200,
    )


@review_bp.route("/stats/general", methods=["GET"])
@jwt_required()
def get_general_stats():
    """Logic to get the general statistics across folders"""
    current_user_id = get_jwt_identity()

    folders = Folder.query.filter_by(user_id=current_user_id).all()

    # Get all reviews for a specific folder
    all_reviews = (
        Review.query.join(Card)
        .join(Deck)
        .join(Folder)
        .filter(Folder.user_id == current_user_id)
        .order_by(Review.reviewed_at.asc())
        .all()
    )

    # Compute the overal average accuracy score for the folder
    avg_score = (
        sum(r.score for r in all_reviews) / len(all_reviews) if all_reviews else 0
    )

    # Compute the total number of cards fully reviewed for a specific folder
    total_fully_reviewed = (
        Card.query.join(Deck)
        .join(Folder)
        .filter(Folder.user_id == current_user_id, Card.is_fully_reviewed == True)
        .count()
    )

    # Score history per folder
    accuracy_by_folder = {}
    for folder in folders:
        reviews = (
            Review.query.join(Card)
            .join(Deck)
            .filter(Deck.folder_id == folder.id)
            .order_by(
                Review.reviewed_at.asc()
            )  # order by reviewed time from earliest to latest
            .all()
        )

        # Get the accuracy score at all timestampes for each folder
        accuracy_by_folder[folder.name] = [
            {"timestamp": r.reviewed_at.isoformat(), "score": round(r.score, 1)}
            for r in reviews
        ]

    # Study streak (consecutive days)
    # First sort all the review dates from latest to earliest
    reviewed_dates = sorted({r.reviewed_at.date() for r in all_reviews}, reverse=True)
    streak = 0
    today = datetime.utcnow().date()
    for i, d in enumerate(reviewed_dates):
        if (today - timedelta(days=i)) == d:
            streak += 1
        else:
            break

    return (
        jsonify(
            {
                "average_score": round(avg_score, 1),
                "fully_reviewed_cards": total_fully_reviewed,
                "study_streak": streak,
                "accuracy_graph": accuracy_by_folder,
            }
        ),
        200,
    )


@review_bp.route("/stats/folder/<int:folder_id>", methods=["GET"])
@jwt_required()
def get_folder_stats(folder_id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.filter_by(id=folder_id, user_id=current_user_id).first()

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    decks = folder.decks

    all_reviews = (
        Review.query.join(Card)
        .join(Deck)
        .filter(Deck.folder_id == folder.id)
        .order_by(Review.reviewed_at.asc())
        .all()
    )

    # Score history of accuracy score per deck
    accuracy_by_deck = {}
    for deck in decks:
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

    # Average score for a deck
    avg_score = (
        sum(r.score for r in all_reviews) / len(all_reviews) if all_reviews else 0
    )

    # Total number of cards fully reviewed for a deck
    total_fully_reviewed = (
        Card.query.join(Deck)
        .filter(Deck.folder_id == folder.id, Card.is_fully_reviewed == True)
        .count()
    )

    reviewed_dates = sorted({r.reviewed_at.date() for r in all_reviews}, reverse=True)
    streak = 0
    today = datetime.utcnow().date()
    for i, d in enumerate(reviewed_dates):
        if (today - timedelta(days=i)) == d:
            streak += 1
        else:
            break

    return (
        jsonify(
            {
                "folder_name": folder.name,
                "average_score": round(avg_score, 1),
                "fully_reviewed_cards": total_fully_reviewed,
                "study_streak": streak,
                "accuracy_graph": accuracy_by_deck,
            }
        ),
        200,
    )


@review_bp.route("/stats/deck/<int:deck_id>", methods=["GET"])
@jwt_required()
def get_deck_stats(deck_id):
    current_user_id = get_jwt_identity()
    deck = (
        Deck.query.join(Folder)
        .filter(Deck.id == deck_id, Folder.user_id == current_user_id)
        .first()
    )

    if not deck:
        return jsonify({"error": "Deck not found"}), 404

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

    # Study streak
    reviewed_dates = sorted({r.reviewed_at.date() for r in all_reviews}, reverse=True)
    streak = 0
    today = datetime.utcnow().date()
    for i, d in enumerate(reviewed_dates):
        if (today - timedelta(days=i)) == d:
            streak += 1
        else:
            break

    return (
        jsonify(
            {
                "deck_name": deck.name,
                "average_score": round(avg_score, 1),
                "fully_reviewed_cards": total_fully_reviewed,
                "study_streak": streak,
                "accuracy_graph": accuracy_graph,
            }
        ),
        200,
    )

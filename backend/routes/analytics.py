from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.analytics_service import AnalyticsService

bp_analytics = Blueprint("analytics", __name__)


@bp_analytics.route("/general", methods=["GET"])
@jwt_required()
def get_general_stats():
    """
    Get general user statistics.

    Returns:
    - Total folders, decks, reviews
    - Current study streak
    - User overview metrics
    """
    try:
        user_id = get_jwt_identity()
        result = AnalyticsService.get_general_stats(user_id)

        return (
            jsonify(
                {
                    "message": "General statistics retrieved successfully",
                    "data": result["data"],
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Failed to retrieve statistics"}), 500


@bp_analytics.route("/folder/<int:folder_id>", methods=["GET"])
@jwt_required()
def get_folder_stats(folder_id):
    """
    Get statistics for a specific folder.

    Args:
        folder_id: ID of the folder to analyze

    Returns:
    - Accuracy trends by deck within the folder
    - Fully reviewed vs remaining cards count
    - Folder name and overview
    """
    try:
        user_id = get_jwt_identity()
        result = AnalyticsService.get_stats_one_folder(user_id, folder_id)

        return (
            jsonify(
                {
                    "message": "Folder statistics retrieved successfully",
                    "data": result["data"],
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Failed to retrieve folder statistics"}), 500


@bp_analytics.route("/deck/<int:deck_id>", methods=["GET"])
@jwt_required()
def get_deck_stats(deck_id):
    """
    Get statistics for a specific deck.

    Args:
        deck_id: ID of the deck to analyze

    Returns:
    - Accuracy history over time
    - Average accuracy score
    - Fully reviewed vs remaining cards count
    - Deck name and overview
    """
    try:
        user_id = get_jwt_identity()
        result = AnalyticsService.get_stats_one_deck(user_id, deck_id)

        return (
            jsonify(
                {
                    "message": "Deck statistics retrieved successfully",
                    "data": result["data"],
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Failed to retrieve deck statistics"}), 500


@bp_analytics.route("/progress", methods=["GET"])
@jwt_required()
def get_progress_overview():
    """
    Get user's learning progress overview.

    Query Parameters:
    - timeframe: 'week', 'month', 'all' (default: 'month')

    Returns:
    - Progress metrics over specified timeframe
    - Completion rates
    - Performance trends
    """
    try:
        user_id = get_jwt_identity()
        timeframe = request.args.get("timeframe", "month")

        if timeframe not in ["week", "month", "all"]:
            return (
                jsonify({"error": "Invalid timeframe. Use 'week', 'month', or 'all'"}),
                400,
            )

        # Get general stats as base
        general_stats = AnalyticsService.get_general_stats(user_id)

        progress_data = {
            "timeframe": timeframe,
            "current_streak": general_stats["data"]["streak"],
            "total_reviews": general_stats["data"]["total_reviews"],
            "content_summary": {
                "total_folders": general_stats["data"]["total_folders"],
                "total_decks": general_stats["data"]["total_decks"],
            },
        }

        return (
            jsonify(
                {
                    "message": f"Progress overview for {timeframe} retrieved successfully",
                    "data": progress_data,
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Failed to retrieve progress overview"}), 500
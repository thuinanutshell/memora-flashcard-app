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


@bp_analytics.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_data():
    """
    Get comprehensive dashboard data combining multiple analytics.

    Returns:
    - General stats (streak, totals)
    - Recent activity summary
    - Overall progress indicators
    """
    try:
        user_id = get_jwt_identity()

        # Get general stats
        general_stats = AnalyticsService.get_general_stats(user_id)

        # You can extend this to include more dashboard-specific data
        dashboard_data = {
            "user_overview": general_stats["data"],
            "summary": {
                "study_streak": general_stats["data"]["streak"],
                "total_content": {
                    "folders": general_stats["data"]["total_folders"],
                    "decks": general_stats["data"]["total_decks"],
                    "reviews": general_stats["data"]["total_reviews"],
                },
            },
        }

        return (
            jsonify(
                {
                    "message": "Dashboard data retrieved successfully",
                    "data": dashboard_data,
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Failed to retrieve dashboard data"}), 500


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

        # You can extend AnalyticsService to handle timeframe-specific data
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


@bp_analytics.route("/performance", methods=["GET"])
@jwt_required()
def get_performance_metrics():
    """
    Get detailed performance metrics.

    Query Parameters:
    - folder_id: Filter by specific folder (optional)
    - limit: Number of recent reviews to analyze (default: 100)

    Returns:
    - Accuracy trends
    - Performance by difficulty level
    - Improvement indicators
    """
    try:
        user_id = get_jwt_identity()
        folder_id = request.args.get("folder_id", type=int)
        limit = request.args.get("limit", default=100, type=int)

        if limit < 1 or limit > 1000:
            return jsonify({"error": "Limit must be between 1 and 1000"}), 400

        if folder_id:
            # Get specific folder stats
            result = AnalyticsService.get_stats_one_folder(user_id, folder_id)
            performance_data = {
                "scope": "folder",
                "folder_id": folder_id,
                "accuracy_trends": result["data"]["accuracy_graph"],
                "completion_status": {
                    "fully_reviewed": result["data"]["full_reviewed_cards"],
                    "remaining": result["data"]["remaining_cards"],
                },
            }
        else:
            # Get general performance metrics
            general_stats = AnalyticsService.get_general_stats(user_id)
            performance_data = {
                "scope": "general",
                "total_reviews": general_stats["data"]["total_reviews"],
                "study_consistency": {
                    "current_streak": general_stats["data"]["streak"]
                },
            }

        return (
            jsonify(
                {
                    "message": "Performance metrics retrieved successfully",
                    "data": performance_data,
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Failed to retrieve performance metrics"}), 500

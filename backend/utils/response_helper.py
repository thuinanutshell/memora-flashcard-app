from flask import jsonify
import logging


def success_response(message=None, data=None, status_code=200):
    """Standard success response format

    Args:
        message (str, optional): Success message
        data (dict, optional): Reponse data
        status_code (int): HTTP status code

    Returns:
        tuple: (jsonify response, status_code)
    """
    response = {"success": True}

    if message:
        response["message"] = message
        logging.info(f"Success: {message}")

    if data:
        response["data"] = data

    return jsonify(response), status_code


def error_response(message, code=None, details=None, status_code=400):
    """Standard error response format

    Args:
        message (str): Error message
        code (str, optional): Error code for frontend handling
        details (dict, optional): Additional error details
        status_code (int): HTTP status code

    Returns:
        tuple: (jsonify response, status_code)
    """
    response = {"success": False, "error": {"message": message}}
    if code:
        response["error"]["code"] = code
    if details:
        response["error"]["details"] = details

    logging.error(f"Error: {message} (Code: {code})")
    return jsonify(response), status_code


def data_response(data, message=None, status_code=200):
    """For responses that are primary data like lists

    Args:
        data: The data to return (list, dict, etc.)
        message (str, optional): Optional message
        status_code (int): HTTP status code

    Returns:
        tuple: (jsonify response, status_code)
    """
    if message:
        return success_response(message, data, status_code)
    return jsonify(data), status_code


def validation_error(missing_fields):
    """
    Standard validation error for missing fields

    Args:
        missing_fields (list): List of missing field names

    Returns:
        tuple: (jsonify response, status_code)
    """
    return error_response(
        message=f"Missing required fields: {', '.join(missing_fields)}",
        code="VALIDATION_ERROR",
        details={"missing_fields": missing_fields},
        status_code=400,
    )


def not_found_error(resource_type, resource_id=None):
    """
    Standard not found error

    Args:
        resource_type (str): Type of resource (e.g., "User", "Folder", "Card")
        resource_id (str/int, optional): ID of the resource

    Returns:
        tuple: (jsonify response, status_code)
    """
    message = f"{resource_type} not found"
    if resource_id:
        message += f" (ID: {resource_id})"

    return error_response(message=message, code="RESOURCE_NOT_FOUND", status_code=404)


def duplicate_error(resource_type, field_name):
    """
    Standard duplicate resource error

    Args:
        resource_type (str): Type of resource
        field_name (str): Name of the duplicate field

    Returns:
        tuple: (jsonify response, status_code)
    """
    return error_response(
        message=f"{resource_type} {field_name} already exists",
        code="DUPLICATE_RESOURCE",
        status_code=409,
    )

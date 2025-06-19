"""
Core utilities for logging, error handling, and response formatting
"""
import logging
import traceback
from datetime import datetime
from functools import wraps
from flask import jsonify, request, current_app

def setup_logging(app):
    """
    Configure application logging
    
    Args:
        app: Flask application instance
    """
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO'))
    log_format = app.config.get('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    log_date_format = app.config.get('LOG_DATE_FORMAT', '%Y-%m-%d %H:%M:%S')
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        datefmt=log_date_format
    )
    
    # Configure Flask logger
    app.logger.setLevel(log_level)
    
    # Return configured logger
    return app.logger

class APIResponse:
    """Standardized API response class"""
    
    @staticmethod
    def success(data=None, message="Success", status_code=200):
        """
        Create a success response
        
        Args:
            data: Response payload
            message: Success message
            status_code: HTTP status code
            
        Returns:
            Flask response with standardized format
        """
        response = {
            "status": "success",
            "message": message,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        return jsonify(response), status_code
        
    @staticmethod
    def error(message="An error occurred", errors=None, status_code=400):
        """
        Create an error response
        
        Args:
            message: Error message
            errors: Detailed errors information
            status_code: HTTP status code
            
        Returns:
            Flask response with standardized format
        """
        response = {
            "status": "error",
            "message": message,
            "errors": errors or [],
            "timestamp": datetime.now().isoformat()
        }
        return jsonify(response), status_code

def handle_exceptions(func):
    """
    Decorator to handle exceptions in route handlers
    
    Args:
        func: Function to decorate
        
    Returns:
        Decorated function
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValueError as e:
            current_app.logger.warning(f"Validation error: {str(e)}")
            return APIResponse.error(message=str(e), status_code=400)
        except Exception as e:
            current_app.logger.error(f"Unhandled exception: {str(e)}")
            current_app.logger.error(traceback.format_exc())
            
            # In development, include stack trace
            error_details = traceback.format_exc() if current_app.debug else None
            return APIResponse.error(
                message="An unexpected error occurred",
                errors=[{"type": type(e).__name__, "detail": str(e), "trace": error_details}],
                status_code=500
            )
            
    return wrapper

def validate_json_request(schema=None):
    """
    Decorator to validate JSON request data against a schema
    
    Args:
        schema: Schema class for validation
        
    Returns:
        Decorated function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Ensure request has JSON data
            if not request.is_json:
                return APIResponse.error(
                    message="Request must be JSON",
                    status_code=400
                )
                
            data = request.get_json()
            
            # Validate with schema if provided
            if schema and data:
                try:
                    validated_data = schema().load(data)
                    # Replace request.json with validated data
                    request._validated_json = validated_data
                except Exception as e:
                    return APIResponse.error(
                        message="Validation error",
                        errors=e.messages if hasattr(e, 'messages') else str(e),
                        status_code=400
                    )
                    
            return func(*args, **kwargs)
        return wrapper
    return decorator

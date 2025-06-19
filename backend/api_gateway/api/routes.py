"""
API Gateway routes
Handles API routing, documentation and monitoring
"""
import logging
from flask import Blueprint, jsonify, request

from backend.core.utils import json_response, handle_errors

logger = logging.getLogger(__name__)

# Create blueprint
api_gateway_bp = Blueprint('api_gateway', __name__, url_prefix='/api')

@api_gateway_bp.route('/status', methods=['GET'])
@handle_errors
def api_status():
    """API gateway status endpoint"""
    return json_response({
        'status': 'operational',
        'version': '0.1.0',
        'service': 'api_gateway'
    })

@api_gateway_bp.route('/routes', methods=['GET'])
@handle_errors
def list_routes():
    """List all available API routes"""
    from flask import current_app
    
    routes = []
    
    for rule in current_app.url_map.iter_rules():
        # Skip static routes and error handlers
        if 'static' in rule.endpoint or rule.endpoint.startswith('_'):
            continue
            
        methods = [method for method in rule.methods if method not in ['HEAD', 'OPTIONS']]
        
        routes.append({
            'endpoint': rule.endpoint,
            'methods': methods,
            'path': str(rule),
            'blueprint': rule.endpoint.split('.')[0] if '.' in rule.endpoint else None
        })
    
    # Group by blueprint
    blueprints = {}
    for route in routes:
        blueprint = route['blueprint'] or 'root'
        if blueprint not in blueprints:
            blueprints[blueprint] = []
        blueprints[blueprint].append(route)
    
    return json_response({
        'routes_count': len(routes),
        'blueprints': blueprints
    })

# This will be expanded in future implementations to include:
# - Request validation middleware
# - API documentation generator
# - Rate limiting functionality
# - Response caching mechanism
# - API versioning support
# - Request/response logging
# - API endpoint health monitoring

"""
Event Bus API Routes
Provides REST API endpoints for interacting with the event system
"""
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, g

from backend.core.utils import APIResponse, validate_json_request, handle_exceptions
from backend.event_bus import event_bus
from backend.event_bus.storage import EventStorage
from backend.event_bus.publisher import EventPublisher

logger = logging.getLogger(__name__)

# Create blueprint
event_bus_bp = Blueprint('event_bus', __name__, url_prefix='/api/events')

# Create event publisher for API-generated events
api_publisher = EventPublisher('event_api')

# Event storage for persisting events
event_storage = None

# Event storage initialization flag
_storage_initialized = False

def setup_event_storage():
    """Initialize event storage"""
    global event_storage
    if event_storage is None:
        event_storage = EventStorage()

@event_bus_bp.before_app_request
def ensure_storage_initialized():
    """Ensure event storage is initialized before first request"""
    global _storage_initialized
    if not _storage_initialized:
        setup_event_storage()
        _storage_initialized = True
        # Initialize event bus with storage if not already running
        if not hasattr(event_bus, 'running') or not event_bus.running:
            event_bus.start(event_storage)

@event_bus_bp.route('/', methods=['GET'])
@handle_exceptions
def get_events():
    """
    Get events with filtering
    
    Query parameters:
    - event_type: Optional comma-separated list of event types
    - source_module: Optional source module
    - correlation_id: Optional correlation ID
    - start_time: Optional start time (ISO format)
    - end_time: Optional end time (ISO format)
    - processed: Optional processed status (true/false)
    - limit: Maximum number of events (default 100)
    - offset: Pagination offset (default 0)
    """
    # Parse query parameters
    event_types = request.args.get('event_type')
    if event_types:
        event_types = event_types.split(',')
        
    source_module = request.args.get('source_module')
    correlation_id = request.args.get('correlation_id')
    
    start_time = request.args.get('start_time')
    if start_time:
        try:
            start_time = datetime.fromisoformat(start_time)
        except ValueError:
            return APIResponse.error(message='Invalid start_time format', status_code=400)
            
    end_time = request.args.get('end_time')
    if end_time:
        try:
            end_time = datetime.fromisoformat(end_time)
        except ValueError:
            return APIResponse.error(message='Invalid end_time format', status_code=400)
            
    processed_str = request.args.get('processed')
    processed = None
    if processed_str:
        processed = processed_str.lower() == 'true'
        
    # Pagination
    try:
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
    except ValueError:
        return APIResponse.error(message='Invalid limit or offset', status_code=400)
        
    # Get events from storage
    events = event_storage.get_events(
        event_types=event_types,
        source_module=source_module,
        correlation_id=correlation_id,
        start_time=start_time,
        end_time=end_time,
        processed=processed,
        limit=limit,
        offset=offset
    )
    
    # Return events
    return APIResponse.success(data={
        'events': events,
        'count': len(events),
        'limit': limit,
        'offset': offset
    })

@event_bus_bp.route('/<event_id>', methods=['GET'])
@handle_exceptions
def get_event(event_id):
    """Get a specific event by ID"""
    event = event_storage.get_event(event_id)
    
    if not event:
        return APIResponse.error(message='Event not found', status_code=404)
        
    return APIResponse.success(data=event)

@event_bus_bp.route('/', methods=['POST'])
@handle_exceptions
@validate_json_request({
    'event_type': {'type': 'string', 'required': True},
    'source_module': {'type': 'string', 'required': True},
    'priority': {'type': 'string', 'required': False},
    'correlation_id': {'type': 'string', 'required': False},
    'causation_id': {'type': 'string', 'required': False},
    'data': {'type': 'dict', 'required': True}
})
def publish_event():
    """
    Publish a new event to the event bus
    
    Request body:
    {
        "event_type": "EVENT_TYPE",
        "source_module": "module_name",
        "priority": "normal",
        "correlation_id": "optional_correlation_id",
        "causation_id": "optional_causation_id",
        "data": {
            "key": "value"
        }
    }
    """
    data = request.get_json()
    
    try:
        # Create event publisher for specified module
        source_module = data['source_module']
        publisher = EventPublisher(source_module)
        
        # Publish event
        event_id = publisher.publish(
            event_type=data['event_type'],
            data=data['data'],
            priority=data.get('priority', 'normal'),
            correlation_id=data.get('correlation_id'),
            causation_id=data.get('causation_id')
        )
        
        return APIResponse.success(data={
            'message': 'Event published successfully',
            'event_id': event_id
        }, status_code=201)
        
    except Exception as e:
        logger.error(f"Failed to publish event: {str(e)}", exc_info=True)
        return APIResponse.error(message=str(e), status_code=400)

@event_bus_bp.route('/stats', methods=['GET'])
@handle_exceptions
def get_event_stats():
    """Get event statistics"""
    stats = event_storage.get_event_stats()
    return APIResponse.success(data=stats)

@event_bus_bp.route('/types', methods=['GET'])
@handle_exceptions
def get_event_types():
    """Get list of event types with active subscribers"""
    event_types = event_bus.get_event_types()
    return APIResponse.success(data={'event_types': event_types})

@event_bus_bp.route('/modules', methods=['GET'])
@handle_exceptions
def get_module_subscriptions():
    """
    Get list of modules and their subscriptions
    
    Query parameters:
    - module: Optional module name to filter by
    """
    module_name = request.args.get('module')
    
    if module_name:
        subscriptions = event_bus.get_module_subscriptions(module_name)
        return APIResponse.success(data={
            'module': module_name,
            'subscriptions': subscriptions
        })
    else:
        # Get all module subscriptions
        modules = {}
        for module, subscriptions in event_bus.subscriptions_by_module.items():
            modules[module] = subscriptions
            
        return APIResponse.success(data={'modules': modules})

@event_bus_bp.route('/purge', methods=['POST'])
@handle_exceptions
@validate_json_request({
    'older_than': {'type': 'string', 'required': False},
    'event_types': {'type': 'list', 'required': False},
    'processed_only': {'type': 'boolean', 'required': False, 'default': True}
})
def purge_events():
    """
    Purge events from storage
    
    Request body:
    {
        "older_than": "2023-01-01T00:00:00",
        "event_types": ["EVENT_TYPE1", "EVENT_TYPE2"],
        "processed_only": true
    }
    """
    data = request.get_json()
    
    # Parse older_than parameter
    older_than = data.get('older_than')
    if older_than:
        try:
            older_than = datetime.fromisoformat(older_than)
        except ValueError:
            return APIResponse.error(message='Invalid older_than format', status_code=400)
    
    # Purge events
    count = event_storage.purge_events(
        older_than=older_than,
        event_types=data.get('event_types'),
        processed_only=data.get('processed_only', True)
    )
    
    return APIResponse.success(data={
        'message': f'Successfully purged {count} events',
        'purged_count': count
    })

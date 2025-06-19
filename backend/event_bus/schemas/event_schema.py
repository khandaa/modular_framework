"""
Event message schema definition
Defines the structure and validation rules for event messages
"""
import uuid
from datetime import datetime
from marshmallow import Schema, fields, validates, ValidationError, post_load
from marshmallow.validate import OneOf

# Supported event types
EVENT_TYPES = [
    # User related events
    'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_LOGIN', 'USER_LOGOUT',
    # Module related events
    'MODULE_REGISTERED', 'MODULE_UPDATED', 'MODULE_ACTIVATED', 'MODULE_DEACTIVATED',
    # Role and permission events
    'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED',
    'PERMISSION_GRANTED', 'PERMISSION_REVOKED',
    # System events
    'SYSTEM_STARTUP', 'SYSTEM_SHUTDOWN', 'SYSTEM_ERROR',
    # Generic events
    'DATA_CREATED', 'DATA_UPDATED', 'DATA_DELETED',
    # Custom events - modules can register their own event types
    'CUSTOM'
]

# Event priorities
EVENT_PRIORITIES = ['low', 'normal', 'high', 'critical']

class EventDataSchema(Schema):
    """Schema for event data payload"""
    entity_id = fields.String(required=False, description="ID of the affected entity")
    entity_type = fields.String(required=False, description="Type of the affected entity")
    
    # Flexible fields for different event types
    previous_state = fields.Dict(required=False, description="Previous state of the entity")
    current_state = fields.Dict(required=False, description="Current state of the entity")
    changes = fields.Dict(required=False, description="Changes made to the entity")
    metadata = fields.Dict(required=False, description="Additional metadata for the event")
    
    # Custom data - can be any JSON-serializable object
    custom_data = fields.Raw(required=False, description="Custom data for module-specific events")

class EventSchema(Schema):
    """Schema for event messages"""
    # Core event information
    event_id = fields.String(required=True, description="Unique identifier for the event")
    event_type = fields.String(required=True, validate=OneOf(EVENT_TYPES), 
                              description="Type of the event")
    timestamp = fields.DateTime(required=True, description="When the event occurred")
    
    # Source information
    source_module = fields.String(required=True, description="Module that generated the event")
    source_version = fields.String(required=False, description="Version of the source module")
    
    # Event characteristics
    priority = fields.String(required=False, validate=OneOf(EVENT_PRIORITIES),
                           default='normal', description="Priority of the event")
    idempotency_key = fields.String(required=False, 
                                   description="Key for idempotent event processing")
    
    # Correlation for tracing related events
    correlation_id = fields.String(required=False, 
                                  description="ID for correlating related events")
    causation_id = fields.String(required=False, 
                               description="ID of the event that caused this one")
    
    # Event payload
    data = fields.Nested(EventDataSchema, required=True, description="Event data payload")
    
    @validates('event_type')
    def validate_event_type(self, event_type):
        """
        Validate event type - if custom, ensure it follows naming convention
        """
        if event_type not in EVENT_TYPES and not event_type.startswith('CUSTOM_'):
            raise ValidationError(
                f"Invalid event type. Must be one of {EVENT_TYPES} or start with 'CUSTOM_'"
            )
    
    @post_load
    def make_event(self, data, **kwargs):
        """
        Create event object from validated data
        """
        # Set defaults for missing fields
        if 'event_id' not in data:
            data['event_id'] = str(uuid.uuid4())
        
        if 'timestamp' not in data:
            data['timestamp'] = datetime.utcnow()
        
        if 'priority' not in data:
            data['priority'] = 'normal'
        
        return data

# Shorthand for creating a new event
def create_event(event_type, source_module, data, priority='normal', correlation_id=None):
    """
    Helper function to create a new event
    
    Args:
        event_type: Type of the event
        source_module: Module that generated the event
        data: Event data payload
        priority: Priority of the event
        correlation_id: ID for correlating related events
        
    Returns:
        Validated event object
    """
    event = {
        'event_id': str(uuid.uuid4()),
        'event_type': event_type,
        'timestamp': datetime.utcnow(),
        'source_module': source_module,
        'priority': priority,
        'data': data
    }
    
    if correlation_id:
        event['correlation_id'] = correlation_id
    
    # Validate and return
    return EventSchema().load(event)

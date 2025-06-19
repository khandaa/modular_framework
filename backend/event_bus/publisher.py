"""
Event Publisher Interface
Provides an interface for modules to publish events to the event bus
"""
import logging
from typing import Dict, Any, Optional

from backend.event_bus import event_bus

logger = logging.getLogger(__name__)

class EventPublisher:
    """
    Event Publisher interface for modules to publish events
    Provides a simple interface to publish events while handling validation and routing
    """
    
    def __init__(self, module_name: str, module_version: Optional[str] = None):
        """
        Initialize event publisher
        
        Args:
            module_name: Name of the publishing module
            module_version: Optional version of the module
        """
        self.module_name = module_name
        self.module_version = module_version
        self.logger = logging.getLogger(f"event_publisher.{module_name}")
    
    def publish(self, event_type: str, data: Dict[str, Any], 
               priority: str = 'normal',
               correlation_id: Optional[str] = None,
               causation_id: Optional[str] = None) -> str:
        """
        Publish an event to the event bus
        
        Args:
            event_type: Type of event to publish
            data: Event data payload
            priority: Priority of the event (low, normal, high, critical)
            correlation_id: Optional ID for correlating related events
            causation_id: Optional ID of the event that caused this one
            
        Returns:
            The ID of the published event
        """
        # Prepare event object
        event = {
            'event_type': event_type,
            'source_module': self.module_name,
            'data': data,
            'priority': priority
        }
        
        # Add optional fields if provided
        if self.module_version:
            event['source_version'] = self.module_version
            
        if correlation_id:
            event['correlation_id'] = correlation_id
            
        if causation_id:
            event['causation_id'] = causation_id
        
        # Log publication attempt
        self.logger.debug(
            f"Publishing {priority} event of type '{event_type}' from module '{self.module_name}'"
        )
        
        # Publish to event bus
        try:
            event_id = event_bus.publish(event)
            self.logger.info(f"Published event '{event_type}' with ID {event_id}")
            return event_id
        except Exception as e:
            self.logger.error(f"Failed to publish event '{event_type}': {str(e)}", exc_info=True)
            raise
    
    # Convenience methods for different event priorities
    def publish_low(self, event_type: str, data: Dict[str, Any], 
                   correlation_id: Optional[str] = None) -> str:
        """Publish a low priority event"""
        return self.publish(event_type, data, 'low', correlation_id)
    
    def publish_normal(self, event_type: str, data: Dict[str, Any],
                      correlation_id: Optional[str] = None) -> str:
        """Publish a normal priority event"""
        return self.publish(event_type, data, 'normal', correlation_id)
    
    def publish_high(self, event_type: str, data: Dict[str, Any],
                    correlation_id: Optional[str] = None) -> str:
        """Publish a high priority event"""
        return self.publish(event_type, data, 'high', correlation_id)
    
    def publish_critical(self, event_type: str, data: Dict[str, Any],
                        correlation_id: Optional[str] = None) -> str:
        """Publish a critical priority event"""
        return self.publish(event_type, data, 'critical', correlation_id)

"""
Event Subscriber Interface
Provides an interface for modules to subscribe to events from the event bus
"""
import logging
import inspect
from typing import Dict, Any, List, Callable, Set, Optional

from backend.event_bus import event_bus

logger = logging.getLogger(__name__)

class EventSubscriber:
    """
    Event Subscriber interface for modules to subscribe to events
    Provides a simple interface to subscribe to events with filtering and validation
    """
    
    def __init__(self, module_name: str):
        """
        Initialize event subscriber
        
        Args:
            module_name: Name of the subscribing module
        """
        self.module_name = module_name
        self.subscribed_events: Set[str] = set()
        self.handlers: Dict[str, List[Callable]] = {}
        self.logger = logging.getLogger(f"event_subscriber.{module_name}")
    
    def subscribe(self, event_type: str, handler: Callable, 
                 event_filter: Optional[Callable] = None) -> None:
        """
        Subscribe to events of a specific type
        
        Args:
            event_type: Type of event to subscribe to
            handler: Function to handle the event
            event_filter: Optional filter function to determine if event should be handled
        """
        # Register with event bus
        wrapper = self._create_handler_wrapper(handler, event_filter)
        event_bus.subscribe(event_type, wrapper, self.module_name)
        
        # Keep track of subscriptions
        self.subscribed_events.add(event_type)
        
        if event_type not in self.handlers:
            self.handlers[event_type] = []
            
        self.handlers[event_type].append(handler)
        
        # Log subscription
        self.logger.info(f"Module '{self.module_name}' subscribed to '{event_type}' events")
    
    def unsubscribe(self, event_type: str, handler: Optional[Callable] = None) -> None:
        """
        Unsubscribe from events of a specific type
        
        Args:
            event_type: Type of event to unsubscribe from
            handler: Optional specific handler to unsubscribe, if None all handlers are unsubscribed
        """
        if event_type not in self.subscribed_events:
            self.logger.warning(f"Module '{self.module_name}' not subscribed to '{event_type}' events")
            return
            
        if handler is None:
            # Unsubscribe all handlers for this event type
            if event_type in self.handlers:
                for h in self.handlers[event_type]:
                    # TODO: This doesn't work as expected due to wrapper functions
                    # Will need to maintain a mapping of handlers to wrappers
                    event_bus.unsubscribe(event_type, h)
                    
                del self.handlers[event_type]
                
            self.subscribed_events.remove(event_type)
            self.logger.info(f"Module '{self.module_name}' unsubscribed from all '{event_type}' events")
            
        else:
            # Unsubscribe specific handler
            if event_type in self.handlers:
                if handler in self.handlers[event_type]:
                    # TODO: This doesn't work as expected due to wrapper functions
                    # Will need to maintain a mapping of handlers to wrappers
                    event_bus.unsubscribe(event_type, handler)
                    self.handlers[event_type].remove(handler)
                    
                    if not self.handlers[event_type]:
                        del self.handlers[event_type]
                        self.subscribed_events.remove(event_type)
                        
                    self.logger.info(f"Module '{self.module_name}' unsubscribed handler from '{event_type}' events")
                    
                else:
                    self.logger.warning(f"Handler not registered for '{event_type}' events")
            else:
                self.logger.warning(f"No handlers registered for '{event_type}' events")
    
    def unsubscribe_all(self) -> None:
        """Unsubscribe from all events"""
        event_bus.unsubscribe_module(self.module_name)
        self.subscribed_events.clear()
        self.handlers.clear()
        self.logger.info(f"Module '{self.module_name}' unsubscribed from all events")
    
    def get_subscribed_events(self) -> List[str]:
        """Get list of event types this module is subscribed to"""
        return list(self.subscribed_events)
    
    def _create_handler_wrapper(self, handler: Callable, 
                               event_filter: Optional[Callable] = None) -> Callable:
        """
        Create a wrapper function for the event handler
        
        Args:
            handler: Event handler function
            event_filter: Optional event filter function
            
        Returns:
            Wrapper function that calls the handler
        """
        def wrapper(event: Dict[str, Any]) -> None:
            # Check if event passes filter
            if event_filter is not None:
                try:
                    if not event_filter(event):
                        return
                except Exception as e:
                    self.logger.error(
                        f"Error in event filter for '{event['event_type']}': {str(e)}", 
                        exc_info=True
                    )
                    return
            
            # Get handler signature to determine if it expects the full event or just data
            sig = inspect.signature(handler)
            
            try:
                if len(sig.parameters) == 1:
                    # Handler expects the entire event
                    handler(event)
                else:
                    # Handler expects event data only
                    handler(event['data'])
            except Exception as e:
                self.logger.error(
                    f"Error handling event '{event['event_type']}': {str(e)}", 
                    exc_info=True
                )
        
        return wrapper

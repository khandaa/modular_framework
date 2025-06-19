"""
Event Bus Implementation
Handles event publishing, subscription, and distribution
"""
import json
import logging
import threading
import queue
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import Dict, List, Callable, Any, Optional, Set

from flask import current_app
from marshmallow import ValidationError

from backend.event_bus.schemas.event_schema import EventSchema, create_event
from backend.core.utils import setup_logging

logger = logging.getLogger(__name__)

class EventBus:
    """
    Event Bus for inter-module communication
    Implements the pub/sub pattern with support for:
    - Event filtering by type and properties
    - Asynchronous event processing
    - Event persistence (with configurable storage)
    - Retry mechanisms for failed event processing
    """
    
    def __init__(self, max_workers: int = 5):
        """
        Initialize the event bus
        
        Args:
            max_workers: Maximum number of worker threads for event processing
        """
        self.subscribers: Dict[str, List[Callable]] = {}
        self.subscriptions_by_module: Dict[str, List[str]] = {}
        self.event_queue = queue.Queue()
        self.running = False
        self.max_workers = max_workers
        self.worker_pool = ThreadPoolExecutor(max_workers=max_workers)
        self.schema = EventSchema()
        self.processing_lock = threading.Lock()
        self.processed_events: Set[str] = set()
        self.persistent_storage = None
        
        # Set up dedicated logger
        self.logger = logging.getLogger("event_bus")
        self.logger.setLevel(logging.INFO)
    
    def start(self, persistent_storage=None):
        """
        Start the event bus processing loop
        
        Args:
            persistent_storage: Optional storage backend for event persistence
        """
        if self.running:
            return
            
        self.persistent_storage = persistent_storage
        self.running = True
        self.worker_thread = threading.Thread(target=self._process_events, daemon=True)
        self.worker_thread.start()
        
        self.logger.info("Event bus started")
        
    def stop(self):
        """Stop the event bus processing loop"""
        self.running = False
        self.worker_pool.shutdown(wait=False)
        self.logger.info("Event bus stopped")
    
    def subscribe(self, event_type: str, callback: Callable, module_name: str) -> None:
        """
        Subscribe to events of a specific type
        
        Args:
            event_type: Type of event to subscribe to
            callback: Function to call when event occurs
            module_name: Name of the subscribing module
        """
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
            
        self.subscribers[event_type].append(callback)
        
        # Keep track of which modules are subscribed to which events
        if module_name not in self.subscriptions_by_module:
            self.subscriptions_by_module[module_name] = []
        
        self.subscriptions_by_module[module_name].append(event_type)
        
        self.logger.info(f"Module '{module_name}' subscribed to event type '{event_type}'")
        
    def unsubscribe(self, event_type: str, callback: Callable) -> None:
        """
        Unsubscribe from events of a specific type
        
        Args:
            event_type: Type of event to unsubscribe from
            callback: Callback function to remove
        """
        if event_type in self.subscribers:
            self.subscribers[event_type] = [
                cb for cb in self.subscribers[event_type] if cb != callback
            ]
            
            # Clean up empty subscriber lists
            if not self.subscribers[event_type]:
                del self.subscribers[event_type]
                
            # Update module subscriptions
            for module, events in self.subscriptions_by_module.items():
                if event_type in events:
                    events.remove(event_type)
            
            self.logger.info(f"Unsubscribed from event type '{event_type}'")
            
    def unsubscribe_module(self, module_name: str) -> None:
        """
        Unsubscribe a module from all events
        
        Args:
            module_name: Name of the module to unsubscribe
        """
        if module_name in self.subscriptions_by_module:
            event_types = self.subscriptions_by_module[module_name]
            del self.subscriptions_by_module[module_name]
            
            # This is not very efficient but works for unsubscribing
            # an entire module, which should be a rare operation
            for event_type in event_types:
                if event_type in self.subscribers:
                    # We can't easily identify which callbacks belong to the module
                    # So we'll rely on the module to unsubscribe its specific callbacks
                    pass
                    
            self.logger.info(f"Module '{module_name}' unsubscribed from all events")
            
    def publish(self, event: dict) -> str:
        """
        Publish an event to the event bus
        
        Args:
            event: Event data to publish
            
        Returns:
            event_id: The ID of the published event
        """
        try:
            # Validate event against schema
            validated_event = self.schema.load(event)
            event_id = validated_event['event_id']
            
            # Add to processing queue
            self.event_queue.put(validated_event)
            
            # Log event publication
            self.logger.info(f"Event published: {validated_event['event_type']} (ID: {event_id})")
            
            # Persist event if storage is configured
            if self.persistent_storage:
                self._persist_event(validated_event)
                
            return event_id
            
        except ValidationError as e:
            self.logger.error(f"Invalid event: {e.messages}")
            raise ValueError(f"Invalid event: {e.messages}")
    
    def publish_event(self, event_type: str, source_module: str, data: dict, 
                     priority: str = 'normal', correlation_id: Optional[str] = None) -> str:
        """
        Helper method to create and publish an event
        
        Args:
            event_type: Type of the event
            source_module: Module that generated the event
            data: Event data payload
            priority: Priority of the event
            correlation_id: ID for correlating related events
            
        Returns:
            event_id: The ID of the published event
        """
        event = create_event(
            event_type=event_type,
            source_module=source_module,
            data=data,
            priority=priority,
            correlation_id=correlation_id
        )
        
        return self.publish(event)
    
    def _process_events(self):
        """Background thread for event processing"""
        while self.running:
            try:
                # Get next event from queue (with timeout to allow checking running flag)
                try:
                    event = self.event_queue.get(timeout=0.1)
                except queue.Empty:
                    continue
                
                # Skip already processed events (idempotency)
                event_id = event.get('event_id', '')
                if event_id in self.processed_events:
                    self.logger.debug(f"Skipping already processed event {event_id}")
                    self.event_queue.task_done()
                    continue
                
                # Process the event
                self._distribute_event(event)
                
                # Mark as processed
                with self.processing_lock:
                    self.processed_events.add(event_id)
                
                # Mark task as done
                self.event_queue.task_done()
                
            except Exception as e:
                self.logger.error(f"Error in event processing: {str(e)}", exc_info=True)
    
    def _distribute_event(self, event):
        """
        Distribute an event to all subscribers
        
        Args:
            event: Validated event object
        """
        event_type = event.get('event_type')
        
        # Get subscribers for this event type
        callbacks = self.subscribers.get(event_type, [])
        
        if not callbacks:
            self.logger.debug(f"No subscribers for event type '{event_type}'")
            return
            
        # Process with thread pool
        futures = []
        for callback in callbacks:
            # Submit callback execution to thread pool
            future = self.worker_pool.submit(self._execute_callback, callback, event)
            futures.append(future)
        
        # Log number of subscribers notified
        self.logger.debug(f"Event '{event_type}' (ID: {event.get('event_id')}) "
                         f"distributed to {len(callbacks)} subscribers")
    
    def _execute_callback(self, callback, event):
        """
        Execute a subscriber callback with error handling
        
        Args:
            callback: Subscriber callback function
            event: Event data
        """
        try:
            callback(event)
        except Exception as e:
            event_id = event.get('event_id', 'unknown')
            event_type = event.get('event_type', 'unknown')
            self.logger.error(
                f"Error executing subscriber callback for event '{event_type}' "
                f"(ID: {event_id}): {str(e)}",
                exc_info=True
            )
    
    def _persist_event(self, event):
        """
        Persist event to storage
        
        Args:
            event: Validated event object
        """
        try:
            if self.persistent_storage:
                self.persistent_storage.save_event(event)
        except Exception as e:
            self.logger.error(f"Failed to persist event: {str(e)}", exc_info=True)
    
    def get_event_types(self) -> List[str]:
        """Get list of all event types with subscribers"""
        return list(self.subscribers.keys())
    
    def get_module_subscriptions(self, module_name: str) -> List[str]:
        """Get list of event types a module is subscribed to"""
        return self.subscriptions_by_module.get(module_name, [])

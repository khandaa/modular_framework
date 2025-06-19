"""
Event Bus module for Modular Software Framework
Handles event publishing, subscription, and routing between modules
"""

from backend.event_bus.event_bus import EventBus

# Create singleton instance for application-wide use
event_bus = EventBus()

__all__ = ['event_bus']

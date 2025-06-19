"""
Event storage and persistence
"""
import json
import sqlite3
import logging
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

from flask import current_app, g

logger = logging.getLogger(__name__)

class EventStorage:
    """
    Event storage implementation for persisting events
    Provides methods to save, retrieve, and filter events
    """
    
    def __init__(self, db_path=None):
        """
        Initialize event storage
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self.logger = logging.getLogger("event_storage")
        self._initialize_db()
    
    def _get_db(self):
        """
        Get database connection
        
        Returns:
            SQLite database connection
        """
        if hasattr(g, 'event_db'):
            return g.event_db
            
        if not self.db_path:
            try:
                self.db_path = current_app.config['DATABASE']
            except (RuntimeError, KeyError):
                # Outside Flask context or config not available
                if os.environ.get('FLASK_ENV') == 'testing':
                    self.db_path = ':memory:'
                else:
                    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
                    self.db_path = os.path.join(base_dir, 'database', 'modular_framework.db')
        
        conn = sqlite3.connect(
            self.db_path,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        conn.row_factory = sqlite3.Row
        
        if hasattr(g, 'event_db'):
            g.event_db = conn
            
        return conn
    
    def _initialize_db(self):
        """Initialize event storage database tables"""
        try:
            db = self._get_db()
            cursor = db.cursor()
            
            # Create events table if it doesn't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS events_tx (
                event_id TEXT PRIMARY KEY,
                event_type TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                source_module TEXT NOT NULL,
                source_version TEXT,
                priority TEXT NOT NULL,
                correlation_id TEXT,
                causation_id TEXT,
                data TEXT NOT NULL,
                processed INTEGER DEFAULT 0
            )
            ''')
            
            # Create index on commonly queried fields
            cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_events_type_timestamp 
            ON events_tx (event_type, timestamp)
            ''')
            
            cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_events_correlation 
            ON events_tx (correlation_id)
            ''')
            
            db.commit()
            self.logger.info("Event storage database initialized")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize event storage: {str(e)}", exc_info=True)
            raise
    
    def save_event(self, event: Dict[str, Any]) -> None:
        """
        Save event to storage
        
        Args:
            event: Event object to save
        """
        try:
            db = self._get_db()
            cursor = db.cursor()
            
            # Prepare data for storage
            event_id = event['event_id']
            event_type = event['event_type']
            timestamp = event['timestamp']
            source_module = event['source_module']
            source_version = event.get('source_version')
            priority = event.get('priority', 'normal')
            correlation_id = event.get('correlation_id')
            causation_id = event.get('causation_id')
            
            # JSON serialize the data field
            data = json.dumps(event['data'])
            
            # Insert into database
            cursor.execute(
                '''
                INSERT OR REPLACE INTO events_tx (
                    event_id, event_type, timestamp, source_module, 
                    source_version, priority, correlation_id, 
                    causation_id, data, processed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    event_id, event_type, timestamp, source_module,
                    source_version, priority, correlation_id,
                    causation_id, data, 0
                )
            )
            
            db.commit()
            self.logger.debug(f"Event {event_id} saved to storage")
            
        except Exception as e:
            self.logger.error(f"Failed to save event: {str(e)}", exc_info=True)
            raise
    
    def mark_as_processed(self, event_id: str) -> None:
        """
        Mark an event as processed
        
        Args:
            event_id: ID of the event to mark
        """
        try:
            db = self._get_db()
            cursor = db.cursor()
            
            cursor.execute(
                "UPDATE events_tx SET processed = 1 WHERE event_id = ?",
                (event_id,)
            )
            
            db.commit()
            
        except Exception as e:
            self.logger.error(f"Failed to mark event as processed: {str(e)}", exc_info=True)
            raise
    
    def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific event by ID
        
        Args:
            event_id: ID of the event to retrieve
            
        Returns:
            Event object or None if not found
        """
        try:
            db = self._get_db()
            cursor = db.cursor()
            
            cursor.execute("SELECT * FROM events_tx WHERE event_id = ?", (event_id,))
            row = cursor.fetchone()
            
            if not row:
                return None
                
            return self._row_to_event(row)
            
        except Exception as e:
            self.logger.error(f"Failed to get event: {str(e)}", exc_info=True)
            return None
    
    def get_events(self, 
                  event_types: Optional[List[str]] = None,
                  source_module: Optional[str] = None,
                  correlation_id: Optional[str] = None,
                  start_time: Optional[datetime] = None,
                  end_time: Optional[datetime] = None,
                  processed: Optional[bool] = None,
                  limit: int = 100,
                  offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get events with filtering
        
        Args:
            event_types: Optional list of event types to filter by
            source_module: Optional source module to filter by
            correlation_id: Optional correlation ID to filter by
            start_time: Optional start time for time range filter
            end_time: Optional end time for time range filter
            processed: Optional filter for processed status
            limit: Maximum number of events to return
            offset: Pagination offset
            
        Returns:
            List of event objects
        """
        try:
            db = self._get_db()
            cursor = db.cursor()
            
            query = "SELECT * FROM events_tx WHERE 1=1"
            params = []
            
            # Apply filters
            if event_types:
                placeholders = ','.join(['?' for _ in event_types])
                query += f" AND event_type IN ({placeholders})"
                params.extend(event_types)
                
            if source_module:
                query += " AND source_module = ?"
                params.append(source_module)
                
            if correlation_id:
                query += " AND correlation_id = ?"
                params.append(correlation_id)
                
            if start_time:
                query += " AND timestamp >= ?"
                params.append(start_time)
                
            if end_time:
                query += " AND timestamp <= ?"
                params.append(end_time)
                
            if processed is not None:
                query += " AND processed = ?"
                params.append(1 if processed else 0)
                
            # Add order and pagination
            query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
            params.append(limit)
            params.append(offset)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            return [self._row_to_event(row) for row in rows]
            
        except Exception as e:
            self.logger.error(f"Failed to get events: {str(e)}", exc_info=True)
            return []
    
    def get_unprocessed_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get unprocessed events
        
        Args:
            limit: Maximum number of events to return
            
        Returns:
            List of unprocessed events
        """
        return self.get_events(processed=False, limit=limit)
    
    def get_event_stats(self) -> Dict[str, Any]:
        """
        Get event statistics
        
        Returns:
            Dictionary of event statistics
        """
        try:
            db = self._get_db()
            cursor = db.cursor()
            
            stats = {}
            
            # Total events
            cursor.execute("SELECT COUNT(*) FROM events_tx")
            stats['total_events'] = cursor.fetchone()[0]
            
            # Events by type
            cursor.execute(
                "SELECT event_type, COUNT(*) as count FROM events_tx GROUP BY event_type"
            )
            stats['events_by_type'] = {row[0]: row[1] for row in cursor.fetchall()}
            
            # Events by status
            cursor.execute(
                "SELECT processed, COUNT(*) as count FROM events_tx GROUP BY processed"
            )
            processed_counts = {row[0]: row[1] for row in cursor.fetchall()}
            stats['processed_events'] = processed_counts.get(1, 0)
            stats['unprocessed_events'] = processed_counts.get(0, 0)
            
            # Events by priority
            cursor.execute(
                "SELECT priority, COUNT(*) as count FROM events_tx GROUP BY priority"
            )
            stats['events_by_priority'] = {row[0]: row[1] for row in cursor.fetchall()}
            
            return stats
            
        except Exception as e:
            self.logger.error(f"Failed to get event stats: {str(e)}", exc_info=True)
            return {
                'total_events': 0,
                'events_by_type': {},
                'processed_events': 0,
                'unprocessed_events': 0,
                'events_by_priority': {}
            }
    
    def purge_events(self, 
                    older_than: Optional[datetime] = None,
                    event_types: Optional[List[str]] = None,
                    processed_only: bool = True) -> int:
        """
        Purge events from storage
        
        Args:
            older_than: Optional date to purge events older than
            event_types: Optional list of event types to purge
            processed_only: Whether to only purge processed events
            
        Returns:
            Number of events purged
        """
        try:
            db = self._get_db()
            cursor = db.cursor()
            
            query = "DELETE FROM events_tx WHERE 1=1"
            params = []
            
            if older_than:
                query += " AND timestamp < ?"
                params.append(older_than)
                
            if event_types:
                placeholders = ','.join(['?' for _ in event_types])
                query += f" AND event_type IN ({placeholders})"
                params.extend(event_types)
                
            if processed_only:
                query += " AND processed = 1"
                
            cursor.execute(query, params)
            deleted_count = cursor.rowcount
            db.commit()
            
            self.logger.info(f"Purged {deleted_count} events from storage")
            return deleted_count
            
        except Exception as e:
            self.logger.error(f"Failed to purge events: {str(e)}", exc_info=True)
            return 0
    
    def _row_to_event(self, row) -> Dict[str, Any]:
        """
        Convert database row to event object
        
        Args:
            row: Database row
            
        Returns:
            Event object
        """
        # Convert row to dict
        event = dict(row)
        
        # Parse JSON data field
        if 'data' in event:
            event['data'] = json.loads(event['data'])
            
        # Convert processed to boolean
        if 'processed' in event:
            event['processed'] = bool(event['processed'])
            
        return event

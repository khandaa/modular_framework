"""
Base models for all modules to inherit from
Provides common functionality for database operations
"""
from datetime import datetime
import sqlite3
from flask import g, current_app

class BaseModel:
    """Base model class with common functionality for all models"""
    
    table_name = None
    primary_key = None
    
    def __init__(self, **kwargs):
        """
        Initialize model with provided attributes
        
        Args:
            **kwargs: Key-value pairs for model attributes
        """
        for key, value in kwargs.items():
            setattr(self, key, value)
            
    @classmethod
    def get_db(cls):
        """
        Get database connection
        
        Returns:
            SQLite database connection
        """
        if 'db' not in g:
            g.db = sqlite3.connect(
                current_app.config['DATABASE'],
                detect_types=sqlite3.PARSE_DECLTYPES
            )
            g.db.row_factory = sqlite3.Row
            
        return g.db
        
    @classmethod
    def find_by_id(cls, id):
        """
        Find record by primary key
        
        Args:
            id: Primary key value
            
        Returns:
            Model instance or None if not found
        """
        if not cls.table_name or not cls.primary_key:
            raise ValueError("Model must define table_name and primary_key")
            
        db = cls.get_db()
        query = f"SELECT * FROM {cls.table_name} WHERE {cls.primary_key} = ?"
        result = db.execute(query, (id,)).fetchone()
        
        if result:
            return cls(**dict(result))
        return None
        
    @classmethod
    def find_all(cls, conditions=None, params=None, order_by=None, limit=None, offset=None):
        """
        Find records based on conditions
        
        Args:
            conditions: WHERE clause conditions
            params: Parameters for the query
            order_by: ORDER BY clause
            limit: LIMIT clause
            offset: OFFSET clause
            
        Returns:
            List of model instances
        """
        if not cls.table_name:
            raise ValueError("Model must define table_name")
            
        db = cls.get_db()
        query = f"SELECT * FROM {cls.table_name}"
        
        if conditions:
            query += f" WHERE {conditions}"
            
        if order_by:
            query += f" ORDER BY {order_by}"
            
        if limit:
            query += f" LIMIT {limit}"
            
        if offset:
            query += f" OFFSET {offset}"
            
        params = params or []
        results = db.execute(query, params).fetchall()
        
        return [cls(**dict(row)) for row in results]
        
    def save(self):
        """
        Save record to database (insert or update)
        
        Returns:
            Self instance for method chaining
        """
        if not self.__class__.table_name or not self.__class__.primary_key:
            raise ValueError("Model must define table_name and primary_key")
            
        db = self.__class__.get_db()
        
        # Get all model attributes except special ones
        attrs = {k: v for k, v in self.__dict__.items() 
                if not k.startswith('_') and k != self.__class__.primary_key}
        
        # Check if record exists for update vs insert
        if hasattr(self, self.__class__.primary_key) and getattr(self, self.__class__.primary_key):
            # Update existing record
            set_clause = ", ".join([f"{k} = ?" for k in attrs.keys()])
            query = f"UPDATE {self.__class__.table_name} SET {set_clause} WHERE {self.__class__.primary_key} = ?"
            params = list(attrs.values())
            params.append(getattr(self, self.__class__.primary_key))
            db.execute(query, params)
        else:
            # Insert new record
            columns = ", ".join(attrs.keys())
            placeholders = ", ".join(["?"] * len(attrs))
            query = f"INSERT INTO {self.__class__.table_name} ({columns}) VALUES ({placeholders})"
            result = db.execute(query, list(attrs.values()))
            # Set primary key from inserted row
            if self.__class__.primary_key:
                setattr(self, self.__class__.primary_key, result.lastrowid)
        
        db.commit()
        return self
        
    def delete(self):
        """
        Delete record from database
        
        Returns:
            Boolean indicating success
        """
        if not self.__class__.table_name or not self.__class__.primary_key:
            raise ValueError("Model must define table_name and primary_key")
            
        if not hasattr(self, self.__class__.primary_key) or not getattr(self, self.__class__.primary_key):
            return False
            
        db = self.__class__.get_db()
        query = f"DELETE FROM {self.__class__.table_name} WHERE {self.__class__.primary_key} = ?"
        db.execute(query, (getattr(self, self.__class__.primary_key),))
        db.commit()
        
        return True
        
    def to_dict(self):
        """
        Convert model to dictionary
        
        Returns:
            Dictionary of model attributes
        """
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
        
    def __repr__(self):
        """String representation of model"""
        pk_val = getattr(self, self.__class__.primary_key, None) if self.__class__.primary_key else None
        class_name = self.__class__.__name__
        return f"<{class_name} {self.__class__.primary_key}={pk_val}>" if pk_val else f"<{class_name}>"

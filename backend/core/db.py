"""
Database connection and utilities module.
Handles SQLite connections with support for PostgreSQL in production.
"""
import os
import sqlite3
from flask import current_app, g
import click

def get_db():
    """
    Get database connection, creating it if it doesn't exist
    
    Returns:
        Database connection object
    """
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
        
    return g.db

def close_db(e=None):
    """
    Close database connection if it exists
    
    Args:
        e: Optional exception information
    """
    db = g.pop('db', None)
    
    if db is not None:
        db.close()
        
def init_db():
    """
    Initialize the database with schema
    """
    db = get_db()
    
    # Get schema file path from project root
    schema_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                             'database', 'schema.sql')
    
    with current_app.open_resource(schema_path) as f:
        db.executescript(f.read().decode('utf8'))
        
def init_app(app):
    """
    Register database functions with the Flask app
    
    Args:
        app: Flask application instance
    """
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    
@click.command('init-db')
@click.pass_context
def init_db_command(ctx):
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')

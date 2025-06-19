"""
Core Flask application factory
This module creates and configures the Flask application using a modular blueprint approach.
"""
import os
from flask import Flask
from flask_cors import CORS

def create_app(config=None):
    """
    Application factory for Flask app
    
    Args:
        config: Configuration object or path to config file
        
    Returns:
        Flask application instance
    """
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS for frontend integration
    CORS(app)
    
    # Load default configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
        DATABASE=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                              'database', 'modular_framework.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        TESTING=False,
    )
    
    # Load configuration from config parameter
    if config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        if isinstance(config, dict):
            app.config.from_mapping(config)
        else:
            app.config.from_pyfile(config)
            
    # Ensure instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Register blueprints
    from backend.api_gateway.api.routes import api_gateway_bp
    from backend.module_registry.api.routes import module_registry_bp
    from backend.event_bus.api.routes import event_bus_bp
    
    app.register_blueprint(api_gateway_bp)
    app.register_blueprint(module_registry_bp)
    app.register_blueprint(event_bus_bp)
    
    # Initialize event bus
    with app.app_context():
        from backend.event_bus.api.routes import setup_event_storage
        setup_event_storage()
    
    # Register CLI commands
    register_cli_commands(app)
    
    @app.route('/health')
    def health_check():
        """Basic health check endpoint"""
        return {'status': 'healthy', 'version': '0.1.0'}
    
    return app

def register_cli_commands(app):
    """
    Register CLI commands with the application
    
    Args:
        app: Flask application instance
    """
    @app.cli.command('init-db')
    def init_db_command():
        """Initialize the database."""
        from backend.core.db import init_db
        init_db()
        print('Initialized the database.')

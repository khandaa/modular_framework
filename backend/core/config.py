"""
Configuration management for different environments
"""
import os
from pathlib import Path

# Base directory for the application
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Config:
    """Base configuration class"""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
    
    # Database
    DATABASE = os.path.join(BASE_DIR, 'database', 'modular_framework.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Logging
    LOG_LEVEL = 'INFO'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
    
    # API
    API_TITLE = 'Modular Software Framework API'
    API_VERSION = 'v1'
    
    # Event Bus
    EVENT_BUS_ENABLED = True
    EVENT_PERSISTENCE_ENABLED = True
    
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'
    
class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    DATABASE = os.path.join(BASE_DIR, 'database', 'test.db')
    
class ProductionConfig(Config):
    """Production configuration"""
    # In production, use PostgreSQL
    DATABASE_URL = os.environ.get('DATABASE_URL')
    SECRET_KEY = os.environ.get('SECRET_KEY')  # Must be set in production
    LOG_LEVEL = 'WARNING'
    
# Configuration dictionary for easy access
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config():
    """
    Get configuration based on environment
    
    Returns:
        Configuration class based on FLASK_ENV environment variable
    """
    env = os.environ.get('FLASK_ENV', 'default')
    return config.get(env, config['default'])

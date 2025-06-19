"""
Test configuration for Modular Software Framework
Provides fixtures and configuration for pytest
"""
import os
import tempfile
import pytest
from backend.core.app import create_app
from backend.core.db import get_db, init_db

@pytest.fixture
def app():
    """Create and configure a Flask app for testing"""
    # Create a temporary file to isolate the database for each test
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app({
        'TESTING': True,
        'DATABASE': db_path,
    })
    
    # Create the database and load test data
    with app.app_context():
        init_db()
        
    yield app
    
    # Close and remove the temporary database
    os.close(db_fd)
    os.unlink(db_path)
    
@pytest.fixture
def client(app):
    """A test client for the app"""
    return app.test_client()
    
@pytest.fixture
def runner(app):
    """A test CLI runner for the app"""
    return app.test_cli_runner()
    
class AuthActions:
    """Helper class for authentication in tests"""
    
    def __init__(self, client):
        self._client = client
        
    def login(self, username='admin', password='admin'):
        """Login helper function"""
        return self._client.post(
            '/api/auth/login',
            json={'username': username, 'password': password}
        )
        
    def logout(self):
        """Logout helper function"""
        return self._client.get('/api/auth/logout')
        
@pytest.fixture
def auth(client):
    """Authentication fixture"""
    return AuthActions(client)

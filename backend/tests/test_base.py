"""
Basic tests for the Modular Software Framework
"""
import pytest
from flask import g
from backend.core.models.base import BaseModel

def test_app_exists(app):
    """Test that app exists"""
    assert app is not None

def test_health_endpoint(client):
    """Test that health endpoint returns 200"""
    response = client.get('/health')
    assert response.status_code == 200
    assert response.get_json()['status'] == 'healthy'

def test_base_model():
    """Test BaseModel functionality"""
    # Create a test model class
    class TestModel(BaseModel):
        table_name = 'test_table'
        primary_key = 'id'
        
    # Test model initialization
    model = TestModel(name='Test', value=123)
    assert model.name == 'Test'
    assert model.value == 123
    
    # Test to_dict method
    model_dict = model.to_dict()
    assert isinstance(model_dict, dict)
    assert model_dict['name'] == 'Test'
    assert model_dict['value'] == 123

def test_db_connection(app):
    """Test database connection"""
    with app.app_context():
        db = g.get('db', None)
        assert db is None  # Should be None until get_db() is called
        
        from backend.core.db import get_db
        db = get_db()
        assert db is not None
        
        # Test that get_db returns the same connection
        assert db is get_db()

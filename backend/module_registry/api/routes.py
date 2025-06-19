"""
Module Registry routes
Handles module registration, discovery, and management
"""
import logging
import uuid
import json
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app

from backend.core.utils import json_response, validate_json, handle_errors
from backend.core.db import get_db

logger = logging.getLogger(__name__)

# Create blueprint
module_registry_bp = Blueprint('module_registry', __name__, url_prefix='/api/modules')

# Module status constants
MODULE_STATUS = {
    'ACTIVE': 'active',
    'INACTIVE': 'inactive',
    'ERROR': 'error',
    'PENDING': 'pending'
}

@module_registry_bp.before_app_first_request
def setup_module_registry():
    """Initialize module registry tables on first request"""
    db = get_db()
    cursor = db.cursor()
    
    # Create modules table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        description TEXT,
        entry_point TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'inactive',
        config TEXT,
        dependencies TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        author TEXT,
        license TEXT,
        repository_url TEXT
    )
    ''')
    
    # Create module_events table for tracking state changes
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS module_events (
        id TEXT PRIMARY KEY,
        module_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        data TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES modules (id)
    )
    ''')
    
    db.commit()

@module_registry_bp.route('/', methods=['GET'])
@handle_errors
def list_modules():
    """
    List all registered modules
    
    Query parameters:
    - type: Optional module type filter (backend, frontend)
    - status: Optional status filter
    - search: Optional search term for name/description
    """
    db = get_db()
    cursor = db.cursor()
    
    # Build query with filters
    query = "SELECT * FROM modules WHERE 1=1"
    params = []
    
    module_type = request.args.get('type')
    if module_type:
        query += " AND type = ?"
        params.append(module_type)
        
    status = request.args.get('status')
    if status:
        query += " AND status = ?"
        params.append(status)
        
    search = request.args.get('search')
    if search:
        query += " AND (name LIKE ? OR description LIKE ?)"
        params.extend([f'%{search}%', f'%{search}%'])
        
    # Execute query and fetch results
    cursor.execute(query, params)
    modules = []
    
    for row in cursor.fetchall():
        # Convert row to dict
        module = dict(row)
        
        # Parse JSON fields
        for field in ['config', 'dependencies']:
            if module.get(field):
                try:
                    module[field] = json.loads(module[field])
                except json.JSONDecodeError:
                    module[field] = {}
                    
        modules.append(module)
    
    return json_response({'modules': modules, 'count': len(modules)})

@module_registry_bp.route('/<module_id>', methods=['GET'])
@handle_errors
def get_module(module_id):
    """Get a specific module by ID"""
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM modules WHERE id = ?", (module_id,))
    row = cursor.fetchone()
    
    if not row:
        return json_response({'error': 'Module not found'}, 404)
        
    module = dict(row)
    
    # Parse JSON fields
    for field in ['config', 'dependencies']:
        if module.get(field):
            try:
                module[field] = json.loads(module[field])
            except json.JSONDecodeError:
                module[field] = {}
    
    # Get module events
    cursor.execute(
        "SELECT * FROM module_events WHERE module_id = ? ORDER BY timestamp DESC", 
        (module_id,)
    )
    events = [dict(row) for row in cursor.fetchall()]
    
    module['events'] = events
    
    return json_response(module)

@module_registry_bp.route('/', methods=['POST'])
@handle_errors
@validate_json({
    'name': {'type': 'string', 'required': True},
    'version': {'type': 'string', 'required': True},
    'description': {'type': 'string', 'required': True},
    'entry_point': {'type': 'string', 'required': True},
    'type': {'type': 'string', 'required': True},
    'config': {'type': 'dict', 'required': False},
    'dependencies': {'type': 'list', 'required': False},
    'author': {'type': 'string', 'required': False},
    'license': {'type': 'string', 'required': False},
    'repository_url': {'type': 'string', 'required': False}
})
def register_module():
    """Register a new module"""
    data = request.get_json()
    
    # Validate module type
    if data['type'] not in ['backend', 'frontend']:
        return json_response({'error': 'Invalid module type'}, 400)
    
    # Check if module name+version already exists
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute(
        "SELECT id FROM modules WHERE name = ? AND version = ?",
        (data['name'], data['version'])
    )
    
    if cursor.fetchone():
        return json_response({
            'error': 'Module with this name and version already exists'
        }, 409)
    
    # Generate module ID
    module_id = str(uuid.uuid4())
    
    # Serialize JSON fields
    config = json.dumps(data.get('config', {}))
    dependencies = json.dumps(data.get('dependencies', []))
    
    # Insert module
    now = datetime.now().isoformat()
    cursor.execute(
        """
        INSERT INTO modules (
            id, name, version, description, entry_point, type,
            status, config, dependencies, created_at, updated_at,
            author, license, repository_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            module_id, data['name'], data['version'], data['description'],
            data['entry_point'], data['type'], MODULE_STATUS['INACTIVE'],
            config, dependencies, now, now,
            data.get('author'), data.get('license'), data.get('repository_url')
        )
    )
    
    # Record registration event
    event_id = str(uuid.uuid4())
    cursor.execute(
        """
        INSERT INTO module_events (
            id, module_id, event_type, data, timestamp
        ) VALUES (?, ?, ?, ?, ?)
        """,
        (
            event_id, module_id, 'REGISTERED',
            json.dumps({'status': MODULE_STATUS['INACTIVE']}),
            now
        )
    )
    
    db.commit()
    
    # Publish module registration event
    try:
        from backend.event_bus import event_bus
        event_bus.publish_event(
            event_type='MODULE_REGISTERED',
            source_module='module_registry',
            data={
                'module_id': module_id,
                'name': data['name'],
                'version': data['version'],
                'type': data['type']
            }
        )
    except ImportError:
        logger.warning("Event bus not available, skipping event publication")
    
    return json_response({
        'message': 'Module registered successfully',
        'module_id': module_id
    }, 201)

@module_registry_bp.route('/<module_id>', methods=['PUT'])
@handle_errors
@validate_json({
    'description': {'type': 'string', 'required': False},
    'entry_point': {'type': 'string', 'required': False},
    'config': {'type': 'dict', 'required': False},
    'dependencies': {'type': 'list', 'required': False},
    'status': {'type': 'string', 'required': False},
    'author': {'type': 'string', 'required': False},
    'license': {'type': 'string', 'required': False},
    'repository_url': {'type': 'string', 'required': False}
})
def update_module(module_id):
    """Update an existing module"""
    data = request.get_json()
    
    # Check if module exists
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM modules WHERE id = ?", (module_id,))
    module = cursor.fetchone()
    
    if not module:
        return json_response({'error': 'Module not found'}, 404)
    
    # Build update query and parameters
    update_fields = []
    params = []
    
    for field in ['description', 'entry_point', 'author', 'license', 'repository_url']:
        if field in data:
            update_fields.append(f"{field} = ?")
            params.append(data[field])
    
    # Handle JSON fields
    if 'config' in data:
        update_fields.append("config = ?")
        params.append(json.dumps(data['config']))
    
    if 'dependencies' in data:
        update_fields.append("dependencies = ?")
        params.append(json.dumps(data['dependencies']))
    
    # Handle status change
    status_changed = False
    old_status = dict(module)['status']
    new_status = None
    
    if 'status' in data:
        if data['status'] not in MODULE_STATUS.values():
            return json_response({'error': 'Invalid module status'}, 400)
            
        update_fields.append("status = ?")
        params.append(data['status'])
        status_changed = old_status != data['status']
        new_status = data['status']
    
    # Add updated_at
    update_fields.append("updated_at = ?")
    now = datetime.now().isoformat()
    params.append(now)
    
    # Add module_id to params
    params.append(module_id)
    
    # Execute update
    if update_fields:
        query = f"UPDATE modules SET {', '.join(update_fields)} WHERE id = ?"
        cursor.execute(query, params)
        
        # Record update event
        event_id = str(uuid.uuid4())
        event_data = {}
        
        for field in data:
            if field != 'status':  # Status change gets its own event
                event_data[field] = data[field]
                
        cursor.execute(
            """
            INSERT INTO module_events (
                id, module_id, event_type, data, timestamp
            ) VALUES (?, ?, ?, ?, ?)
            """,
            (
                event_id, module_id, 'UPDATED',
                json.dumps(event_data),
                now
            )
        )
        
        # Record status change event if applicable
        if status_changed:
            event_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO module_events (
                    id, module_id, event_type, data, timestamp
                ) VALUES (?, ?, ?, ?, ?)
                """,
                (
                    event_id, module_id,
                    'STATUS_CHANGED',
                    json.dumps({'old_status': old_status, 'new_status': new_status}),
                    now
                )
            )
            
            # Publish module status event
            try:
                from backend.event_bus import event_bus
                
                # Determine event type based on status
                event_type = None
                if new_status == MODULE_STATUS['ACTIVE']:
                    event_type = 'MODULE_ACTIVATED'
                elif new_status == MODULE_STATUS['INACTIVE']:
                    event_type = 'MODULE_DEACTIVATED'
                else:
                    event_type = 'MODULE_UPDATED'
                
                if event_type:
                    event_bus.publish_event(
                        event_type=event_type,
                        source_module='module_registry',
                        data={
                            'module_id': module_id,
                            'old_status': old_status,
                            'new_status': new_status
                        }
                    )
            except ImportError:
                logger.warning("Event bus not available, skipping event publication")
    
        db.commit()
    
    return json_response({
        'message': 'Module updated successfully',
        'module_id': module_id
    })

@module_registry_bp.route('/<module_id>', methods=['DELETE'])
@handle_errors
def delete_module(module_id):
    """Delete a module"""
    db = get_db()
    cursor = db.cursor()
    
    # Check if module exists
    cursor.execute("SELECT * FROM modules WHERE id = ?", (module_id,))
    module = cursor.fetchone()
    
    if not module:
        return json_response({'error': 'Module not found'}, 404)
    
    # Delete module events first (foreign key constraint)
    cursor.execute("DELETE FROM module_events WHERE module_id = ?", (module_id,))
    
    # Delete module
    cursor.execute("DELETE FROM modules WHERE id = ?", (module_id,))
    
    db.commit()
    
    # Publish module deletion event
    try:
        from backend.event_bus import event_bus
        event_bus.publish_event(
            event_type='MODULE_DELETED',
            source_module='module_registry',
            data={
                'module_id': module_id,
                'name': dict(module)['name'],
                'version': dict(module)['version']
            }
        )
    except ImportError:
        logger.warning("Event bus not available, skipping event publication")
    
    return json_response({
        'message': 'Module deleted successfully'
    })

@module_registry_bp.route('/<module_id>/activate', methods=['POST'])
@handle_errors
def activate_module(module_id):
    """Activate a module"""
    return _change_module_status(module_id, MODULE_STATUS['ACTIVE'])

@module_registry_bp.route('/<module_id>/deactivate', methods=['POST'])
@handle_errors
def deactivate_module(module_id):
    """Deactivate a module"""
    return _change_module_status(module_id, MODULE_STATUS['INACTIVE'])

def _change_module_status(module_id, status):
    """Helper method to change module status"""
    db = get_db()
    cursor = db.cursor()
    
    # Check if module exists
    cursor.execute("SELECT * FROM modules WHERE id = ?", (module_id,))
    module = cursor.fetchone()
    
    if not module:
        return json_response({'error': 'Module not found'}, 404)
    
    # Get current status
    current_status = dict(module)['status']
    
    # Only update if status is different
    if current_status != status:
        now = datetime.now().isoformat()
        
        # Update status
        cursor.execute(
            "UPDATE modules SET status = ?, updated_at = ? WHERE id = ?",
            (status, now, module_id)
        )
        
        # Record status change event
        event_id = str(uuid.uuid4())
        cursor.execute(
            """
            INSERT INTO module_events (
                id, module_id, event_type, data, timestamp
            ) VALUES (?, ?, ?, ?, ?)
            """,
            (
                event_id, module_id,
                'STATUS_CHANGED',
                json.dumps({'old_status': current_status, 'new_status': status}),
                now
            )
        )
        
        db.commit()
        
        # Publish module status event
        try:
            from backend.event_bus import event_bus
            
            # Determine event type based on status
            event_type = None
            if status == MODULE_STATUS['ACTIVE']:
                event_type = 'MODULE_ACTIVATED'
            elif status == MODULE_STATUS['INACTIVE']:
                event_type = 'MODULE_DEACTIVATED'
            
            if event_type:
                event_bus.publish_event(
                    event_type=event_type,
                    source_module='module_registry',
                    data={
                        'module_id': module_id,
                        'name': dict(module)['name'],
                        'version': dict(module)['version'],
                        'old_status': current_status,
                        'new_status': status
                    }
                )
        except ImportError:
            logger.warning("Event bus not available, skipping event publication")
    
    return json_response({
        'message': f'Module {status}',
        'module_id': module_id,
        'status': status
    })

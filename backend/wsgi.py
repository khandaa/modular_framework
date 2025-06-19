"""
WSGI entry point for the modular software framework
"""

from backend.core.app import create_app

# Create application instance
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

"""
WSGI configuration for PythonAnywhere deployment
This file adapts the FastAPI application to work with WSGI servers
"""
import os
import sys

# Add project directory to path
project_home = os.path.dirname(os.path.abspath(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables with ABSOLUTE path for SQLite (required for PythonAnywhere)
# SQLite requires 4 slashes for absolute path: sqlite:////absolute/path
db_path = os.path.join(project_home, 'instance', 'bareeq_alysr.db')
os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'

# Ensure instance directory exists
instance_dir = os.path.join(project_home, 'instance')
if not os.path.exists(instance_dir):
    os.makedirs(instance_dir)

from app.flask_app import flask_app, init_database
from app.main import app as fastapi_app
from fastapi.middleware.wsgi import WSGIMiddleware

# Initialize database
init_database(flask_app)

# For PythonAnywhere, we'll use Flask as the main app and mount FastAPI routes
# This is because PythonAnywhere uses WSGI, not ASGI

# Option 1: Use Flask directly (simpler, but loses FastAPI benefits)
# application = flask_app

# Option 2: Use a2wsgi to convert ASGI to WSGI (recommended)
try:
    from a2wsgi import ASGIMiddleware
    application = ASGIMiddleware(fastapi_app)
except ImportError:
    # Fallback to Flask if a2wsgi is not installed
    print("Warning: a2wsgi not found, using Flask app directly")
    application = flask_app

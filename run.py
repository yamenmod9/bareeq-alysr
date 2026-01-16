"""
Bareeq Al-Yusr - Hybrid FastAPI + Flask Application Runner
Combines FastAPI for API endpoints with Flask for SQLAlchemy and admin
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware

from app.main import app as fastapi_app
from app.flask_app import flask_app, init_database
from app.config import Config


def create_hybrid_app() -> FastAPI:
    """
    Create hybrid FastAPI + Flask application
    
    - FastAPI handles all /api/* routes (main API)
    - Flask handles /flask/* routes (admin, SQLAlchemy)
    - Flask-SQLAlchemy is shared between both
    """
    # Initialize database with Flask app context
    init_database(flask_app)
    
    # Mount Flask app under /flask prefix
    fastapi_app.mount("/flask", WSGIMiddleware(flask_app))
    
    print("✅ Hybrid FastAPI + Flask application created")
    print("📍 FastAPI endpoints: http://localhost:8000/")
    print("📍 Flask endpoints: http://localhost:8000/flask/")
    print("📍 API Documentation: http://localhost:8000/docs")
    
    return fastapi_app


# Create the hybrid application
hybrid_app = create_hybrid_app()


def run_server():
    """Run the hybrid server"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   🌟 Bareeq Al-Yusr - BNPL Platform 🌟                       ║
    ║   بريق اليسر - منصة الشراء الآن والدفع لاحقاً                  ║
    ║                                                              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║                                                              ║
    ║   📍 API Server: http://localhost:8000                       ║
    ║   📖 API Docs:   http://localhost:8000/docs                  ║
    ║   📘 ReDoc:      http://localhost:8000/redoc                 ║
    ║   🔧 Flask:      http://localhost:8000/flask/                ║
    ║                                                              ║
    ║   🧪 Create Test Data:                                       ║
    ║   GET http://localhost:8000/flask/admin/create-test-data     ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "run:hybrid_app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=False,  # Disabled to prevent reload issues
        log_level="info"
    )


if __name__ == "__main__":
    run_server()

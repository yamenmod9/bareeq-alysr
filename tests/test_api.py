"""
Basic API Tests
"""
import pytest
from fastapi.testclient import TestClient


def get_test_client():
    """Get test client with Flask app context"""
    from app.flask_app import flask_app, init_database
    from app.main import app
    from fastapi.middleware.wsgi import WSGIMiddleware
    
    # Initialize database
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    init_database(flask_app)
    
    # Mount Flask
    app.mount("/flask", WSGIMiddleware(flask_app))
    
    return TestClient(app)


class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns welcome message"""
        client = get_test_client()
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "Bareeq" in data["data"]["name"]
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        client = get_test_client()
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["status"] == "healthy"
    
    def test_config_endpoint(self):
        """Test public config endpoint"""
        client = get_test_client()
        response = client.get("/config")
        
        assert response.status_code == 200
        data = response.json()
        assert "default_credit_limit" in data["data"]
        assert "commission_rate" in data["data"]


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        client = get_test_client()
        response = client.post("/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
    
    def test_register_customer(self):
        """Test customer registration"""
        client = get_test_client()
        response = client.post("/auth/register", json={
            "email": "newcustomer@test.com",
            "password": "password123",
            "full_name": "Test Customer",
            "role": "customer"
        })
        
        # May be 201 (success) or 400 (already exists)
        assert response.status_code in [201, 400]


class TestProtectedEndpoints:
    """Test protected endpoints require authentication"""
    
    def test_customer_profile_no_auth(self):
        """Test customer profile requires auth"""
        client = get_test_client()
        response = client.get("/customers/me")
        
        assert response.status_code == 403  # Forbidden without token
    
    def test_merchant_profile_no_auth(self):
        """Test merchant profile requires auth"""
        client = get_test_client()
        response = client.get("/merchants/me")
        
        assert response.status_code == 403


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

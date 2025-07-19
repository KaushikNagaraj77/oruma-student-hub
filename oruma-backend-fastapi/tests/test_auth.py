import pytest
from fastapi.testclient import TestClient


def test_register_user(client: TestClient, test_db):
    """Test user registration"""
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpass123",
        "university": "Test University"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "token" in data
    assert "refreshToken" in data
    assert "user" in data
    assert data["user"]["email"] == user_data["email"]


def test_register_duplicate_email(client: TestClient, test_db):
    """Test registration with duplicate email"""
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpass123",
        "university": "Test University"
    }
    
    # Register first user
    client.post("/api/auth/register", json=user_data)
    
    # Try to register with same email
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 409


def test_login_user(client: TestClient, test_db):
    """Test user login"""
    # Register user first
    register_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpass123",
        "university": "Test University"
    }
    client.post("/api/auth/register", json=register_data)
    
    # Login
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "token" in data
    assert "refreshToken" in data


def test_login_invalid_credentials(client: TestClient, test_db):
    """Test login with invalid credentials"""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "wrongpass"
    }
    
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401


def test_get_current_user(authenticated_client: TestClient, test_db):
    """Test getting current user info"""
    response = authenticated_client.get("/api/auth/me")
    assert response.status_code == 200
    
    data = response.json()
    assert "id" in data
    assert "email" in data
    assert data["email"] == "test@example.com"


def test_unauthorized_access(client: TestClient, test_db):
    """Test accessing protected endpoint without token"""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
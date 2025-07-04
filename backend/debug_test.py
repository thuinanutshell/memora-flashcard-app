import traceback
from app import create_app
from models.base import db
from services.auth_service import AuthService

app = create_app("testing")
app.config["TESTING"] = True
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
app.config["JWT_SECRET_KEY"] = "test-secret"

with app.app_context():
    db.create_all()

    # Test the service directly first
    sample_data = {
        "full_name": "Test User",
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
    }

    print("Testing AuthService directly...")
    try:
        result = AuthService.register_user(sample_data)
        print(f"✅ Service works: {result}")
    except Exception as e:
        print(f"❌ Service error: {e}")
        print(f"Traceback: {traceback.format_exc()}")

    # Test the API endpoint
    print("\nTesting API endpoint...")
    client = app.test_client()

    response = client.post("/auth/register", json=sample_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.get_json()}")

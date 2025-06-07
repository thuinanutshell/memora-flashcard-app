import pytest
from backend.models import db, Folder


class TestFolderRoutes:
    """Test suite for folder-related endpoints"""

    @pytest.fixture(autouse=True)
    def setup(self, test_client):
        """Setup test data before each test"""
        self.client = test_client

        # Clear and recreate database
        with self.client.application.app_context():
            db.drop_all()
            db.create_all()

        # Register and login a test user
        self.client.post(
            "/auth/register",
            json={
                "full_name": "Test User",
                "username": "testuser",
                "email": "test@example.com",
                "password": "testpass",
            },
        )
        login_res = self.client.post(
            "/auth/login", json={"login": "testuser", "password": "testpass"}
        )
        self.access_token = login_res.get_json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.access_token}"}

        # Create a test folder and get its ID
        response = self.client.post(
            "/folder/",
            json={"name": "Test Folder", "description": "Initial description"},
            headers=self.headers,
        )
        assert response.status_code == 201

        # Get the folder ID from database
        with self.client.application.app_context():
            folder = Folder.query.filter_by(name="Test Folder").first()
            self.folder_id = folder.id

    def test_add_folder_success(self):
        """Test creating a new folder"""
        response = self.client.post(
            "/folder/",
            json={"name": "New Folder", "description": "Test description"},
            headers=self.headers,
        )
        assert response.status_code == 201
        assert b"New folder New Folder added" in response.data

    def test_add_folder_duplicate_name(self):
        """Test creating folder with duplicate name"""
        response = self.client.post(
            "/folder/",
            json={"name": "Test Folder", "description": "Duplicate test"},
            headers=self.headers,
        )
        assert response.status_code == 409
        assert b"Folder name already exists" in response.data

    def test_get_folders(self):
        """Test retrieving all folders for a user"""
        response = self.client.get("/folder/", headers=self.headers)
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data["folders"], list)
        assert any(f["name"] == "Test Folder" for f in data["folders"])

    def test_get_single_folder(self):
        """Test retrieving a specific folder"""
        response = self.client.get(f"/folder/{self.folder_id}", headers=self.headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data["name"] == "Test Folder"
        assert isinstance(data["decks"], list)

    def test_get_nonexistent_folder(self):
        """Test retrieving a folder that doesn't exist"""
        response = self.client.get("/folder/9999", headers=self.headers)
        assert response.status_code == 404
        assert b"Folder not found" in response.data

    def test_update_folder_name(self):
        """Test updating a folder's name"""
        response = self.client.patch(
            f"/folder/{self.folder_id}",
            json={"name": "Updated Name"},
            headers=self.headers,
        )
        assert response.status_code == 200
        assert b"Updated Name" in response.data

    def test_update_folder_description(self):
        """Test updating a folder's description"""
        response = self.client.patch(
            f"/folder/{self.folder_id}",
            json={"description": "Updated description"},
            headers=self.headers,
        )
        assert response.status_code == 200
        assert b"Updated description" in response.data

    def test_update_folder_duplicate_name(self):
        """Test updating to a duplicate folder name"""
        # Create second folder
        self.client.post(
            "/folder/",
            json={"name": "Second Folder", "description": "Test"},
            headers=self.headers,
        )

        # Try to rename first folder to same name
        response = self.client.patch(
            f"/folder/{self.folder_id}",
            json={"name": "Second Folder"},
            headers=self.headers,
        )
        assert response.status_code == 409
        assert b"Folder name already exists" in response.data

    def test_delete_folder(self):
        """Test deleting a folder"""
        response = self.client.delete(f"/folder/{self.folder_id}", headers=self.headers)
        assert response.status_code == 200
        assert b"Deleted folder" in response.data

        # Verify folder is gone
        verify_res = self.client.get(f"/folder/{self.folder_id}", headers=self.headers)
        assert verify_res.status_code == 404

    def test_unauthorized_access(self):
        """Test endpoints without authentication"""
        endpoints = [
            ("GET", "/folder/", None),
            ("GET", f"/folder/{self.folder_id}", None),
            ("POST", "/folder/", {"name": "Test", "description": "Test"}),
            ("PATCH", f"/folder/{self.folder_id}", {"name": "Test"}),
            ("DELETE", f"/folder/{self.folder_id}", None),
        ]

        for method, endpoint, data in endpoints:
            if method == "GET":
                response = self.client.get(endpoint)
            elif method == "POST":
                response = self.client.post(endpoint, json=data)
            elif method == "PATCH":
                response = self.client.patch(endpoint, json=data)
            elif method == "DELETE":
                response = self.client.delete(endpoint)
            assert response.status_code == 401

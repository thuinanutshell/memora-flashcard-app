import pytest
from services.crud_service import CRUDService
from models import User, Folder, db


class TestCRUDService:

    @pytest.fixture(autouse=True)
    def setup_user(self, app):
        """Create a test user for each test method."""
        with app.app_context():
            self.user = User(
                full_name="Test User",
                username="testuser",
                email="test@example.com",
                password_hash="hashed_password",
            )
            db.session.add(self.user)
            db.session.commit()
            self.user_id = self.user.id

    def test_add_new_folder_success(self, app):
        """Test successful folder creation."""
        with app.app_context():
            folder_data = {"name": "Math", "description": "Mathematics study materials"}

            result = CRUDService.add_new_folder(folder_data, self.user_id)

            assert "data" in result
            assert result["data"]["name"] == "Math"
            assert result["data"]["description"] == "Mathematics study materials"

            # Check database
            folder = Folder.query.filter_by(name="Math").first()
            assert folder is not None
            assert folder.user_id == self.user_id

    def test_add_new_folder_missing_name(self, app):
        """Test folder creation without name."""
        with app.app_context():
            folder_data = {"description": "No name provided"}

            with pytest.raises(ValueError, match="Folder name is required"):
                CRUDService.add_new_folder(folder_data, self.user_id)

    def test_get_all_folders(self, app):
        """Test getting all folders for a user."""
        with app.app_context():
            # Create test folders
            folder1 = Folder(
                name="Math", description="Math stuff", user_id=self.user_id
            )
            folder2 = Folder(
                name="Science", description="Science stuff", user_id=self.user_id
            )

            db.session.add_all([folder1, folder2])
            db.session.commit()

            result = CRUDService.get_all_folders(self.user_id)

            assert "data" in result
            assert len(result["data"]) == 2
            folder_names = [f["name"] for f in result["data"]]
            assert "Math" in folder_names
            assert "Science" in folder_names

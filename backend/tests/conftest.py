import os
import tempfile
from pathlib import Path


_test_database_directory = tempfile.TemporaryDirectory(prefix="medikart-tests-")
_test_database_path = Path(_test_database_directory.name) / "medikart-tests.db"

os.environ["DATABASE_URL"] = f"sqlite:///{_test_database_path.as_posix()}"
os.environ["SECRET_KEY"] = "test-secret-key-with-at-least-32-characters"
os.environ["APP_ENV"] = "development"

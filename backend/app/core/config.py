from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Task Flow"
    API_V1_STR: str = "/api/v1"
    
    # SQLite 
    SQLITE_DB_FILE: str = "data/task_flow.db"
    SQLALCHEMY_DATABASE_URL: str = f"sqlite:///./{SQLITE_DB_FILE}"

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure data directory exists
os.makedirs(os.path.dirname(os.path.join(os.getcwd(), settings.SQLITE_DB_FILE)), exist_ok=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.models import base  # Import models to ensure they are registered

# Create tables
base.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to Task Flow API"}

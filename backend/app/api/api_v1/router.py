from fastapi import APIRouter
from app.api.api_v1.endpoints import work_items, comments, logs, recycle_bin

api_router = APIRouter()
api_router.include_router(work_items.router, prefix="/work-items", tags=["work-items"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(recycle_bin.router, prefix="/recycle-bin", tags=["recycle-bin"])

from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.db.session import get_db
from app.services.work_item_service import work_item_service

router = APIRouter()

@router.delete("/{id}", response_model=schemas.ResponseBase[Any])
def delete_comment(
    *,
    db: Session = Depends(get_db),
    id: int
):
    comment = crud.comment.get(db, id=id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    crud.comment.remove(db, id=id)
    return {"code": 200, "data": None, "message": "Comment deleted"}

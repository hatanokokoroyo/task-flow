from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.db.session import get_db
from app.services.work_item_service import work_item_service

router = APIRouter()

@router.get("/", response_model=schemas.ResponseBase[List[schemas.WorkItem]])
def read_deleted_items(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    items = crud.work_item.get_deleted_multi(db, skip=skip, limit=limit)
    return {"code": 200, "data": items, "message": "Success"}

@router.post("/{id}/restore", response_model=schemas.ResponseBase[schemas.WorkItem])
def restore_work_item(
    *,
    db: Session = Depends(get_db),
    id: int
):
    item = work_item_service.restore(db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Work item not found")
    return {"code": 200, "data": item, "message": "Restored successfully"}

@router.delete("/{id}", response_model=schemas.ResponseBase[Any])
def permanently_delete_work_item(
    *,
    db: Session = Depends(get_db),
    id: int
):
    item = crud.work_item.get(db, id=id)
    if not item or not item.is_deleted:
        raise HTTPException(status_code=404, detail="Work item not found in recycle bin")
    crud.work_item.remove(db, id=id)
    return {"code": 200, "data": None, "message": "Permanently deleted"}

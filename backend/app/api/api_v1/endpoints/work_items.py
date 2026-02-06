from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import crud, schemas
from app.db.session import get_db
from app.services.work_item_service import work_item_service

router = APIRouter()

@router.get("/", response_model=schemas.ResponseBase[List[schemas.WorkItem]])
def read_work_items(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_desc: bool = True
):
    items = crud.work_item.get_active_multi(
        db, skip=skip, limit=limit, status=status, search=search, sort_by=sort_by, sort_desc=sort_desc
    )
    return {"code": 200, "data": items, "message": "Success"}

@router.post("/", response_model=schemas.ResponseBase[schemas.WorkItem])
def create_work_item(
    *,
    db: Session = Depends(get_db),
    item_in: schemas.WorkItemCreate
):
    item = work_item_service.create_work_item(db, obj_in=item_in)
    return {"code": 200, "data": item, "message": "Created successfully"}

@router.get("/{id}", response_model=schemas.ResponseBase[schemas.WorkItem])
def read_work_item(
    *,
    db: Session = Depends(get_db),
    id: int
):
    item = crud.work_item.get(db, id=id)
    if not item or item.is_deleted:
        raise HTTPException(status_code=404, detail="Work item not found")
    
    # In a real app we might want to attach comments/children here
    # For now, let's keep it simple as per spec
    return {"code": 200, "data": item, "message": "Success"}

@router.patch("/{id}/status", response_model=schemas.ResponseBase[schemas.WorkItem])
def update_work_item_status(
    *,
    db: Session = Depends(get_db),
    id: int,
    status_in: schemas.WorkItemStatusUpdate
):
    item = crud.work_item.get(db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Work item not found")
    updated_item = work_item_service.update_status(db, db_obj=item, obj_in=status_in)
    return {"code": 200, "data": updated_item, "message": "Status updated"}

@router.delete("/{id}", response_model=schemas.ResponseBase[Any])
def delete_work_item(
    *,
    db: Session = Depends(get_db),
    id: int
):
    item = work_item_service.soft_delete(db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Work item not found")
    return {"code": 200, "data": None, "message": "Moved to recycle bin"}

@router.post("/{id}/comments", response_model=schemas.ResponseBase[schemas.Comment])
def create_comment(
    *,
    db: Session = Depends(get_db),
    id: int,
    comment_in: schemas.CommentBase
):
    item = crud.work_item.get(db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Work item not found")
    
    full_comment_in = schemas.CommentCreate(content=comment_in.content, work_item_id=id)
    comment = work_item_service.add_comment(db, obj_in=full_comment_in)
    return {"code": 200, "data": comment, "message": "Comment added"}

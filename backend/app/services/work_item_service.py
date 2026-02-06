from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional, Any
from app import crud
from app.models.work_item import WorkItem
from app.schemas.work_item import WorkItemCreate, WorkItemUpdate, WorkItemStatusUpdate
from app.schemas.activity_log import ActivityLogBase
from app.schemas.comment import CommentCreate

class WorkItemService:
    def create_work_item(self, db: Session, *, obj_in: WorkItemCreate) -> WorkItem:
        # Create work item
        db_obj = crud.work_item.create(db, obj_in=obj_in)
        
        # Create log
        log_in = ActivityLogBase(
            work_item_id=db_obj.id,
            action_type="CREATE",
            new_value=db_obj.status,
            summary=f"Created work item: {db_obj.title}"
        )
        crud.activity_log.create(db, obj_in=log_in)
        
        return db_obj

    def update_status(self, db: Session, *, db_obj: WorkItem, obj_in: WorkItemStatusUpdate) -> WorkItem:
        old_status = db_obj.status
        if old_status == obj_in.status:
            return db_obj
            
        updated_obj = crud.work_item.update(db, db_obj=db_obj, obj_in=obj_in)
        
        # Create log
        log_in = ActivityLogBase(
            work_item_id=db_obj.id,
            action_type="STATUS_CHANGE",
            old_value=old_status,
            new_value=obj_in.status,
            summary=f"Changed status from {old_status} to {obj_in.status}"
        )
        crud.activity_log.create(db, obj_in=log_in)
        
        return updated_obj

    def soft_delete(self, db: Session, *, id: int) -> WorkItem:
        db_obj = crud.work_item.get(db, id=id)
        if not db_obj:
            return None
        
        update_data = {
            "is_deleted": True,
            "deleted_at": datetime.now(timezone.utc)
        }
        updated_obj = crud.work_item.update(db, db_obj=db_obj, obj_in=update_data)
        return updated_obj

    def restore(self, db: Session, *, id: int) -> WorkItem:
        db_obj = crud.work_item.get(db, id=id)
        if not db_obj:
            return None
        
        update_data = {
            "is_deleted": False,
            "deleted_at": None
        }
        updated_obj = crud.work_item.update(db, db_obj=db_obj, obj_in=update_data)
        return updated_obj

    def add_comment(self, db: Session, *, obj_in: CommentCreate) -> Any:
        comment_obj = crud.comment.create(db, obj_in=obj_in)
        
        # Create log
        log_in = ActivityLogBase(
            work_item_id=obj_in.work_item_id,
            action_type="COMMENT_ADD",
            summary=f"Added a comment: {obj_in.content[:50]}..."
        )
        crud.activity_log.create(db, obj_in=log_in)
        
        return comment_obj

work_item_service = WorkItemService()

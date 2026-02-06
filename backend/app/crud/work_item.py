from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.crud.base import CRUDBase
from app.models.work_item import WorkItem
from app.schemas.work_item import WorkItemCreate, WorkItemUpdate

class CRUDWorkItem(CRUDBase[WorkItem, WorkItemCreate, WorkItemUpdate]):
    def get_active_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100, 
        status: Optional[str] = None, 
        search: Optional[str] = None,
        sort_by: Optional[str] = "created_at",
        sort_desc: bool = True
    ) -> List[WorkItem]:
        query = db.query(self.model).filter(WorkItem.is_deleted == False)
        if status:
            query = query.filter(WorkItem.status == status)
        if search:
            query = query.filter(
                or_(
                    WorkItem.title.contains(search),
                    WorkItem.content.contains(search)
                )
            )
        
        # Sorting
        if hasattr(WorkItem, sort_by):
            sort_attr = getattr(WorkItem, sort_by)
            if sort_desc:
                query = query.order_by(sort_attr.desc())
            else:
                query = query.order_by(sort_attr.asc())
        
        return query.offset(skip).limit(limit).all()

    def get_deleted_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[WorkItem]:
        return db.query(self.model).filter(WorkItem.is_deleted == True).offset(skip).limit(limit).all()

work_item = CRUDWorkItem(WorkItem)

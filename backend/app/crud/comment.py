from typing import List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.comment import Comment
from app.schemas.comment import CommentCreate

class CRUDComment(CRUDBase[Comment, CommentCreate, CommentCreate]):
    def get_by_work_item(self, db: Session, *, work_item_id: int) -> List[Comment]:
        return db.query(self.model).filter(Comment.work_item_id == work_item_id).all()

comment = CRUDComment(Comment)

from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date as date_obj
from app.crud.base import CRUDBase
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import ActivityLogBase

class CRUDActivityLog(CRUDBase[ActivityLog, ActivityLogBase, ActivityLogBase]):
    def get_by_date(self, db: Session, *, target_date: date_obj) -> List[ActivityLog]:
        return db.query(self.model).filter(func.date(ActivityLog.created_at) == target_date).all()

    def get_daily_counts(self, db: Session) -> List[dict]:
        results = db.query(
            func.date(ActivityLog.created_at).label("date"),
            func.count(ActivityLog.id).label("count")
        ).group_by(func.date(ActivityLog.created_at)).all()
        return [{"date": str(r.date), "count": r.count} for r in results]

activity_log = CRUDActivityLog(ActivityLog)

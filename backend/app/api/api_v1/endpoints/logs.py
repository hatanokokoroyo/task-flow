from typing import List, Optional, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from app import crud, schemas
from app.db.session import get_db

router = APIRouter()

@router.get("/daily", response_model=schemas.ResponseBase[List[schemas.DailyLogCount]])
def read_daily_counts(
    db: Session = Depends(get_db)
):
    counts = crud.activity_log.get_daily_counts(db)
    return {"code": 200, "data": counts, "message": "Success"}

@router.get("/", response_model=schemas.ResponseBase[List[schemas.ActivityLog]])
def read_logs_by_date(
    db: Session = Depends(get_db),
    date_str: Optional[str] = Query(None, alias="date")
):
    if date_str:
        try:
            target_date = date.fromisoformat(date_str)
            logs = crud.activity_log.get_by_date(db, target_date=target_date)
        except ValueError:
            return {"code": 400, "data": None, "message": "Invalid date format. Use YYYY-MM-DD"}
    else:
        logs = crud.activity_log.get_multi(db)
    
    return {"code": 200, "data": logs, "message": "Success"}

@router.get("/export")
def export_logs(
    db: Session = Depends(get_db)
):
    # Minimal implementation for now
    logs = crud.activity_log.get_multi(db)
    md_content = "# Activity Logs\n\n"
    for log in logs:
        md_content += f"## {log.created_at}\n- Action: {log.action_type}\n- Summary: {log.summary}\n\n"
    
    return {"code": 200, "data": md_content, "message": "Success"}

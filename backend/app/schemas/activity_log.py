from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ActivityLogBase(BaseModel):
    work_item_id: Optional[int] = None
    action_type: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    summary: Optional[str] = None

class ActivityLog(ActivityLogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

class DailyLogCount(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    date: str
    count: int

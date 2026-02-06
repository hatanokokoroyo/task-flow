from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional
from .comment import Comment

class WorkItemBase(BaseModel):
    title: str = Field(..., max_length=200)
    content: Optional[str] = Field(None, max_length=5000)
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    parent_id: Optional[int] = None

class WorkItemCreate(WorkItemBase):
    pass

class WorkItemUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    parent_id: Optional[int] = None

class WorkItemStatusUpdate(BaseModel):
    status: str

class WorkItem(WorkItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    
    # New fields for progress and metrics
    comment_count: int = 0
    total_children: int = 0
    completed_children: int = 0
    progress_percentage: float = 0.0

class WorkItemDetail(WorkItem):
    model_config = ConfigDict(from_attributes=True)

    children: List["WorkItem"] = []
    comments: List[Comment] = []

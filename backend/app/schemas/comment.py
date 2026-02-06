from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class CommentBase(BaseModel):
    content: str = Field(..., max_length=2000)

class CommentCreate(CommentBase):
    work_item_id: int

class Comment(CommentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    work_item_id: int
    created_at: datetime

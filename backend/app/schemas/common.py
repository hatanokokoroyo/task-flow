from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, TypeVar, Generic

T = TypeVar("T")

class ResponseBase(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)
    
    code: int = 200
    data: Optional[T] = None
    message: str = ""

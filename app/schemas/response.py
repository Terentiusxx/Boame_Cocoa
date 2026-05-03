from pydantic import BaseModel, ConfigDict
from typing import Optional, TypeVar, Generic #Any

# Create a TypeVar so 'data' can be any specific schema (like AdminOut)
T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None

    # This allows Pydantic to read SQLAlchemy database objects
    model_config = ConfigDict(from_attributes=True)

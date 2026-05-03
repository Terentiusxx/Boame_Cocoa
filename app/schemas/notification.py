from pydantic import BaseModel, ConfigDict, computed_field
from datetime import datetime
from typing import Optional
#=========================================================#
#                      NOTIFICATION OUT SCHEMA            #
#=========================================================#

class NotificationOut(BaseModel):
    id: int
    title: str
    content: str
    is_read: bool
    created_at: datetime
    # Include the specific IDs
    admin_id: Optional[int] = None
    expert_id: Optional[int] = None
    user_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def role(self) -> str:
        if self.admin_id: return "admin"
        if self.expert_id: return "expert"
        return "user"

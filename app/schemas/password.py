from pydantic import BaseModel, field_validator
from typing import Optional
from app.security import validate_password_strength

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    def validate_new_password(cls, value: str) -> str:
        return validate_password_strength(value)
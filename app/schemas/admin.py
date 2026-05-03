
from pydantic import BaseModel, EmailStr, Field, ConfigDict, constr, field_validator
from typing import Optional, Generic, TypeVar
from datetime import datetime
from app.security import validate_password_strength 



#=========================================================#
#                  ADMIN BASE SCHEMA                      #
#=========================================================#
class AdminBase(BaseModel):
    first_name: constr(min_length=1, max_length=30)
    mid_name: Optional[constr(max_length=15)] = None
    last_name: constr(min_length=1, max_length=30)
    email: EmailStr
    telephone: constr(max_length=20)          
    image_url: Optional[str] = None                     


#=========================================================#
#                   ADMIN CREATE SCHEMA                   #
#=========================================================#
class AdminCreate(AdminBase):
    password: str

    # Password validator
    @field_validator("password")
    def validate_password(cls, password: str) -> str:
        return validate_password_strength(password)

#=========================================================#
#                ADMIN UPDATE SCHEMA                      #
#=========================================================#
class AdminUpdate(BaseModel):
    first_name: Optional[constr(max_length=30)] = None
    mid_name: Optional[constr(max_length=15)] = None
    last_name: Optional[constr(max_length=30)] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    telephone: Optional[constr(max_length=20)] = None        
    image_url: Optional[str] = None  

    # Convert empty strings to None
    @field_validator("*", mode="before")
    def empty_string_to_none(cls, v):
        return None if v == "" else v

    # Password validator
    @field_validator("password")
    def validate_password(cls, password: Optional[str]) -> Optional[str]:
        if password is not None:
            return validate_password_strength(password)
        return password

#=========================================================#
#                   ADMIN OUT SCHEMA                      #
#=========================================================#

class AdminOut(AdminBase):
    admin_id: int
    role: str = "Admin"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
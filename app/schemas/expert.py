
# from pydantic import BaseModel, constr, EmailStr, Field, field_validator, ConfigDict
# from typing import Optional
# from datetime import datetime
# from app.security import validate_password_strength  


# #=========================================================#
# #                   EXPERT BASE SCHEMA                    #
# #=========================================================#
# class ExpertBase(BaseModel):
#     first_name: constr(min_length=1, max_length=30)
#     mid_name: Optional[constr(max_length=30)] = None
#     last_name: constr(min_length=1, max_length=30)
#     email: EmailStr
#     telephone: constr(pattern=r'^\+?[0-9]{7,15}$')

#     city: Optional[str]
#     region: Optional[str]
#     country: Optional[str]

#     latitude: Optional[float]
#     longitude: Optional[float]
#     image_url: Optional[str]
#     specialization: str
#     organization: Optional[str] = None
#     bio: Optional[constr(max_length=500)] = None
#     years_experienced: int = Field(..., ge=0)
#     license_id: str


# #=========================================================#
# #                   EXPERT CREATE SCHEMA                    #
# #=========================================================#
# class ExpertCreate(ExpertBase):
#     password: str

#     # Validate password on creation
#     @field_validator("password")
#     def validate_password(cls, v: str) -> str:
#         return validate_password_strength(v)


# #=========================================================#
# #                   EXPERT UPDATE SCHEMA                    #
# #=========================================================#
# class ExpertUpdate(BaseModel):
#     first_name: Optional[constr(max_length=30)] = None
#     mid_name: Optional[constr(max_length=30)] = None
#     last_name: Optional[constr(max_length=30)] = None
#     email: Optional[EmailStr] = None
#     telephone: Optional[constr(pattern=r'^\+?[0-9]{7,15}$')] = None
#     city: Optional[str] = None
#     region: Optional[str] = None
#     country: Optional[str] = None
#     latitude: Optional[float]
#     longitude: Optional[float]
#     image_url: Optional[str]
#     specialization: Optional[str] = None
#     organization: Optional[str] = None
#     bio: Optional[constr(max_length=500)] = None
#     years_experienced: Optional[int] = None
#     license_id: Optional[str] = None
#     password: Optional[str] = None

#     # Convert empty strings to None
#     @field_validator("*", mode="before")
#     def empty_to_none(cls, v):
#         return None if v == "" else v

#     # Validate password if provided
#     @field_validator("password")
#     def validate_password(cls, v: Optional[str]) -> Optional[str]:
#         if v is not None:
#             return validate_password_strength(v)
#         return v


# #=========================================================#
# #             ADMIN VERIFY EXPERT BASE SCHEMA             #
# #=========================================================#
# class ExpertVerify(BaseModel):
#     is_verified: bool = True


# #=========================================================#
# #                   EXPERT OUT SCHEMA                     #
# #=========================================================#

# class ExpertOut(ExpertBase):
#     expert_id: int
#     is_verified: bool
#     rating: float = Field(0.0, ge=0, le=5)
#     verified_by_admin_id: Optional[int] = None
#     verified_at: Optional[datetime] = None
#     created_at: datetime

#     model_config = ConfigDict(from_attributes=True)






from pydantic import BaseModel, constr, EmailStr, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from app.security import validate_password_strength
import re

#=========================================================#
#                   EXPERT BASE SCHEMA                    #
#=========================================================#
class ExpertBase(BaseModel):
    first_name: constr(min_length=1, max_length=30)
    mid_name: Optional[constr(max_length=30)] = None
    last_name: constr(min_length=1, max_length=30)
    email: EmailStr
    telephone: constr(pattern=r'^\+?[0-9]{7,15}$')
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    specialization: str
    organization: Optional[str] = None
    bio: Optional[constr(max_length=500)] = None
    years_experienced: int = Field(..., ge=0)
    license_id: str
    license_doc_url: str     
    #license_doc_url: Optional[str] = None         # ← add this


#=========================================================#
#                   EXPERT CREATE SCHEMA                  #
#=========================================================#
class ExpertCreate(ExpertBase):
    password: str

    @field_validator("password")
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)

    @field_validator("license_id")
    def validate_license_format(cls, v: str) -> str:
        v = v.strip().upper()
        # Accepts formats like: GH-123456, COCOA-2024001, GHS-98765
        # Adjust this pattern to match your country's actual license format
        if not re.match(r"^[A-Z]{2,10}-\d{4,10}$", v):
            raise ValueError(
                "Invalid license ID format. Expected format: XX-123456 (e.g. GH-123456, GHS-98765)"
            )
        return v


#=========================================================#
#                   EXPERT UPDATE SCHEMA                  #
#=========================================================#
class ExpertUpdate(BaseModel):
    first_name: Optional[constr(max_length=30)] = None
    mid_name: Optional[constr(max_length=30)] = None
    last_name: Optional[constr(max_length=30)] = None
    email: Optional[EmailStr] = None
    telephone: Optional[constr(pattern=r'^\+?[0-9]{7,15}$')] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    license_doc_url: Optional[str] = None             
    specialization: Optional[str] = None
    organization: Optional[str] = None
    bio: Optional[constr(max_length=500)] = None
    years_experienced: Optional[int] = None
    license_id: Optional[str] = None
    password: Optional[str] = None

    @field_validator("*", mode="before")
    def empty_to_none(cls, v):
        return None if v == "" else v

    @field_validator("license_id")
    def validate_license_format(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().upper()
            if not re.match(r"^[A-Z]{2,10}-\d{4,10}$", v):
                raise ValueError(
                    "Invalid license ID format. Expected format: XX-123456 (e.g. GH-123456, GHS-98765)"
                )
        return v

    @field_validator("password")
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_password_strength(v)
        return v


#=========================================================#
#             ADMIN VERIFY EXPERT BASE SCHEMA             #
#=========================================================#
class ExpertVerify(BaseModel):
    is_verified: bool = True


#=========================================================#
#                   EXPERT OUT SCHEMA                     #
#=========================================================#
class ExpertOut(ExpertBase):
    expert_id: int
    is_verified: bool
    rating: float = Field(0.0, ge=0, le=5)
    verified_by_admin_id: Optional[int] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
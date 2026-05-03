
# from pydantic import BaseModel, constr, EmailStr, Field, field_validator, ConfigDict
# from typing import Optional, Literal
# from datetime import datetime
# from app.security import validate_password_strength

# #=========================================================#
# #                      USER BASE SCHEMA                   #
# #=========================================================#
# class UserBase(BaseModel):
#     first_name: constr(min_length=1, max_length=30) 
#     mid_name: Optional[constr(max_length=15)] = None
#     last_name: constr(min_length=1, max_length=30)
#     email: EmailStr
#     telephone: constr(pattern=r'^\+?[0-9]{7,15}$')
#     role: str = "Customer"

#     city: Optional[str]
#     region: Optional[str]
#     country: Optional[str]

#     latitude: Optional[float]
#     longitude: Optional[float]
#     image_url: Optional[str]


# #=========================================================#
# #                      USER CREATE SCHEMA                 #
# #=========================================================#
# class UserCreate(UserBase):
#     password: str

#     # Password validator
#     @field_validator("password")
#     def validate_password(cls, password: str) -> str:
#         return validate_password_strength(password)


# from pydantic import BaseModel, field_validator
# from typing import Optional
# from app.security import validate_password_strength

# class PasswordUpdate(BaseModel):
#     current_password: str
#     new_password: str

#     @field_validator("new_password")
#     def validate_new_password(cls, value: str) -> str:
#         return validate_password_strength(value)



# #=========================================================#
# #                      USER UPDATE SCHEMA                 #
# #=========================================================#
# class UserUpdate(BaseModel):
#     first_name: Optional[constr(max_length=30)] = None
#     mid_name: Optional[constr(max_length=15)] = None
#     last_name: Optional[constr(max_length=30)] = None
#     email: Optional[EmailStr] = None
#     telephone: Optional[constr(pattern=r'^\+?[0-9]{7,15}$')] = None
#    # password: Optional[str] = None
#     role: Optional[Literal["Customer"]] = None
#     city: Optional[str] = None
#     region: Optional[str] = None
#     country: Optional[str] = None
#     latitude: Optional[float] = None
#     longitude: Optional[float] = None
#     image_url: Optional[str] = None

#     # Convert empty strings to None
#     @field_validator("*", mode="before")
#     def empty_string_to_none(cls, v):
#         return None if v == "" else v

#     # # Password validator
#     # @field_validator("password")
#     # def validate_password(cls, password: Optional[str]) -> Optional[str]:
#     #     if password is not None:
#     #         return validate_password_strength(password)
#     #     return password


# #=========================================================#
# #                      USER OUTPUT SCHEMA                 #
# #=========================================================#
# class UserOut(UserBase):
#     user_id: int
#     created_at: datetime = Field(..., example="2026-01-13T12:00:00Z")
#     last_login: Optional[datetime] = Field(None, example="2026-01-13T15:00:00Z")

#     model_config = ConfigDict(from_attributes=True)




from pydantic import BaseModel, constr, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, Literal
from datetime import datetime
from app.security import validate_password_strength


# ========================================================= #
#                      USER BASE SCHEMA
# ========================================================= #
class UserBase(BaseModel):
    first_name: constr(min_length=1, max_length=30)
    mid_name: Optional[constr(max_length=15)] = None
    last_name: constr(min_length=1, max_length=30)
    email: EmailStr
    telephone: constr(pattern=r'^\+?[0-9]{7,15}$')
    role: str = "Customer"

    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None


# ========================================================= #
#                      USER CREATE SCHEMA
# ========================================================= #
class UserCreate(UserBase):
    password: str

    @field_validator("password")
    def validate_password(cls, password: str) -> str:
        return validate_password_strength(password)


# ========================================================= #
#                      PASSWORD UPDATE SCHEMA
# ========================================================= #
class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    def validate_new_password(cls, value: str) -> str:
        return validate_password_strength(value)


# ========================================================= #
#                      USER UPDATE SCHEMA
# ========================================================= #
class UserUpdate(BaseModel):
    first_name: Optional[constr(max_length=30)] = None
    mid_name: Optional[constr(max_length=15)] = None
    last_name: Optional[constr(max_length=30)] = None
    email: Optional[EmailStr] = None
    telephone: Optional[constr(pattern=r'^\+?[0-9]{7,15}$')] = None

    role: Optional[Literal["Customer"]] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None

    @field_validator("*", mode="before")
    def empty_string_to_none(cls, v):
        return None if v == "" else v


# ========================================================= #
#                      USER OUTPUT SCHEMA
# ========================================================= #
class UserOut(UserBase):
    user_id: int
    created_at: datetime = Field(..., example="2026-01-13T12:00:00Z")
    last_login: Optional[datetime] = Field(None, example="2026-01-13T15:00:00Z")

    model_config = ConfigDict(from_attributes=True)
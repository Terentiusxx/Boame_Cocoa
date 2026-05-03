from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

#=========================================================#
#                     LOGIN REQUEST SCHEMA                #
#=========================================================#
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

#=========================================================#
#                   TOKEN RESPONSE SCHEMA                 #
#=========================================================#
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    first_name: str
    last_name: str
    mid_name: Optional[str] = None
    email: str
    telephone: str

    model_config = ConfigDict(from_attributes=True)

#=========================================================#
#                TOKEN DATA FROM JWT                      #
#=========================================================#
class TokenData(BaseModel):
    user_id: int
    role: str

    model_config = ConfigDict(from_attributes=True)